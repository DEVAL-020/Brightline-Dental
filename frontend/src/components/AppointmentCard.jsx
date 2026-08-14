import StatusBadge from './StatusBadge.jsx'
import { formatTime12h } from '../utils/schedule.js'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

export default function AppointmentCard({ appointment, viewerRole, onCancel, onUpdateStatus, onReschedule, onEditNotes }) {
  const date = new Date(appointment.date)
  const status = appointment.status?.toLowerCase()
  const isActive = status === 'pending' || status === 'confirmed'

  const counterpart =
    viewerRole === 'patient'
      ? `Dr. ${appointment.dentist?.name || 'Unknown'}`
      : appointment.patient?.name || 'Unknown patient'

  return (
    <div className="appt-card">
      <div className="appt-date">
        <div className="day">{String(date.getDate()).padStart(2, '0')}</div>
        <div className="month">{MONTHS[date.getMonth()]}</div>
      </div>
      <div>
        <div className="appt-title">{appointment.reason}</div>
        <div className="appt-meta">
          {counterpart} · {formatTime12h(appointment.startTime)}–{formatTime12h(appointment.endTime)}
        </div>
        {appointment.notes && (
          <div style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: 4 }}>Note: {appointment.notes}</div>
        )}
        <div style={{ marginTop: 8 }}>
          <StatusBadge status={appointment.status} />
        </div>
      </div>
      <div className="appt-actions">
        {viewerRole === 'patient' && isActive && status === 'pending' && onReschedule && (
          <button className="btn btn-ghost btn-sm" onClick={() => onReschedule(appointment)}>Reschedule</button>
        )}
        {viewerRole === 'patient' && isActive && onCancel && (
          <button className="btn btn-danger btn-sm" onClick={() => onCancel(appointment)}>Cancel</button>
        )}
        {(viewerRole === 'dentist' || viewerRole === 'admin') && (
          <>
            {isActive && onUpdateStatus && status === 'pending' && (
              <button className="btn btn-ghost btn-sm" onClick={() => onUpdateStatus(appointment, 'confirmed')}>Confirm</button>
            )}
            {isActive && onUpdateStatus && status === 'confirmed' && (
              <button className="btn btn-ghost btn-sm" onClick={() => onUpdateStatus(appointment, 'completed')}>Complete</button>
            )}
            {onEditNotes && (
              <button className="btn btn-ghost btn-sm" onClick={() => onEditNotes(appointment)}>Notes</button>
            )}
            {isActive && onCancel && (
              <button className="btn btn-danger btn-sm" onClick={() => onCancel(appointment)}>Cancel</button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
