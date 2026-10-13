import type { NextFunction, Request, Response } from 'express'
import {
  type ApiFailBody,
  type ApiSuccessBody,
  type FailOptions,
  SUCCESS_CODE,
  type SucOptions,
} from '../lib/api-response.js'
import { resolveBizCode } from '../lib/biz-code.js'

export function responseMiddleware(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  res.suc = function suc<T>(data: T, options: SucOptions = {}) {
    const status = options.status ?? 200

    if (status === 204) {
      return this.status(204).send()
    }

    const body: ApiSuccessBody<T> = {
      code: SUCCESS_CODE,
      data,
    }

    if (options.message) {
      body.message = options.message
    }

    return this.status(status).json(body)
  }

  res.fail = function fail(message: string, options: FailOptions = {}) {
    const status = options.status ?? 400
    const body: ApiFailBody = {
      code: resolveBizCode(status, options.code),
      message,
      data: null,
    }

    return this.status(status).json(body)
  }

  next()
}
