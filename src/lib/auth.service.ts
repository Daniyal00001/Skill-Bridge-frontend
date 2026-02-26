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

// ── Signup ────────────────────────────────────────────────────
export const signupAPI = async (payload: SignupPayload): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/signup', payload)
  return response.data
}

// these will be added soon:
// export const loginAPI = ...
// export const logoutAPI = ...
// export const refreshAPI = ...
