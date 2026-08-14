import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import ToothMark from '../components/ToothMark.jsx'
import dentalcheckup from '../assets/dental-check-up.jpeg'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('patient')
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', specialization: '', licenseNumber: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = { ...form, role }
      if (role !== 'dentist') {
        delete payload.specialization
        delete payload.licenseNumber
      }
      await register(payload)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create your account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-side">
        <div>
          <div className="auth-brand"><ToothMark color="#fff" /> Brightline</div>
          <h1 style={{ marginTop: 24 }}>A few details, and you're in.</h1>
          <p>
            Patients get straight to booking. Dentist accounts land in the clinic's system too — an admin sets your
            weekly working hours right after signup.
          </p>
        </div>
        <div className="auth-photo-dental-chckup">
          <img src={dentalcheckup} alt="dental-check-up" />
        </div>
      </div>
      <div className="auth-form-wrap">
        <div className="auth-card">
          <h2>Create your account</h2>
          <p>It only takes a minute.</p>

          <div className="role-toggle">
            <button type="button" className={role === 'patient' ? 'active' : ''} onClick={() => setRole('patient')}>I'm a patient</button>
            <button type="button" className={role === 'dentist' ? 'active' : ''} onClick={() => setRole('dentist')}>I'm a dentist</button>
          </div>

          {error && <div className="form-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full name</label>
              <input id="name" name="name" className="form-input" placeholder="John Doe" value={form.name} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="form-input" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="phone">Phone</label>
              <input id="phone" name="phone" className="form-input" placeholder="+91 000-00-00-000" value={form.phone} onChange={handleChange} />
            </div>

            {role === 'dentist' && (
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label" htmlFor="specialization">Specialization</label>
                  <input id="specialization" name="specialization" className="form-input" placeholder="Orthodontics" value={form.specialization} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="licenseNumber">License number</label>
                  <input id="licenseNumber" name="licenseNumber" className="form-input" placeholder="DDS-12345" value={form.licenseNumber} onChange={handleChange} />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="password">Password</label>
              <input id="password" name="password" type="password" className="form-input" placeholder="At least 6 characters" value={form.password} onChange={handleChange} required minLength={6} />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p style={{ marginTop: 18, fontSize: '0.86rem' }}>
            Already registered? <Link to="/login">Sign in</Link>
          </p>
          <p style={{ marginTop: 6, fontSize: '0.86rem' }}>
            <Link to="/">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
