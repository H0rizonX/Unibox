import { Router } from 'express'
import { type AuthRequest, authenticate } from '../middleware/auth.js'
import { asyncHandler } from '../middleware/error-handler.js'
import * as authService from '../services/auth.service.js'
import {
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  verifyEmailSchema,
  verifyResetOtpSchema,
} from '../validators/schemas.js'

export const authRouter = Router()

authRouter.post(
  '/sign-in',
  asyncHandler(async (req, res) => {
    const body = signInSchema.parse(req.body)
    const result = await authService.signIn(body)
    res.suc(result)
  })
)

authRouter.post(
  '/sign-up',
  asyncHandler(async (req, res) => {
    const body = signUpSchema.parse(req.body)
    const result = await authService.signUp(body)
    res.suc(result, { status: 201 })
  })
)

authRouter.post(
  '/verify-email',
  asyncHandler(async (req, res) => {
    const body = verifyEmailSchema.parse(req.body)
    const result = await authService.verifyEmail(body)
    res.suc(result)
  })
)

authRouter.post(
  '/resend-registration-otp',
  asyncHandler(async (req, res) => {
    const body = forgotPasswordSchema.parse(req.body)
    const result = await authService.resendRegistrationOtp(body)
    res.suc(result)
  })
)

authRouter.post(
  '/forgot-password',
  asyncHandler(async (req, res) => {
    const body = forgotPasswordSchema.parse(req.body)
    const result = await authService.forgotPassword(body)
    res.suc(result)
  })
)

authRouter.post(
  '/verify-reset-otp',
  asyncHandler(async (req, res) => {
    const body = verifyResetOtpSchema.parse(req.body)
    const result = await authService.verifyResetOtp(body)
    res.suc(result)
  })
)

authRouter.post(
  '/reset-password',
  asyncHandler(async (req, res) => {
    const body = resetPasswordSchema.parse(req.body)
    const result = await authService.resetPassword(body)
    res.suc(result)
  })
)

authRouter.post(
  '/change-password',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const body = changePasswordSchema.parse(req.body)
    const result = await authService.changePassword(req.user!.sub, body)
    res.suc(result)
  })
)

authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await authService.getMe(req.user!.sub)
    res.suc(result)
  })
)

authRouter.post(
  '/refresh',
  authenticate,
  asyncHandler(async (req: AuthRequest, res) => {
    const result = await authService.getMe(req.user!.sub)
    res.suc(result)
  })
)

authRouter.post(
  '/sign-out',
  authenticate,
  asyncHandler(async (_req, res) => {
    res.suc(null, { status: 204 })
  })
)
