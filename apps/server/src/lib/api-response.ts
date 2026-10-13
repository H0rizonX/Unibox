export const SUCCESS_CODE = 0 as const

export type ApiSuccessBody<T> = {
  code: typeof SUCCESS_CODE
  data: T
  message?: string
}

export type ApiFailBody = {
  code: number
  message: string
  data: null
}

export type SucOptions = {
  status?: number
  message?: string
}

export type FailOptions = {
  status?: number
  /** 业务错误码，与 HTTP 状态码独立 */
  code?: number
}
