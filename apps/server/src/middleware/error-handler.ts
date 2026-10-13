import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'
import { type FailOptions } from '../lib/api-response.js'
import { BizCode, resolveBizCode } from '../lib/biz-code.js'
import { AppError } from '../lib/errors.js'

function sendFail(res: Response, message: string, options: FailOptions = {}) {
  if (typeof res.fail === 'function') {
    return res.fail(message, options)
  }

  const status = options.status ?? 400
  return res.status(status).json({
    code: resolveBizCode(status, options.code),
    message,
    data: null,
  })
}

function isBodyParseError(
  err: unknown
): err is { type: string; status?: number } {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    (err as { type: string }).type === 'entity.parse.failed'
  )
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return sendFail(res, err.title, {
      status: err.statusCode,
      code: err.businessCode,
    })
  }

  if (err instanceof ZodError) {
    const first = err.errors[0]
    return sendFail(res, first?.message ?? '请求参数无效。', {
      status: 400,
      code: BizCode.VALIDATION,
    })
  }

  if (isBodyParseError(err)) {
    return sendFail(res, '请求体格式无效。', {
      status: 400,
      code: BizCode.BAD_REQUEST,
    })
  }

  console.error(err)
  return sendFail(res, '服务器内部错误。', {
    status: 500,
    code: BizCode.INTERNAL,
  })
}

export function asyncHandler<T extends Request>(
  fn: (req: T, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: T, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
