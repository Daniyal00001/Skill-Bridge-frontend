import { api } from './api'

// ── Types ─────────────────────────────────────────────────────

export interface SignupPayload {
  name: string
  email: string
  password: string
  role: 'client' | 'freelancer'
}

export interface AuthUser {
  id: string
  name: string
  email: string
  role: 'CLIENT' | 'FREELANCER' | 'ADMIN'
  profileImage: string | null
  isEmailVerified: boolean
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    accessToken: string
    user: AuthUser
  }
}

// ── Actions ───────────────────────────────────────────────────

export const signupAPI = async (payload: SignupPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/signup', payload)
  return response.data
}

export const loginAPI = async (email: string, password: string, role?: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', { email, password, role })
  return response.data
}
