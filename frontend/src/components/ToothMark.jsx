export default function ToothMark({ size = 50, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 26 26" fill="none" aria-hidden="true">
      <path
        d="M13 3c-3.2 0-4.4 2-6.4 2C4.3 5 3 6.8 3 9.4c0 2.6 1.1 5 1.9 7.6.7 2.3 1.2 5.5 3 5.5 1.6 0 1.6-3.4 2.6-5 .5-.8 1-1.2 1.5-1.2s1 .4 1.5 1.2c1 1.6 1 5 2.6 5 1.8 0 2.3-3.2 3-5.5.8-2.6 1.9-5 1.9-7.6C21 6.8 19.7 5 17.4 5c-2 0-3.2-2-6.4-2z"
        fill={color}
      />
    </svg>
  )
}
