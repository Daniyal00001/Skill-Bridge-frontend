import { api } from './api'

// ── Types ─────────────────────────────────────────────────────

export interface SignupPayload {
  name: string
  email: string
  password: string
  role: 'client' | 'freelancer'
}

export interface LoginPayload {
  email: string
  password: string
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

// ── Signup ────────────────────────────────────────────────────
export const signupAPI = async (
  payload: SignupPayload
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/signup', payload)
  return response.data
}

// ── Login ─────────────────────────────────────────────────────
export const loginAPI = async (
  payload: LoginPayload
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/login', payload)
  return response.data
}

// ── Logout ────────────────────────────────────────────────────
export const logoutAPI = async (): Promise<void> => {
  await api.post('/auth/logout')
}