import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import PublicNav from '../components/PublicNav.jsx'
import PublicFooter from '../components/PublicFooter.jsx'
import ToothMark from '../components/ToothMark.jsx'
import { getDentists } from '../api/endpoints.js'
import teethlogo from '../assets/teeth-logo.jpg'

const FEATURES = [
  {
    title: 'Book in under a minute',
    body: 'Pick a dentist, see their working hours, choose an open slot — done. No phone tag.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="3" /><path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Real dentist availability',
    body: "Every dentist's own working hours drive what you see — no guessing, no double-booking.",
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2">
        <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Your full visit history',
    body: 'Every appointment — upcoming, completed, or cancelled — stays in one place you control.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2">
        <path d="M4 4h16v16H4z" opacity="0" /><path d="M6 3v18M6 8h12M6 13h12M6 18h8" strokeLinecap="round" />
      </svg>
    )
  },
  {
    title: 'Secure, role-based access',
    body: 'Patients, dentists, and clinic admins each see exactly what they need — nothing more.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" strokeWidth="2">
        <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" strokeLinejoin="round" />
      </svg>
    )
  }
]

const REVIEWS = [
  { name: 'A. Mehta', text: 'Booked a cleaning between classes in about 30 seconds. Reminder emails saved me twice already.' },
  { name: 'R. Fernandes', text: 'I like that I can see my whole appointment history instead of digging through texts and calls.' },
  { name: 'S. Iyer', text: 'Rescheduling used to mean a phone call during work hours. Now it takes two taps.' }
]

const FAQ = [
  { q: 'Do I need to call the clinic to book?', a: 'No — pick a dentist and an open time slot online, and it goes straight into their schedule.' },
  { q: 'Can I cancel or reschedule myself?', a: 'Yes, from "My appointments," as long as the visit is still pending or hasn\u2019t started.' },
  { q: 'Is my information shared with other patients?', a: 'No. Only you, your dentist, and clinic admins can see the details of your appointments.' }
]

function initials(name = '') {
  return name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
}

export default function Landing() {
  const [dentists, setDentists] = useState([])
  const [loadingDentists, setLoadingDentists] = useState(true)

  useEffect(() => {
    getDentists()
      .then(({ data }) => setDentists(data.data || []))
      .catch(() => setDentists([]))
      .finally(() => setLoadingDentists(false))
  }, [])

  return (
    <div className="app-shell">
      <PublicNav />

      {/* ---------- Hero ---------- */}
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="hero-eyebrow"><ToothMark size={14} color="#BFE3D8" /> Now booking online</span>
            <h1>Dental care that fits your schedule, not the other way around.</h1>
            <p className="lead">
              Brightline puts real dentist availability, easy booking, and your full visit history in one calm,
              uncluttered place — built for patients, dentists, and clinic staff.
            </p>
            <div className="hero-actions">
              <Link to="/register" className="btn btn-accent btn-lg">Book your visit</Link>
              <Link to="/login" className="btn btn-outline-light btn-lg">I have an account</Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-float top">
              <ToothMark size={18} color="var(--color-secondary)" /> Slot confirmed
            </div>
            <div className="hero-card">
              <div className="badge-row">
                <strong>Upcoming visit</strong>
                <span className="badge badge-confirmed">Confirmed</span>
              </div>
              <div className="hero-mini-appt">
                <div className="avatar">JP</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Dr. Jane Smith</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Orthodontics · Tue, 10:00 AM</div>
                </div>
              </div>
              <div className="hero-mini-appt">
                <div className="avatar" style={{ background: 'var(--color-secondary)' }}>RC</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Cleaning &amp; check-up</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--color-muted)' }}>Reason for visit</div>
                </div>
              </div>
            </div>
            <div className="hero-float bottom">2 min <span style={{ fontWeight: 400, color: 'var(--color-muted)' }}>&nbsp;to confirm</span></div>
          </div>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="section section-alt" id="services">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Why Brightline</span>
            <h2>Booking a dentist shouldn't feel like admin work.</h2>
            <p>Everything about your visit — availability, booking, and history — lives in one place.</p>
          </div>
          <div className="grid grid-auto">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p style={{ marginBottom: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Doctors (live data) ---------- */}
      <section className="section" id="doctors">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Meet the team</span>
            <h2>Dentists you can actually get an appointment with.</h2>
            <p>Availability shown here comes straight from each dentist's own schedule.</p>
          </div>

          <div className="teeth-logo">
            <img src={teethlogo} alt="teeth-logo" />
          </div>

          {loadingDentists && <p style={{ textAlign: 'center' }}>Loading dentists…</p>}

          {!loadingDentists && dentists.length === 0 && (
            <div className="empty-state">
              <h3>No dentists listed yet</h3>
              <p>Once the clinic adds dentist accounts, they'll appear here automatically.</p>
            </div>
          )}

          {!loadingDentists && dentists.length > 0 && (
            <div className="grid grid-auto">
              {dentists.slice(0, 6).map((d) => (
                <div className="doctor-card" key={d._id}>
                  <div className="doctor-photo"><div className="avatar-xl">{initials(d.name)}</div></div>
                  <div className="doctor-body">
                    <h3>Dr. {d.name}</h3>
                    <div className="doctor-spec">{d.specialization || 'General Dentistry'}</div>
                    <p style={{ marginBottom: 0, fontSize: '0.85rem' }}>
                      {d.workingHours?.length
                        ? `Available ${d.workingHours.length} day${d.workingHours.length > 1 ? 's' : ''} a week`
                        : 'Schedule coming soon'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- Reviews ---------- */}
      <section className="section section-alt" id="reviews">
        <div className="container">
          <div className="section-header">
            <span className="eyebrow">Patients say</span>
            <h2>Less waiting, less phone tag.</h2>
          </div>
          <div className="grid grid-3">
            {REVIEWS.map((r) => (
              <div className="card card-cusp" key={r.name}>
                <p style={{ color: 'var(--color-text)' }}>&ldquo;{r.text}&rdquo;</p>
                <strong style={{ color: 'var(--color-primary)', fontSize: '0.85rem' }}>{r.name}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section" id="faq">
        <div className="container-narrow">
          <div className="section-header">
            <span className="eyebrow">FAQ</span>
            <h2>Good to know</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {FAQ.map((f) => (
              <details key={f.q} className="card" style={{ cursor: 'pointer' }}>
                <summary style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{f.q}</summary>
                <p style={{ marginTop: 10, marginBottom: 0 }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="cta-band">
            <div>
              <h2>Ready when you are.</h2>
              <p>Create a free account and book your first visit in under a minute.</p>
            </div>
            <Link to="/register" className="btn btn-lg" style={{ background: '#fff', color: 'var(--color-secondary)', borderRadius: 'var(--cusp)' }}>
              Create your account
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
