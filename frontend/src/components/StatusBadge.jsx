const LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  'no-show': 'No-show'
}

export default function StatusBadge({ status }) {
  const key = (status || 'pending').toLowerCase()
  return <span className={`badge badge-${key}`}>{LABELS[key] || status}</span>
}
