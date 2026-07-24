interface AxiosLikeError {
  response?: { data?: { message?: string; errors?: Record<string, string[]> } }
}

/**
 * Field-level errors (from ValidationException — see ExceptionHandlingMiddleware) carry the real
 * reason ("Incorrect password.", "Solo se permiten imágenes..."); the top-level `message` on that
 * same response is always the generic "Se produjeron uno o más errores de validación." wrapper.
 * Prefer the specific reason when one is available.
 */
export function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosLikeError
  const fieldErrors = axiosError?.response?.data?.errors
  if (fieldErrors) {
    const messages = Object.values(fieldErrors).flat()
    if (messages.length > 0) return messages.join(' ')
  }
  return axiosError?.response?.data?.message ?? fallback
}
