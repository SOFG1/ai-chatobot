import { toast } from 'vue3-toastify'
import type { BackendError } from '@/types/error'
import i18n from '@/i18n'
import { AxiosError } from 'axios'

/**
 * Handles an Error and shows a toast.
 * Tries to resolve the error key in case of a backend error
 * @param error
 * @param defaultMessageKey
 * @throws error
 */
export function handleError(error: Error | unknown, defaultMessageKey: string): never {
  const message = i18n.global.t(defaultMessageKey)
  let beError: BackendError | undefined
  if (error instanceof AxiosError) {
    beError = error?.response?.data as BackendError
  }

  console.log('Error:', error)
  handleBackendError(beError, message)
  throw error
}

/**
 * Handle generic backend error
 * Looks for a detail field in the error response object
 * If none is found the default message is shown as fallback
 * Will log the error and show a toast with a default message
 * @param error
 * @param defaultMessage
 */
export function handleBackendError(error: BackendError | undefined, defaultMessage: string) {
  let message = defaultMessage
  if (error && error.detail) {
    message = i18n.global.t(error.detail.error_code, error.detail.extra)
  }

  toast(message, {
    autoClose: 3000,
    type: 'error'
  })
  console.log('test')
  console.error(message, error)
}

export function assertAxiosError(e: any): asserts e is AxiosError {
  if (!(e instanceof AxiosError)) {
    throw e
  }
}
