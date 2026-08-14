import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getUsers, getAppointments } from '../../api/endpoints.js'
import ToothLoader from '../../components/ToothLoader.jsx'
import AppointmentCard from '../../components/AppointmentCard.jsx'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function AdminDashboard() {
  const [patients, setPatients] = useState([])
  const [dentists, setDentists] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    Promise.all([getUsers('patient'), getUsers('dentist'), getAppointments()])
      .then(([p, d, a]) => {
        setPatients(p.data.data)
        setDentists(d.data.data)
        setAppointments(a.data.data)
      })
      .catch(() => setError('Could not load clinic overview.'))
      .finally(() => setLoading(false))
  }, [])

  const today = todayISO()
  const todaysAppts = appointments
    .filter((a) => a.date.slice(0, 10) === today)
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
  const pendingCount = appointments.filter((a) => a.status === 'pending').length

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Clinic overview</span>
            <h1>Everything running smoothly.</h1>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link to="/app/users" className="btn btn-ghost">Manage users</Link>
            <Link to="/app/appointments" className="btn btn-primary">All appointments</Link>
          </div>
        </div>

        {loading && <ToothLoader label="Loading clinic data…" />}
        {!loading && error && <div className="form-error">{error}</div>}

        {!loading && !error && (
          <>
            <div className="grid grid-4" style={{ marginBottom: 32 }}>
              <div className="stat-card"><div className="stat-value">{patients.length}</div><div className="stat-label">Patients</div></div>
              <div className="stat-card"><div className="stat-value">{dentists.length}</div><div className="stat-label">Dentists</div></div>
              <div className="stat-card"><div className="stat-value">{appointments.length}</div><div className="stat-label">Total appointments</div></div>
              <div className="stat-card"><div className="stat-value">{pendingCount}</div><div className="stat-label">Awaiting confirmation</div></div>
            </div>

            <h2 style={{ marginBottom: 14 }}>Today's appointments ({todaysAppts.length})</h2>
            {todaysAppts.length === 0 ? (
              <div className="empty-state card"><h3>Nothing booked today</h3></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {todaysAppts.map((a) => (
                  <AppointmentCard key={a._id} appointment={a} viewerRole="admin" />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
