import { io, Socket } from 'socket.io-client'
import { getAccessToken } from '@/lib/api'

const getSocketUrl = (): string => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:'
    return `${protocol}//${window.location.hostname}:5000`
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
      transports: ['websocket', 'polling'],
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
