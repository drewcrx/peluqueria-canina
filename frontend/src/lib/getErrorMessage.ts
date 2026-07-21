interface AxiosLikeError {
  response?: { data?: { message?: string } }
}

export function getErrorMessage(error: unknown, fallback: string): string {
  const axiosError = error as AxiosLikeError
  return axiosError?.response?.data?.message ?? fallback
}
