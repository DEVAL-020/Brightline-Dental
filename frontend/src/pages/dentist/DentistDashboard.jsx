import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import { getAppointments, updateAppointment } from '../../api/endpoints.js'
import AppointmentCard from '../../components/AppointmentCard.jsx'
import ToothLoader from '../../components/ToothLoader.jsx'
import Modal from '../../components/Modal.jsx'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function DentistDashboard() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notesTarget, setNotesTarget] = useState(null)
  const [notesDraft, setNotesDraft] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data } = await getAppointments({ from: todayISO(), to: todayISO() })
      setAppointments(data.data)
    } catch {
      setError('Could not load today\u2019s schedule.')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatus(appointment, status) {
    try {
      const { data } = await updateAppointment(appointment._id, { status })
      setAppointments((prev) => prev.map((a) => (a._id === appointment._id ? data.data : a)))
    } catch {
      alert('Could not update this appointment.')
    }
  }

  async function handleCancel(appointment) {
    if (!window.confirm('Cancel this appointment?')) return
    handleStatus(appointment, 'cancelled')
  }

  function openNotes(appointment) {
    setNotesTarget(appointment)
    setNotesDraft(appointment.notes || '')
  }

  async function saveNotes() {
    setSavingNotes(true)
    try {
      const { data } = await updateAppointment(notesTarget._id, { notes: notesDraft })
      setAppointments((prev) => prev.map((a) => (a._id === notesTarget._id ? data.data : a)))
      setNotesTarget(null)
    } catch {
      alert('Could not save the note.')
    } finally {
      setSavingNotes(false)
    }
  }

  const sorted = useMemo(() => [...appointments].sort((a, b) => a.startTime.localeCompare(b.startTime)), [appointments])
  const pendingCount = appointments.filter((a) => a.status === 'pending').length
  const confirmedCount = appointments.filter((a) => a.status === 'confirmed').length

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Today &middot; {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            <h1>Good to see you, Dr. {user?.name?.split(' ').slice(-1)[0]}.</h1>
          </div>
        </div>

        <div className="grid grid-3" style={{ marginBottom: 32 }}>
          <div className="stat-card"><div className="stat-value">{sorted.length}</div><div className="stat-label">Appointments today</div></div>
          <div className="stat-card"><div className="stat-value">{pendingCount}</div><div className="stat-label">Awaiting confirmation</div></div>
          <div className="stat-card"><div className="stat-value">{confirmedCount}</div><div className="stat-label">Confirmed</div></div>
        </div>

        <h2 style={{ marginBottom: 14 }}>Today's schedule</h2>

        {loading && <ToothLoader label="Loading today's appointments…" />}
        {!loading && error && <div className="form-error">{error}</div>}

        {!loading && !error && sorted.length === 0 && (
          <div className="empty-state card"><h3>Nothing booked today</h3><p>Enjoy the quiet — new bookings will show up here.</p></div>
        )}

        {!loading && sorted.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {sorted.map((appt) => (
              <AppointmentCard
                key={appt._id}
                appointment={appt}
                viewerRole="dentist"
                onUpdateStatus={handleStatus}
                onCancel={handleCancel}
                onEditNotes={openNotes}
              />
            ))}
          </div>
        )}
      </div>

      {notesTarget && (
        <Modal title={`Notes — ${notesTarget.patient?.name}`} onClose={() => setNotesTarget(null)}>
          <div className="form-group">
            <textarea className="form-textarea" rows={4} value={notesDraft} onChange={(e) => setNotesDraft(e.target.value)} placeholder="Internal notes for this visit…" />
          </div>
          <button className="btn btn-primary btn-block" onClick={saveNotes} disabled={savingNotes}>
            {savingNotes ? 'Saving…' : 'Save note'}
          </button>
        </Modal>
      )}
    </main>
  )
}
