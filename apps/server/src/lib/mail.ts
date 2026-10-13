import nodemailer from 'nodemailer'
import { env } from '../config/env.js'

export type OtpPurpose = 'registration' | 'password_reset'

const purposeLabels: Record<OtpPurpose, string> = {
  registration: '邮箱验证',
  password_reset: '密码重置',
}

function isSmtpConfigured(): boolean {
  return Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS)
}

function getFromAddress(): string {
  const address = env.SMTP_FROM.includes('@')
    ? env.SMTP_FROM
    : (env.SMTP_USER ?? env.SMTP_FROM)
  return `"${env.APP_NAME}" <${address}>`
}

function createTransporter() {
  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  })
}

function buildOtpEmailHtml(otp: string, purpose: OtpPurpose): string {
  const label = purposeLabels[purpose]
  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>${env.APP_NAME} - ${label}</h2>
      <p>您的验证码为：</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #111;">${otp}</p>
      <p style="color: #666;">验证码 3 分钟内有效，请勿泄露给他人。</p>
      <p style="color: #999; font-size: 12px;">如非本人操作，请忽略此邮件。</p>
    </div>
  `.trim()
}

export async function sendOtpEmail(
  to: string,
  otp: string,
  purpose: OtpPurpose
): Promise<void> {
  const label = purposeLabels[purpose]
  const subject = `${env.APP_NAME} - ${label}验证码`

  if (!isSmtpConfigured()) {
    console.log(`[Mail] SMTP 未配置，${label}验证码 (${to}): ${otp}`)
    return
  }

  const transporter = createTransporter()
  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    html: buildOtpEmailHtml(otp, purpose),
    text: `${env.APP_NAME} ${label}验证码：${otp}，3 分钟内有效。`,
  })
}

export async function sendPasswordChangedEmail(to: string): Promise<void> {
  const subject = `${env.APP_NAME} - 密码已修改`

  if (!isSmtpConfigured()) {
    console.log(`[Mail] SMTP 未配置，密码修改通知 (${to})`)
    return
  }

  const transporter = createTransporter()
  await transporter.sendMail({
    from: getFromAddress(),
    to,
    subject,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
        <h2>${env.APP_NAME} - 密码已修改</h2>
        <p>您的账户密码已成功修改。</p>
        <p style="color: #999; font-size: 12px;">如非本人操作，请立即联系管理员。</p>
      </div>
    `.trim(),
    text: `${env.APP_NAME}：您的账户密码已成功修改。如非本人操作，请立即联系管理员。`,
  })
}
