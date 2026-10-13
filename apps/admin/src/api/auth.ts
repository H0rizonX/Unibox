import { apiClient } from './client'
import type {
  AuthResponse,
  MessageResponse,
  OtpResponse,
  ResetTokenResponse,
} from './types'

export async function signIn(input: {
  email: string
  password: string
}): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/sign-in', input)
  return data
}

export async function signUp(input: {
  email: string
  password: string
}): Promise<OtpResponse> {
  const { data } = await apiClient.post<OtpResponse>('/auth/sign-up', input)
  return data
}

export async function verifyEmail(input: {
  email: string
  otp: string
}): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>(
    '/auth/verify-email',
    input
  )
  return data
}

export async function resendRegistrationOtp(input: {
  email: string
}): Promise<OtpResponse> {
  const { data } = await apiClient.post<OtpResponse>(
    '/auth/resend-registration-otp',
    input
  )
  return data
}

export async function forgotPassword(input: {
  email: string
}): Promise<OtpResponse> {
  const { data } = await apiClient.post<OtpResponse>(
    '/auth/forgot-password',
    input
  )
  return data
}

export async function verifyResetOtp(input: {
  email: string
  otp: string
}): Promise<ResetTokenResponse> {
  const { data } = await apiClient.post<ResetTokenResponse>(
    '/auth/verify-reset-otp',
    input
  )
  return data
}

export async function resetPassword(input: {
  resetToken: string
  password: string
}): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>(
    '/auth/reset-password',
    input
  )
  return data
}

export async function changePassword(input: {
  currentPassword: string
  newPassword: string
}): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>(
    '/auth/change-password',
    input
  )
  return data
}

export async function getMe(): Promise<AuthResponse> {
  const { data } = await apiClient.get<AuthResponse>('/auth/me')
  return data
}

export async function refreshToken(): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/auth/refresh')
  return data
}

export async function signOut(): Promise<void> {
  await apiClient.post('/auth/sign-out')
}
