import { BizCode, type BizCodeValue } from './biz-code.js'

export class AppError extends Error {
  public readonly businessCode: BizCodeValue

  constructor(
    public statusCode: number,
    public title: string,
    businessCode?: BizCodeValue
  ) {
    super(title)
    this.name = 'AppError'
    this.businessCode = businessCode ?? bizCodeFromHttpStatus(statusCode)
  }
}

function bizCodeFromHttpStatus(statusCode: number): BizCodeValue {
  switch (statusCode) {
    case 401:
      return BizCode.UNAUTHORIZED
    case 403:
      return BizCode.FORBIDDEN
    case 404:
      return BizCode.NOT_FOUND
    case 409:
      return BizCode.CONFLICT
    case 500:
      return BizCode.INTERNAL
    default:
      return BizCode.BAD_REQUEST
  }
}

export function notFound(title = '资源不存在。') {
  return new AppError(404, title, BizCode.NOT_FOUND)
}

export function badRequest(title: string) {
  return new AppError(400, title, BizCode.BAD_REQUEST)
}

export function unauthorized(title = '未授权，请先登录。') {
  return new AppError(401, title, BizCode.UNAUTHORIZED)
}

export function forbidden(title = '无权访问此资源。') {
  return new AppError(403, title, BizCode.FORBIDDEN)
}

export function conflict(title: string) {
  return new AppError(409, title, BizCode.CONFLICT)
}
