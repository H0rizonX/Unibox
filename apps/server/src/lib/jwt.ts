import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export type JwtPayload = {
  sub: string
  accountNo: string
  email: string
  role: string[]
}

export type ResetTokenPayload = {
  sub: string
  purpose: 'password_reset'
}

const RESET_TOKEN_EXPIRES_IN = 15 * 60

export function signToken(payload: JwtPayload): { token: string; exp: number } {
  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  })
  const decoded = jwt.decode(token) as jwt.JwtPayload | null
  const exp =
    (decoded?.exp ?? Math.floor(Date.now() / 1000) + env.JWT_EXPIRES_IN) * 1000
  return { token, exp }
}

export function signResetToken(userId: string): { token: string; exp: number } {
  const payload: ResetTokenPayload = { sub: userId, purpose: 'password_reset' }
  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: RESET_TOKEN_EXPIRES_IN,
  })
  const decoded = jwt.decode(token) as jwt.JwtPayload | null
  const exp =
    (decoded?.exp ?? Math.floor(Date.now() / 1000) + RESET_TOKEN_EXPIRES_IN) *
    1000
  return { token, exp }
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload
}

export function verifyResetToken(token: string): ResetTokenPayload {
  const payload = jwt.verify(token, env.JWT_SECRET) as ResetTokenPayload
  if (payload.purpose !== 'password_reset') {
    throw new Error('Invalid reset token')
  }
  return payload
}

export function toAuthUser(payload: JwtPayload, exp: number) {
  return {
    accountNo: payload.accountNo,
    email: payload.email,
    role: payload.role,
    exp,
  }
}

export function roleToArray(role: string): string[] {
  return [role]
}
