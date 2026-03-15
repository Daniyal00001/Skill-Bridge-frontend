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
  role: 'CLIENT' | 'FREELANCER' | 'ADMIN' | null
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


// Api calls
// ── Signup ────────────────────────────────────────────────────
export const signupAPI = async (
  payload: SignupPayload
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post<{ success: boolean; message: string }>(
    '/auth/signup',
    payload
  )
  return response.data
}

// ── Verify OTP ────────────────────────────────────────────────
export const verifyOtpAPI = async (
  email: string,
  otp: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/auth/verify-otp', {
    email,
    otp,
  })
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


// ── Forgot Password ───────────────────────────────────────────
export const forgotPasswordAPI = async (email: string): Promise<void> => {
  await api.post('/auth/forgot-password', { email })
}

// ── Reset Password ────────────────────────────────────────────
export const resetPasswordAPI = async (
  token: string,
  password: string
): Promise<void> => {
  await api.post('/auth/reset-password', { token, password })
}