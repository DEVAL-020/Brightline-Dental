import { useTheme } from '../context/ThemeContext.jsx'

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
          <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <line x1="12" y1="1.8" x2="12" y2="4.2" />
            <line x1="12" y1="19.8" x2="12" y2="22.2" />
            <line x1="1.8" y1="12" x2="4.2" y2="12" />
            <line x1="19.8" y1="12" x2="22.2" y2="12" />
            <line x1="4.5" y1="4.5" x2="6.2" y2="6.2" />
            <line x1="17.8" y1="17.8" x2="19.5" y2="19.5" />
            <line x1="4.5" y1="19.5" x2="6.2" y2="17.8" />
            <line x1="17.8" y1="6.2" x2="19.5" y2="4.5" />
          </g>
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20.5 14.6A8.5 8.5 0 1 1 9.4 3.5a7 7 0 0 0 11.1 11.1z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  )
}
