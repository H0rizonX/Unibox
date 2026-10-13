import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { SignIn } from '@/features/auth/sign-in'
import { useAuthStore } from '@/stores/auth-store'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  beforeLoad: ({ search }) => {
    const { accessToken } = useAuthStore.getState().auth
    if (accessToken) {
      throw redirect({ to: search.redirect || '/' })
    }
  },
  component: SignIn,
  validateSearch: searchSchema,
})
