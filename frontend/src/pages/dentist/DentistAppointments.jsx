import { useEffect, useState } from 'react'
import { getAppointments, updateAppointment } from '../../api/endpoints.js'
import AppointmentCard from '../../components/AppointmentCard.jsx'
import ToothLoader from '../../components/ToothLoader.jsx'
import Modal from '../../components/Modal.jsx'

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

export default function DentistAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('all')
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
      const { data } = await getAppointments()
      setAppointments(data.data)
    } catch {
      setError('Could not load your schedule.')
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

  const filtered = appointments
    .filter((a) => filter === 'all' || a.status === filter)
    .sort((a, b) => new Date(b.date) - new Date(a.date) || a.startTime.localeCompare(b.startTime))

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">My schedule</span>
            <h1>Every appointment on your calendar.</h1>
          </div>
        </div>

        <div className="tab-row">
          {FILTERS.map((f) => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading && <ToothLoader label="Loading schedule…" />}
        {!loading && error && <div className="form-error">{error}</div>}
        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state card"><h3>Nothing here</h3><p>Try a different filter.</p></div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((appt) => (
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
