import { Link } from 'react-router-dom'
import ToothMark from './ToothMark.jsx'
import ThemeToggle from './ThemeToggle.jsx'

export default function PublicNav() {
  return (
    <header className="site-nav">
      <div className="site-nav-inner">
        <Link to="/" className="brand">
          <ToothMark color="#fff" />
          Brightline
        </Link>
        <nav className="site-nav-links">
          <a href="#services">Services</a>
          <a href="#doctors">Doctors</a>
          <a href="#reviews">Reviews</a>
          <a href="#faq">FAQ</a>
        </nav>
        <div className="site-nav-actions">
          <ThemeToggle className="theme-toggle-light" />
          <Link to="/login" className="btn btn-outline-light btn-sm">Log in</Link>
          <Link to="/register" className="btn btn-accent btn-sm">Book a visit</Link>
        </div>
      </div>
    </header>
  )
}
