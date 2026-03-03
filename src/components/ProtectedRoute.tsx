import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

// ── ProtectedRoute ────────────────────────────────────────────
// Wraps routes that require login
// If not logged in → redirect to /login
// Saves the page they tried to visit so we can redirect back after login
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Still checking session — show nothing
  if (isLoading) return null

  // Not logged in → send to login
  // state.from = where they tried to go (for redirect after login)
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Logged in → render the page
  return <Outlet />
}

// ── RoleRoute ─────────────────────────────────────────────────
// Wraps routes that require a specific role
// If wrong role → redirect to their correct dashboard
interface RoleRouteProps {
  allowedRole: 'CLIENT' | 'FREELANCER' | 'ADMIN'
}

export function RoleRoute({ allowedRole }: RoleRouteProps) {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return null

  // No user at all — ProtectedRoute handles this
  // but just in case:
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Wrong role → redirect to correct dashboard
  if (user.role !== allowedRole) {
    switch (user.role) {
      case 'CLIENT':
        return <Navigate to="/client" replace />
      case 'FREELANCER':
        return <Navigate to="/freelancer" replace />
      case 'ADMIN':
        return <Navigate to="/admin" replace />
      default:
        return <Navigate to="/login" replace />
    }
  }

  // Correct role → render the page
  return <Outlet />
}

// ── GuestRoute ────────────────────────────────────────────────
// Wraps routes that should NOT be accessible when logged in
// e.g. /login and /signup
// If already logged in → redirect to their dashboard
export function GuestRoute() {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) return null

  // Already logged in → redirect to their dashboard
  if (isAuthenticated && user) {
    switch (user.role) {
      case 'CLIENT':
        return <Navigate to="/client" replace />
      case 'FREELANCER':
        return <Navigate to="/freelancer" replace />
      case 'ADMIN':
        return <Navigate to="/admin" replace />
    }
  }

  // Not logged in → render the page (login/signup)
  return <Outlet />
}