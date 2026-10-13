import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { refreshAccessToken } from '@/api/refresh-token'
import { useAuthStore } from '@/stores/auth-store'

type ApiEnvelope<T> = {
  code: number
  data: T
  message?: string
}

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'data' in value &&
    (value as ApiEnvelope<unknown>).code === 0
  )
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

const AUTH_ENDPOINTS = [
  '/auth/sign-in',
  '/auth/sign-up',
  '/auth/refresh',
  '/auth/forgot-password',
  '/auth/verify-email',
  '/auth/verify-reset-otp',
  '/auth/reset-password',
  '/auth/resend-registration-otp',
]

function isAuthEndpoint(url?: string): boolean {
  if (!url) return false
  return AUTH_ENDPOINTS.some((path) => url.includes(path))
}

type RetryConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

apiClient.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState().auth
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    if (isApiEnvelope(response.data)) {
      response.data = response.data.data
    }
    return response
  },
  async (error: AxiosError) => {
    const config = error.config as RetryConfig | undefined
    if (
      !config ||
      config._retry ||
      error.response?.status !== 401 ||
      isAuthEndpoint(config.url)
    ) {
      return Promise.reject(error)
    }

    config._retry = true
    const refreshed = await refreshAccessToken()
    if (!refreshed) {
      return Promise.reject(error)
    }

    const { accessToken } = useAuthStore.getState().auth
    config.headers.Authorization = `Bearer ${accessToken}`
    return apiClient(config)
  }
)
