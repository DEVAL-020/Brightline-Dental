// The backend only stores each dentist's weekly workingHours
// (e.g. [{ day: 'monday', start: '09:00', end: '17:00' }]).
// There's no dedicated "slots" endpoint, so the frontend generates
// candidate slots client-side; the server is still the source of
// truth and rejects (409) any slot that's already taken.

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
const SLOT_MINUTES = 30

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function toHHMM(totalMinutes) {
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function dayNameFor(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`)
  return DAY_NAMES[d.getDay()]
}

export function formatTime12h(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const period = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`
}

// Returns [{ startTime, endTime, label }] for the given dentist + date,
// excluding slots that overlap appointments already known to the caller.
export function generateSlots(dentist, dateStr, existingAppointments = []) {
  if (!dentist?.workingHours?.length) return []
  const day = dayNameFor(dateStr)
  const hours = dentist.workingHours.find((wh) => wh.day === day)
  if (!hours) return []

  const start = toMinutes(hours.start)
  const end = toMinutes(hours.end)
  const slots = []

  for (let t = start; t + SLOT_MINUTES <= end; t += SLOT_MINUTES) {
    const startTime = toHHMM(t)
    const endTime = toHHMM(t + SLOT_MINUTES)
    const taken = existingAppointments.some(
      (a) => a.date?.slice(0, 10) === dateStr && startTime < a.endTime && endTime > a.startTime
    )
    slots.push({ startTime, endTime, label: formatTime12h(startTime), available: !taken })
  }
  return slots
}
