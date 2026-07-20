import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
})

let isRefreshing = false
let pendingRequests: Array<() => void> = []

// La sesión vive en cookies httpOnly: el interceptor solo reintenta una vez tras un 401
// disparando /auth/refresh, para no pelear con el navegador ni exponer el token a JS.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    const isAuthEndpoint = config?.url?.startsWith('/auth/')

    if (response?.status !== 401 || isAuthEndpoint || config._retried) {
      return Promise.reject(error)
    }

    config._retried = true

    if (!isRefreshing) {
      isRefreshing = true
      try {
        await api.post('/auth/refresh')
        pendingRequests.forEach((resolve) => resolve())
        pendingRequests = []
      } catch (refreshError) {
        pendingRequests = []
        isRefreshing = false
        return Promise.reject(refreshError)
      }
      isRefreshing = false
      return api(config)
    }

    return new Promise((resolve) => {
      pendingRequests.push(() => resolve(api(config)))
    })
  },
)
