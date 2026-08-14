const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

export default function WorkingHoursEditor({ value, onChange }) {
  const map = Object.fromEntries(value.map((wh) => [wh.day, wh]))

  function toggleDay(day, checked) {
    if (checked) {
      onChange([...value, { day, start: '09:00', end: '17:00' }])
    } else {
      onChange(value.filter((wh) => wh.day !== day))
    }
  }

  function updateTime(day, field, val) {
    onChange(value.map((wh) => (wh.day === day ? { ...wh, [field]: val } : wh)))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {DAYS.map((day) => {
        const active = Boolean(map[day])
        return (
          <div key={day} style={{ display: 'grid', gridTemplateColumns: '110px 1fr 1fr', gap: 8, alignItems: 'center' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.85rem', fontWeight: 600, color: active ? 'var(--color-primary)' : 'var(--color-muted)' }}>
              <input type="checkbox" checked={active} onChange={(e) => toggleDay(day, e.target.checked)} />
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </label>
            <input
              type="time" className="form-input" disabled={!active}
              value={map[day]?.start || '09:00'} onChange={(e) => updateTime(day, 'start', e.target.value)}
            />
            <input
              type="time" className="form-input" disabled={!active}
              value={map[day]?.end || '17:00'} onChange={(e) => updateTime(day, 'end', e.target.value)}
            />
          </div>
        )
      })}
    </div>
  )
}
