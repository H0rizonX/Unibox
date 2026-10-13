import { AxiosError } from 'axios'
import { toast } from 'sonner'

export function handleServerError(error: unknown) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(error)
  }

  let errMsg = '出错了！'

  if (
    error &&
    typeof error === 'object' &&
    'status' in error &&
    Number(error.status) === 204
  ) {
    errMsg = '无内容。'
  }

  if (error instanceof AxiosError) {
    const payload = error.response?.data
    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof payload.message === 'string' &&
      payload.message.length > 0
        ? payload.message
        : typeof payload === 'object' &&
            payload !== null &&
            'title' in payload &&
            typeof payload.title === 'string' &&
            payload.title.length > 0
          ? payload.title
          : undefined

    if (message) {
      errMsg = message
    }
  }

  toast.error(errMsg)
}
