import { io, Socket } from 'socket.io-client'
import { getAccessToken } from '@/lib/api'

const getSocketUrl = (): string => {
  const socketUrl = import.meta.env.VITE_SOCKET_URL
  if (socketUrl && socketUrl !== '/api') {
    return socketUrl
  }
  const apiUrl = import.meta.env.VITE_API_URL
  if (apiUrl && apiUrl !== '/api') {
    return apiUrl.replace(/\/api\/?$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin
  }
  return 'http://localhost:5000'
}

const BACKEND_URL = getSocketUrl()

let socket: Socket | null = null

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(BACKEND_URL, {
      // token is read lazily so it's always fresh when reconnecting
      auth: (cb) => cb({ token: getAccessToken() ?? '' }),
      withCredentials: true,
      transports: ['polling', 'websocket'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    })

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket?.id)
    })

    socket.on('disconnect', (reason) => {
      console.warn('[Socket] Disconnected:', reason)
    })

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message)
    })
  }
  return socket
}

export const reconnectSocket = () => {
  if (socket) {
    socket.disconnect().connect()
  }
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
