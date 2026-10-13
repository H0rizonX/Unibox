import { describe, expect, it, vi } from 'vitest'
import {
  isTokenExpired,
  shouldRefreshToken,
  TOKEN_REFRESH_THRESHOLD_MS,
} from './token'

describe('token helpers', () => {
  it('treats missing exp as expired', () => {
    expect(isTokenExpired(null)).toBe(true)
    expect(isTokenExpired(undefined)).toBe(true)
    expect(shouldRefreshToken(null)).toBe(false)
  })

  it('detects expired tokens', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))

    expect(isTokenExpired(Date.now() - 1)).toBe(true)
    expect(isTokenExpired(Date.now())).toBe(true)
    expect(isTokenExpired(Date.now() + 1000)).toBe(false)

    vi.useRealTimers()
  })

  it('detects tokens that should refresh before expiry', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-01T12:00:00Z'))

    const now = Date.now()
    expect(shouldRefreshToken(now + TOKEN_REFRESH_THRESHOLD_MS + 1)).toBe(false)
    expect(shouldRefreshToken(now + TOKEN_REFRESH_THRESHOLD_MS)).toBe(true)
    expect(shouldRefreshToken(now + 1000)).toBe(true)

    vi.useRealTimers()
  })
})
