import axios from 'axios'

// ── Create Axios Instance ─────────────────────────────────────
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // sends cookies (refreshToken) with every request
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── In-memory token storage ───────────────────────────────────
// WHY memory and not localStorage?
// localStorage can be stolen via XSS attacks
// Memory is wiped when tab closes — much safer
let _accessToken: string | null = null

export const setAccessToken = (token: string) => { _accessToken = token }
export const getAccessToken = () => _accessToken
export const clearAccessToken = () => { _accessToken = null }

// ── Request Interceptor ───────────────────────────────────────
// Runs BEFORE every request
// Automatically attaches accessToken to every API call
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response Interceptor ──────────────────────────────────────
// Runs AFTER every response
// If we get 401 (token expired) → silently refresh and retry
let isRefreshing = false
let failedQueue: Array<{ resolve: Function; reject: Function }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error)
    } else {
      p.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Already refreshing — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Try to get new accessToken using refreshToken cookie
        const response = await api.post('/auth/refresh')
        const newToken = response.data.data.accessToken

        setAccessToken(newToken)
        processQueue(null, newToken)

        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)

      } catch (refreshError) {
        // Refresh failed — force logout
        processQueue(refreshError, null)
        clearAccessToken()
        window.location.href = '/login'
        return Promise.reject(refreshError)

      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)