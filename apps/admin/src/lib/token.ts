/** 距过期不足该时长时主动刷新 token（5 分钟） */
export const TOKEN_REFRESH_THRESHOLD_MS = 5 * 60 * 1000

export function isTokenExpired(exp?: number | null): boolean {
  if (!exp) return true
  return exp <= Date.now()
}

export function shouldRefreshToken(exp?: number | null): boolean {
  if (!exp) return false
  return exp - Date.now() <= TOKEN_REFRESH_THRESHOLD_MS
}
