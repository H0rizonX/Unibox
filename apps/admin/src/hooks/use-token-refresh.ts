import { useEffect } from 'react'
import { refreshAccessToken } from '@/api/refresh-token'
import { useAuthStore } from '@/stores/auth-store'
import {
  isTokenExpired,
  shouldRefreshToken,
  TOKEN_REFRESH_THRESHOLD_MS,
} from '@/lib/token'

export function useTokenRefresh() {
  const accessToken = useAuthStore((s) => s.auth.accessToken)
  const exp = useAuthStore((s) => s.auth.user?.exp)

  useEffect(() => {
    if (!accessToken || !exp) return

    let timer: ReturnType<typeof setTimeout> | undefined

    const runRefresh = () => {
      void refreshAccessToken()
    }

    if (isTokenExpired(exp) || shouldRefreshToken(exp)) {
      runRefresh()
    } else {
      const msUntilRefresh = exp - Date.now() - TOKEN_REFRESH_THRESHOLD_MS
      timer = setTimeout(runRefresh, msUntilRefresh)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [accessToken, exp])
}
