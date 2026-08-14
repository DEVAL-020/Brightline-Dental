import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ToothMark from './ToothMark.jsx'
import ThemeToggle from './ThemeToggle.jsx'

const LINKS_BY_ROLE = {
  patient: [
    { to: '/app', label: 'Dashboard', end: true },
    { to: '/app/book', label: 'Book appointment' },
    { to: '/app/appointments', label: 'My appointments' }
  ],
  dentist: [
    { to: '/app', label: 'Today', end: true },
    { to: '/app/appointments', label: 'My schedule' }
  ],
  admin: [
    { to: '/app', label: 'Overview', end: true },
    { to: '/app/users', label: 'Users' },
    { to: '/app/appointments', label: 'Appointments' }
  ]
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const links = LINKS_BY_ROLE[user?.role] || []

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <div className="brand">
          <ToothMark />
          Brightline
        </div>
        <nav>
          <ul className="nav-links">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink to={l.to} end={l.end} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="nav-actions">
          <ThemeToggle />
          {user && (
            <span className="nav-user">
              <span className="name">{user.name}</span>
              <span className="role">{user.role}</span>
            </span>
          )}
          <button className="btn btn-ghost btn-sm" onClick={handleLogout}>Log out</button>
        </div>
      </div>
    </header>
  )
}
