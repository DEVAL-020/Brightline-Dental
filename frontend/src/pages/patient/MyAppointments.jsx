import { useEffect, useState } from 'react'
import { getAppointments, updateAppointment, getDentists, getAvailability } from '../../api/endpoints.js'
import { generateSlots } from '../../utils/schedule.js'
import AppointmentCard from '../../components/AppointmentCard.jsx'
import ToothLoader from '../../components/ToothLoader.jsx'
import Modal from '../../components/Modal.jsx'

const FILTERS = ['all', 'pending', 'confirmed', 'completed', 'cancelled']

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [rescheduling, setRescheduling] = useState(null) // appointment being rescheduled
  const [dentistDetail, setDentistDetail] = useState(null)
  const [newDate, setNewDate] = useState(todayISO())
  const [newSlot, setNewSlot] = useState(null)
  const [rescheduleError, setRescheduleError] = useState('')
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false)
  const [rescheduleBooked, setRescheduleBooked] = useState([])

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data } = await getAppointments()
      setAppointments(data.data)
    } catch {
      setError('Could not load your appointment history.')
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

  async function openReschedule(appointment) {
    setRescheduling(appointment)
    setNewDate(appointment.date.slice(0, 10))
    setNewSlot(null)
    setRescheduleError('')
    setDentistDetail(null)
    try {
      const { data } = await getDentists()
      const match = data.data.find((d) => d._id === appointment.dentist._id)
      setDentistDetail(match || null)
    } catch {
      setRescheduleError('Could not load this dentist\u2019s schedule.')
    }
  }

  async function submitReschedule() {
    if (!newSlot) {
      setRescheduleError('Choose a new time slot.')
      return
    }
    setRescheduleSubmitting(true)
    setRescheduleError('')
    try {
      const { data } = await updateAppointment(rescheduling._id, {
        date: newDate,
        startTime: newSlot.startTime,
        endTime: newSlot.endTime
      })
      setAppointments((prev) => prev.map((a) => (a._id === rescheduling._id ? data.data : a)))
      setRescheduling(null)
    } catch (err) {
      setRescheduleError(err.response?.data?.message || 'Could not reschedule. Try a different slot.')
    } finally {
      setRescheduleSubmitting(false)
    }
  }

  const filtered = appointments
    .filter((a) => filter === 'all' || a.status === filter)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const rescheduleSlots = dentistDetail ? generateSlots(dentistDetail, newDate, rescheduleBooked) : []

  useEffect(() => {
    if (!dentistDetail || !newDate) {
      setRescheduleBooked([])
      return
    }
    let cancelled = false
    getAvailability(dentistDetail._id, newDate, rescheduling?._id)
      .then(({ data }) => {
        if (!cancelled) setRescheduleBooked(data.data.map((b) => ({ ...b, date: newDate })))
      })
      .catch(() => {
        if (!cancelled) setRescheduleBooked([])
      })
    return () => { cancelled = true }
  }, [dentistDetail, newDate])

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Appointment history</span>
            <h1>Every visit, in one timeline.</h1>
          </div>
        </div>

        <div className="tab-row">
          {FILTERS.map((f) => (
            <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading && <ToothLoader label="Fetching your history…" />}
        {!loading && error && <div className="form-error">{error}</div>}

        {!loading && !error && filtered.length === 0 && (
          <div className="empty-state card"><h3>No appointments here</h3><p>Try a different filter, or book your first visit.</p></div>
        )}

        {!loading && filtered.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map((appt) => (
              <AppointmentCard key={appt._id} appointment={appt} viewerRole="patient" onCancel={handleCancel} onReschedule={openReschedule} />
            ))}
          </div>
        )}
      </div>

      {rescheduling && (
        <Modal title="Reschedule appointment" onClose={() => setRescheduling(null)}>
          {rescheduleError && <div className="form-error">{rescheduleError}</div>}
          {!dentistDetail ? (
            <ToothLoader label="Loading availability…" />
          ) : (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="reschedule-date">New date</label>
                <input
                  id="reschedule-date" type="date" className="form-input" min={todayISO()}
                  value={newDate} onChange={(e) => { setNewDate(e.target.value); setNewSlot(null) }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">New time</label>
                {rescheduleSlots.length === 0 ? (
                  <p className="form-hint">No working hours for Dr. {dentistDetail.name} on this day.</p>
                ) : (
                  <div className="slot-grid">
                    {rescheduleSlots.map((s) => (
                      <button
                        type="button" key={s.startTime}
                        disabled={!s.available}
                        title={s.available ? undefined : 'Already booked'}
                        className={`slot-btn${newSlot?.startTime === s.startTime ? ' selected' : ''}`}
                        onClick={() => setNewSlot(s)}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="btn btn-primary btn-block" onClick={submitReschedule} disabled={rescheduleSubmitting || !newSlot}>
                {rescheduleSubmitting ? 'Saving…' : 'Confirm new time'}
              </button>
            </>
          )}
        </Modal>
      )}
    </main>
  )
}
