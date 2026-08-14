import ToothMark from './ToothMark.jsx'

export default function ToothLoader({ label = 'Loading…' }) {
  return (
    <div className="tooth-loader" role="status" aria-live="polite">
      <span style={{ marginRight: 10 }}>
        <ToothMark size={36} color="var(--color-secondary)" />
      </span>
      <span style={{ color: 'var(--color-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{label}</span>
    </div>
  )
}
