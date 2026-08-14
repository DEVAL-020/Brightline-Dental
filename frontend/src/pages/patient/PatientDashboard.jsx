import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { getAppointments, updateAppointment } from '../../api/endpoints.js'
import AppointmentCard from '../../components/AppointmentCard.jsx'
import ToothLoader from '../../components/ToothLoader.jsx'

export default function PatientDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data } = await getAppointments()
      setAppointments(data.data)
    } catch {
      setError('Could not load your appointments right now.')
    } finally {
      setLoading(false)
    }
  }

  async function handleCancel(appointment) {
    if (!window.confirm('Cancel this appointment?')) return
    try {
      await updateAppointment(appointment._id, { status: 'cancelled' })
      setAppointments((prev) => prev.map((a) => (a._id === appointment._id ? { ...a, status: 'cancelled' } : a)))
    } catch {
      alert('Could not cancel the appointment. Please try again.')
    }
  }

  const upcoming = useMemo(
    () =>
      appointments
        .filter((a) => ['confirmed', 'pending'].includes(a.status) && new Date(a.date) >= new Date().setHours(0, 0, 0, 0))
        .sort((a, b) => new Date(a.date) - new Date(b.date)),
    [appointments]
  )
  const completedCount = appointments.filter((a) => a.status === 'completed').length
  const next = upcoming[0]

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Dashboard</span>
            <h1>Hi {user?.name?.split(' ')[0] || 'there'}, here's where things stand.</h1>
          </div>
          <Link to="/app/book" className="btn btn-primary">Book an appointment</Link>
        </div>

        <div className="grid grid-3" style={{ marginBottom: 32 }}>
          <div className="stat-card"><div className="stat-value">{upcoming.length}</div><div className="stat-label">Upcoming visits</div></div>
          <div className="stat-card"><div className="stat-value">{completedCount}</div><div className="stat-label">Completed visits</div></div>
          <div className="stat-card">
            <div className="stat-value">{next ? new Date(next.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}</div>
            <div className="stat-label">Next visit</div>
          </div>
        </div>

        <h2 style={{ marginBottom: 14 }}>Upcoming appointments</h2>

        {loading && <ToothLoader label="Fetching your appointments…" />}
        {!loading && error && <div className="form-error">{error}</div>}

        {!loading && !error && upcoming.length === 0 && (
          <div className="empty-state card">
            <h3>Nothing on the calendar yet</h3>
            <p>Book your next cleaning or check-up in a couple of clicks.</p>
            <Link to="/app/book" className="btn btn-accent">Book an appointment</Link>
          </div>
        )}

        {!loading && upcoming.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {upcoming.map((appt) => (
              <AppointmentCard key={appt._id} appointment={appt} viewerRole="patient" onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
