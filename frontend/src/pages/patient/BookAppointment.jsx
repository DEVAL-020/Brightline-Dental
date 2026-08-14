import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDentists, createAppointment, getAvailability } from '../../api/endpoints.js'
import { generateSlots } from '../../utils/schedule.js'
import ToothLoader from '../../components/ToothLoader.jsx'

function todayISO() {
  return new Date().toISOString().slice(0, 10)
}
function initials(name = '') {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

const REASONS = ['Check-up & cleaning', 'Tooth pain', 'Cavity / filling', 'Braces / orthodontics', 'Whitening consult', 'Other']

export default function BookAppointment() {
  const navigate = useNavigate()
  const [dentists, setDentists] = useState([])
  const [dentistId, setDentistId] = useState(null)
  const [date, setDate] = useState(todayISO())
  const [slot, setSlot] = useState(null)
  const [reason, setReason] = useState(REASONS[0])
  const [notes, setNotes] = useState('')

  const [loadingDentists, setLoadingDentists] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [booked, setBooked] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    getDentists()
      .then(({ data }) => {
        setDentists(data.data)
        if (data.data.length) setDentistId(data.data[0]._id)
      })
      .catch(() => setError('Could not load the dentist list.'))
      .finally(() => setLoadingDentists(false))
  }, [])

  // Fetch which time ranges are already booked for the selected dentist/date,
  // so we can grey out slots that would otherwise fail with a 409 on submit.
  useEffect(() => {
    if (!dentistId || !date) {
      setBooked([])
      return
    }
    let cancelled = false
    setLoadingSlots(true)
    getAvailability(dentistId, date)
      .then(({ data }) => {
        if (!cancelled) setBooked(data.data.map((b) => ({ ...b, date })))
      })
      .catch(() => {
        if (!cancelled) setBooked([])
      })
      .finally(() => {
        if (!cancelled) setLoadingSlots(false)
      })
    return () => { cancelled = true }
  }, [dentistId, date])

  const selectedDentist = dentists.find((d) => d._id === dentistId)
  const slots = selectedDentist ? generateSlots(selectedDentist, date, booked) : []

  async function handleSubmit(e) {
    e.preventDefault()
    if (!dentistId || !date || !slot) {
      setError('Please choose a dentist, date, and time slot.')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await createAppointment({
        dentist: dentistId,
        date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        reason,
        notes
      })
      setSuccess(true)
    } catch (err) {
      const status = err.response?.status
      const msg = err.response?.data?.message
      if (status === 409) {
        setError(`${msg || 'That slot was just taken.'} Please pick another time.`)
        setSlot(null)
      } else {
        setError(msg || 'Could not book that appointment. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <main className="page">
        <div className="container">
          <div className="empty-state card card-cusp" style={{ maxWidth: 480, margin: '0 auto' }}>
            <h3>You're booked</h3>
            <p>
              Your appointment with Dr. {selectedDentist?.name} is set for{' '}
              {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} at {slot.label}.
              It's marked <strong>pending</strong> until the dentist confirms it.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => navigate('/app')}>Go to dashboard</button>
              <button className="btn btn-ghost" onClick={() => navigate('/app/appointments')}>View my appointments</button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Book appointment</span>
            <h1>Find a time that works.</h1>
          </div>
        </div>

        {error && <div className="form-error">{error}</div>}

        <div className="grid" style={{ gridTemplateColumns: '280px 1fr', gap: 28, alignItems: 'start' }}>
          <div>
            <h3 style={{ marginBottom: 12 }}>Dentists</h3>
            {loadingDentists ? (
              <ToothLoader label="Loading dentists…" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {dentists.map((d) => (
                  <button
                    key={d._id}
                    type="button"
                    className={`dentist-tile${d._id === dentistId ? ' selected' : ''}`}
                    onClick={() => { setDentistId(d._id); setSlot(null) }}
                  >
                    <span className="avatar">{initials(d.name)}</span>
                    <span>
                      <div style={{ fontWeight: 600 }}>Dr. {d.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)' }}>{d.specialization || 'General Dentistry'}</div>
                    </span>
                  </button>
                ))}
                {dentists.length === 0 && <p className="form-hint">No dentists available yet.</p>}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="card">
            <div className="form-group">
              <label className="form-label" htmlFor="date">Date</label>
              <input
                id="date" type="date" className="form-input" min={todayISO()} value={date}
                onChange={(e) => { setDate(e.target.value); setSlot(null) }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Available times</label>
              {!selectedDentist ? (
                <p className="form-hint">Choose a dentist first.</p>
              ) : slots.length === 0 ? (
                <p className="form-hint">Dr. {selectedDentist.name} doesn't work on this day — try another date.</p>
              ) : (
                <div className="slot-grid">
                  {slots.map((s) => (
                    <button
                      type="button"
                      key={s.startTime}
                      disabled={!s.available}
                      title={s.available ? undefined : 'Already booked'}
                      className={`slot-btn${slot?.startTime === s.startTime ? ' selected' : ''}`}
                      onClick={() => setSlot(s)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
              {loadingSlots && <p className="form-hint">Checking availability…</p>}
              <p className="form-hint" style={{ marginTop: 10 }}>
                Slots are generated from the dentist's working hours. If someone books a slot just before you, we'll let you know so you can pick another.
              </p>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reason">Reason for visit</label>
              <select id="reason" className="form-select" value={reason} onChange={(e) => setReason(e.target.value)}>
                {REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="notes">Notes (optional)</label>
              <textarea id="notes" className="form-textarea" rows={3} placeholder="Anything the dentist should know beforehand?" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={submitting || !slot}>
              {submitting ? 'Booking…' : slot ? `Confirm ${slot.label} on ${new Date(date).toLocaleDateString()}` : 'Select a time slot'}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
