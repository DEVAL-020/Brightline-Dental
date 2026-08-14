import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ToothMark from '../components/ToothMark.jsx'
import dentistHero from '../assets/dentist-hero.jpeg'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const redirectTo = location.state?.from?.pathname || '/app'

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(form.email, form.password)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not sign in. Check your email and password.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <div>
          <div className="auth-brand"><ToothMark color="#fff" /> Brightline</div>
          <h1 style={{ marginTop: 24 }}>Your smile, on schedule.</h1>
          <p>Sign in to book with your dentist, see open slots in real time, and keep every visit in one place.</p>
        </div>
        <div className="auth-photo-wrap">
          <img src={dentistHero} alt="doctor" />
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-card">
          <h2>Welcome back</h2>
          <p>Sign in to manage your appointments.</p>
          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="form-input" placeholder="••••••••" value={form.password} onChange={handleChange} required />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          <p style={{ marginTop: 18, fontSize: '0.86rem' }}>
            New here? <Link to="/register">Create an account</Link>
          </p>
          <p style={{ marginTop: 6, fontSize: '0.86rem' }}>
            <Link to="/">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
