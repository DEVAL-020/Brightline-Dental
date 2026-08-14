import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RoleGate({ roles }) {
  const { user } = useAuth()
  if (!roles.includes(user.role)) return <Navigate to="/app" replace />
  return <Outlet />
}
