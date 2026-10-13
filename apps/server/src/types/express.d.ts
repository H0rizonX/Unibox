import type { FailOptions, SucOptions } from '../lib/api-response.js'

declare global {
  namespace Express {
    interface Response {
      suc: <T>(data: T, options?: SucOptions) => this
      fail: (message: string, options?: FailOptions) => this
    }
  }
}
