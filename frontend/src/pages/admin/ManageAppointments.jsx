import { useEffect, useState } from 'react'
import { getAppointments, updateAppointment, deleteAppointment } from '../../api/endpoints.js'
import StatusBadge from '../../components/StatusBadge.jsx'
import ToothLoader from '../../components/ToothLoader.jsx'
import { formatTime12h } from '../../utils/schedule.js'

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('all')
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
      setError('Could not load appointments.')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(appointment, status) {
    try {
      const { data } = await updateAppointment(appointment._id, { status })
      setAppointments((prev) => prev.map((a) => (a._id === appointment._id ? data.data : a)))
    } catch {
      alert('Could not update this appointment.')
    }
  }

  async function handleDelete(appointment) {
    if (!window.confirm('Permanently delete this appointment record? This cannot be undone.')) return
    try {
      await deleteAppointment(appointment._id)
      setAppointments((prev) => prev.filter((a) => a._id !== appointment._id))
    } catch {
      alert('Could not delete this appointment.')
    }
  }

  const filtered = appointments
    .filter((a) => filter === 'all' || a.status === filter)
    .sort((a, b) => new Date(b.date) - new Date(a.date) || a.startTime.localeCompare(b.startTime))

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Clinic-wide</span>
            <h1>All appointments.</h1>
          </div>
        </div>

        <div className="tab-row">
          {FILTERS.map((f) => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading && <ToothLoader label="Loading appointments…" />}
        {!loading && error && <div className="form-error">{error}</div>}

        {!loading && !error && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Date</th><th>Time</th><th>Patient</th><th>Dentist</th><th>Reason</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((a) => (
                  <tr key={a._id}>
                    <td>{new Date(a.date).toLocaleDateString()}</td>
                    <td style={{ fontFamily: 'var(--font-mono)' }}>{formatTime12h(a.startTime)}</td>
                    <td>{a.patient?.name}</td>
                    <td>Dr. {a.dentist?.name}</td>
                    <td>{a.reason}</td>
                    <td><StatusBadge status={a.status} /></td>
                    <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {a.status === 'pending' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(a, 'confirmed')}>Confirm</button>
                      )}
                      {a.status === 'confirmed' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(a, 'completed')}>Complete</button>
                      )}
                      {(a.status === 'pending' || a.status === 'confirmed') && (
                        <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(a, 'cancelled')}>Cancel</button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a)}>Delete</button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No appointments match this filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
