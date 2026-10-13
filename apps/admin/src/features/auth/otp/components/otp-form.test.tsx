import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Locator, userEvent } from 'vitest/browser'
import { type RenderResult, render } from 'vitest-browser-react'
import { OtpForm } from './otp-form'

const navigate = vi.fn()
const setAccessTokenMock = vi.fn()
const setUserMock = vi.fn()

vi.mock('@/api/auth', () => ({
  verifyEmail: vi.fn(() =>
    Promise.resolve({
      accessToken: 'test-access-token',
      user: {
        accountNo: 'ACC001',
        email: 'a@b.com',
        role: ['user'],
        exp: Date.now() + 24 * 60 * 60 * 1000,
      },
    })
  ),
  verifyResetOtp: vi.fn(() =>
    Promise.resolve({
      message: '验证成功',
      resetToken: 'reset-token',
    })
  ),
  resendRegistrationOtp: vi.fn(() => Promise.resolve({ message: '已发送' })),
  forgotPassword: vi.fn(() => Promise.resolve({ message: '已发送' })),
}))

vi.mock('@/stores/auth-store', () => ({
  useAuthStore: () => ({
    auth: {
      setAccessToken: setAccessTokenMock,
      setUser: setUserMock,
    },
  }),
}))

vi.mock('@tanstack/react-router', async (orig) => {
  const actual = await orig<typeof import('@tanstack/react-router')>()
  return { ...actual, useNavigate: () => navigate }
})

describe('OtpForm', () => {
  let screen: RenderResult
  let otpInput: Locator
  let verifyButton: Locator

  beforeEach(async () => {
    vi.clearAllMocks()

    screen = await render(<OtpForm email="a@b.com" purpose="registration" />)
    otpInput = screen.getByLabelText(/^验证码$/i)
    verifyButton = screen.getByRole('button', { name: /^验证邮箱$/i })
  })

  it('disables verify until 6 digits are entered', async () => {
    await expect.element(verifyButton).toBeDisabled()

    await userEvent.fill(otpInput, '12345')
    await expect.element(verifyButton).toBeDisabled()

    await userEvent.fill(otpInput, '123456')
    await expect.element(verifyButton).toBeEnabled()
  })

  it('submits registration OTP and navigates on success', async () => {
    await userEvent.fill(otpInput, '123456')
    await userEvent.click(verifyButton)

    await vi.waitFor(() => expect(setAccessTokenMock).toHaveBeenCalledOnce())
    expect(setUserMock).toHaveBeenCalledOnce()
    await vi.waitFor(() =>
      expect(navigate).toHaveBeenCalledWith({ to: '/', replace: true })
    )
  })
})
