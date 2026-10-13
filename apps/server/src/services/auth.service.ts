import bcrypt from 'bcryptjs'
import type { z } from 'zod'
import { badRequest, conflict, notFound, unauthorized } from '../lib/errors.js'
import {
  roleToArray,
  signResetToken,
  signToken,
  toAuthUser,
  verifyResetToken,
} from '../lib/jwt.js'
import { sendOtpEmail, sendPasswordChangedEmail } from '../lib/mail.js'
import { saveOtp, verifyOtp as verifyOtpCode } from '../lib/otp.js'
import { prisma } from '../lib/prisma.js'
import { checkEmailRateLimit, setEmailRateLimit } from '../lib/redis.js'
import type {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
  verifyResetOtpSchema,
} from '../validators/schemas.js'

function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function devOtpFallback(otp: string) {
  return process.env.NODE_ENV !== 'production' ? { otp } : {}
}

async function issueOtp(
  email: string,
  purpose: 'registration' | 'password_reset'
) {
  const rateLimit = await checkEmailRateLimit(email)
  if (!rateLimit.allowed) {
    throw badRequest(
      `请稍后再试，${rateLimit.remainingSeconds} 秒后可重新发送。`
    )
  }

  const otp = generateOtp()
  await saveOtp(email, otp, purpose)
  await sendOtpEmail(email, otp, purpose)
  await setEmailRateLimit(email)
  return otp
}

async function buildAuthResponse(user: {
  id: string
  accountNo: string
  email: string
  role: string
}) {
  const payload = {
    sub: user.id,
    accountNo: user.accountNo,
    email: user.email,
    role: roleToArray(user.role),
  }
  const { token: accessToken, exp } = signToken(payload)

  return {
    accessToken,
    user: toAuthUser(payload, exp),
  }
}

export async function signIn(input: z.infer<typeof signInSchema>) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) {
    throw unauthorized('邮箱或密码错误。')
  }

  if (user.status === 'pending') {
    throw unauthorized('请先验证邮箱后再登录。')
  }

  if (user.status === 'suspended') {
    throw unauthorized('您的账号因违规被封禁，请联系管理员。')
  }

  const valid = await bcrypt.compare(input.password, user.passwordHash)
  if (!valid) {
    throw unauthorized('邮箱或密码错误。')
  }

  return buildAuthResponse(user)
}

export async function signUp(input: z.infer<typeof signUpSchema>) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
  })
  if (existing) {
    if (existing.status === 'pending') {
      throw conflict('该邮箱已注册但未验证，请查收验证邮件或重新注册。')
    }
    throw conflict('该邮箱已被注册。')
  }

  const passwordHash = await bcrypt.hash(input.password, 10)
  const username = input.email.split('@')[0] ?? 'user'
  const count = await prisma.user.count()

  await prisma.user.create({
    data: {
      accountNo: `ACC${String(count + 1).padStart(3, '0')}`,
      firstName: username,
      lastName: 'User',
      username: `${username}${Date.now()}`,
      email: input.email,
      passwordHash,
      role: 'user',
      status: 'pending',
      profile: { create: {} },
      account: { create: {} },
      notifications: { create: {} },
    },
  })

  const otp = await issueOtp(input.email, 'registration')

  return {
    message: `验证码已发送至 ${input.email}`,
    ...devOtpFallback(otp),
  }
}

export async function verifyEmail(input: z.infer<typeof verifyEmailSchema>) {
  const valid = await verifyOtpCode(input.email, input.otp, 'registration')
  if (!valid) {
    throw badRequest('验证码无效或已过期。')
  }

  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) {
    throw notFound('该邮箱暂未被注册。')
  }

  if (user.status !== 'pending') {
    throw badRequest('该邮箱已验证，请直接登录。')
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { status: 'active' },
  })

  return buildAuthResponse(user)
}

export async function resendRegistrationOtp(
  input: z.infer<typeof forgotPasswordSchema>
) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user || user.status !== 'pending') {
    throw notFound('未找到待验证的注册账户。')
  }

  const otp = await issueOtp(input.email, 'registration')

  return {
    message: `验证码已重新发送至 ${input.email}`,
    ...devOtpFallback(otp),
  }
}

export async function forgotPassword(
  input: z.infer<typeof forgotPasswordSchema>
) {
  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) {
    throw notFound('未找到该邮箱对应的账户。')
  }

  if (user.status === 'pending') {
    throw badRequest('该邮箱尚未完成注册验证。')
  }

  const otp = await issueOtp(input.email, 'password_reset')

  return {
    message: `验证码已发送至 ${input.email}`,
    ...devOtpFallback(otp),
  }
}

export async function verifyResetOtp(
  input: z.infer<typeof verifyResetOtpSchema>
) {
  const valid = await verifyOtpCode(input.email, input.otp, 'password_reset')
  if (!valid) {
    throw badRequest('验证码无效或已过期。')
  }

  const user = await prisma.user.findUnique({ where: { email: input.email } })
  if (!user) {
    throw notFound('未找到该邮箱对应的账户。')
  }

  const { token: resetToken } = signResetToken(user.id)

  return {
    message: '验证成功，请设置新密码。',
    resetToken,
  }
}

export async function resetPassword(
  input: z.infer<typeof resetPasswordSchema>
) {
  let userId: string
  try {
    userId = verifyResetToken(input.resetToken).sub
  } catch {
    throw badRequest('重置链接无效或已过期，请重新申请。')
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw notFound('用户不存在。')
  }

  const passwordHash = await bcrypt.hash(input.password, 10)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  })

  await sendPasswordChangedEmail(user.email)

  return { message: '密码已重置，请使用新密码登录。' }
}

export async function changePassword(
  userId: string,
  input: z.infer<typeof changePasswordSchema>
) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw notFound('用户不存在。')
  }

  const valid = await bcrypt.compare(input.currentPassword, user.passwordHash)
  if (!valid) {
    throw unauthorized('当前密码不正确。')
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 10)
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  })

  await sendPasswordChangedEmail(user.email)

  return { message: '密码已修改。' }
}

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw notFound()
  }
  return buildAuthResponse(user)
}
