import { createFileRoute, redirect } from '@tanstack/react-router'
import { refreshAccessToken } from '@/api/refresh-token'
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout'
import { isTokenExpired, shouldRefreshToken } from '@/lib/token'
import { useAuthStore } from '@/stores/auth-store'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const { accessToken, user } = useAuthStore.getState().auth

    if (!accessToken) {
      throw redirect({
        to: '/sign-in',
        search: { redirect: location.href },
      })
    }

    if (isTokenExpired(user?.exp) || shouldRefreshToken(user?.exp)) {
      const refreshed = await refreshAccessToken()
      if (!refreshed) {
        throw redirect({
          to: '/sign-in',
          search: { redirect: location.href },
        })
      }
    }
  },
  component: AuthenticatedLayout,
})
