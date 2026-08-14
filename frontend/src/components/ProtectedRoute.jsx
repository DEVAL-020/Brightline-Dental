import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ToothLoader from './ToothLoader.jsx'
import Navbar from './Navbar.jsx'

export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) return <ToothLoader label="Checking your session…" />
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />

  return (
    <div className="app-shell">
      <Navbar />
      <Outlet />
      <footer className="site-footer">Brightline Dental — appointments made simple.</footer>
    </div>
  )
}
