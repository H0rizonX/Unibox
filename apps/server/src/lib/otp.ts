import { redis } from './redis.js'
import type { OtpPurpose } from './mail.js'
import { env } from '../config/env.js'

function otpKey(purpose: OtpPurpose, email: string): string {
  return `otp:${purpose}:${email.toLowerCase()}`
}

export async function saveOtp(
  email: string,
  otp: string,
  purpose: OtpPurpose
): Promise<void> {
  await redis.setEx(otpKey(purpose, email), env.OTP_TTL_SECONDS, otp)
}

export async function verifyOtp(
  email: string,
  otp: string,
  purpose: OtpPurpose
): Promise<boolean> {
  const key = otpKey(purpose, email)
  const stored = await redis.get(key)
  if (!stored || stored !== otp) {
    return false
  }
  await redis.del(key)
  return true
}
