import axios from 'axios'
import { useAuthStore } from '@/stores/auth-store'
import type { AuthResponse } from './types'

type ApiEnvelope<T> = {
  code: number
  data: T
  message?: string
}

function unwrapAuthResponse(payload: unknown): AuthResponse | null {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'code' in payload &&
    'data' in payload &&
    (payload as ApiEnvelope<unknown>).code === 0
  ) {
    payload = (payload as ApiEnvelope<unknown>).data
  }

  if (
    typeof payload !== 'object' ||
    payload === null ||
    !('accessToken' in payload) ||
    !('user' in payload)
  ) {
    return null
  }

  const { accessToken, user } = payload as AuthResponse
  if (typeof accessToken !== 'string' || !accessToken || !user) {
    return null
  }

  return { accessToken, user }
}

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise: Promise<boolean> | null = null

export async function refreshAccessToken(): Promise<boolean> {
  const { accessToken } = useAuthStore.getState().auth
  if (!accessToken) return false

  if (refreshPromise) return refreshPromise

  refreshPromise = (async () => {
    try {
      const { data: payload } = await refreshClient.post<unknown>(
        '/auth/refresh',
        undefined,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )
      const data = unwrapAuthResponse(payload)
      if (!data) {
        useAuthStore.getState().auth.reset()
        return false
      }

      const { auth } = useAuthStore.getState()
      auth.setAccessToken(data.accessToken)
      auth.setUser(data.user)
      return true
    } catch {
      useAuthStore.getState().auth.reset()
      return false
    } finally {
      refreshPromise = null
    }
  })()

  return refreshPromise
}
