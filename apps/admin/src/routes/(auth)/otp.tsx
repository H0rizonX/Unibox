import { z } from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { Otp } from '@/features/auth/otp'

const searchSchema = z.object({
  email: z.string().email().optional(),
  purpose: z.enum(['registration', 'password_reset']).optional(),
})

export const Route = createFileRoute('/(auth)/otp')({
  validateSearch: searchSchema,
  component: Otp,
})
