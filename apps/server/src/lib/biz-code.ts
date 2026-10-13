export const BizCode = {
  SUCCESS: 0,
  BAD_REQUEST: 10001,
  UNAUTHORIZED: 10002,
  FORBIDDEN: 10003,
  NOT_FOUND: 10004,
  CONFLICT: 10005,
  VALIDATION: 10006,
  INTERNAL: 10999,
} as const

export type BizCodeValue = (typeof BizCode)[keyof typeof BizCode]

const HTTP_STATUS_TO_BIZ_CODE: Record<number, BizCodeValue> = {
  400: BizCode.BAD_REQUEST,
  401: BizCode.UNAUTHORIZED,
  403: BizCode.FORBIDDEN,
  404: BizCode.NOT_FOUND,
  409: BizCode.CONFLICT,
  500: BizCode.INTERNAL,
}

export function resolveBizCode(
  httpStatus: number,
  explicit?: number
): BizCodeValue {
  if (explicit !== undefined) {
    return explicit as BizCodeValue
  }
  return HTTP_STATUS_TO_BIZ_CODE[httpStatus] ?? BizCode.BAD_REQUEST
}
