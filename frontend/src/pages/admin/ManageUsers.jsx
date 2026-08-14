import { useEffect, useState } from 'react'
import { getUsers, createUser, updateUser, deactivateUser } from '../../api/endpoints.js'
import ToothLoader from '../../components/ToothLoader.jsx'
import Modal from '../../components/Modal.jsx'
import WorkingHoursEditor from '../../components/WorkingHoursEditor.jsx'

const ROLE_FILTERS = ['all', 'patient', 'dentist', 'admin']

const EMPTY_FORM = { name: '', email: '', password: '', role: 'patient', phone: '', specialization: '', licenseNumber: '' }

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [roleFilter, setRoleFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [workingHours, setWorkingHours] = useState([])
  const [createError, setCreateError] = useState('')
  const [creating, setCreating] = useState(false)

  const [hoursTarget, setHoursTarget] = useState(null)
  const [hoursDraft, setHoursDraft] = useState([])
  const [savingHours, setSavingHours] = useState(false)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    setError('')
    try {
      const { data } = await getUsers()
      setUsers(data.data)
    } catch {
      setError('Could not load users.')
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setWorkingHours([])
    setCreateError('')
    setShowCreate(true)
  }

  async function handleCreate(e) {
    e.preventDefault()
    setCreateError('')
    setCreating(true)
    try {
      const payload = { ...form }
      if (form.role === 'dentist') payload.workingHours = workingHours
      if (form.role !== 'dentist') { delete payload.specialization; delete payload.licenseNumber }
      const { data } = await createUser(payload)
      setUsers((prev) => [data.data, ...prev])
      setShowCreate(false)
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Could not create the account.')
    } finally {
      setCreating(false)
    }
  }

  async function handleDeactivate(user) {
    if (!window.confirm(`Deactivate ${user.name}? They won't be able to sign in.`)) return
    try {
      const { data } = await deactivateUser(user._id)
      setUsers((prev) => prev.map((u) => (u._id === user._id ? data.data : u)))
    } catch {
      alert('Could not deactivate this account.')
    }
  }

  function openHours(user) {
    setHoursTarget(user)
    setHoursDraft(user.workingHours || [])
  }

  async function saveHours() {
    setSavingHours(true)
    try {
      const { data } = await updateUser(hoursTarget._id, { workingHours: hoursDraft })
      setUsers((prev) => prev.map((u) => (u._id === hoursTarget._id ? data.data : u)))
      setHoursTarget(null)
    } catch {
      alert('Could not save working hours.')
    } finally {
      setSavingHours(false)
    }
  }

  const filtered = users.filter((u) => roleFilter === 'all' || u.role === roleFilter)

  return (
    <main className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <span className="eyebrow">Clinic staff &amp; patients</span>
            <h1>Manage users.</h1>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>Add user</button>
        </div>

        <div className="tab-row">
          {ROLE_FILTERS.map((r) => (
            <button key={r} className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setRoleFilter(r)}>
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {loading && <ToothLoader label="Loading users…" />}
        {!loading && error && <div className="form-error">{error}</div>}

        {!loading && !error && (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Name</th><th>Email</th><th>Role</th><th>Phone</th><th>Status</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td><span className="badge badge-role">{u.role}</span></td>
                    <td>{u.phone || '—'}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-confirmed' : 'badge-cancelled'}`}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      {u.role === 'dentist' && (
                        <button className="btn btn-ghost btn-sm" onClick={() => openHours(u)}>Hours</button>
                      )}
                      {u.isActive && (
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(u)}>Deactivate</button>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--color-muted)' }}>No users match this filter.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreate && (
        <Modal title="Add a user" onClose={() => setShowCreate(false)}>
          {createError && <div className="form-error">{createError}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                <option value="patient">Patient</option>
                <option value="dentist">Dentist</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="form-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Temporary password</label>
              <input type="text" className="form-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>

            {form.role === 'dentist' && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Specialization</label>
                    <input className="form-input" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">License number</label>
                    <input className="form-input" value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Working hours</label>
                  <WorkingHoursEditor value={workingHours} onChange={setWorkingHours} />
                </div>
              </>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={creating}>
              {creating ? 'Creating…' : 'Create account'}
            </button>
          </form>
        </Modal>
      )}

      {hoursTarget && (
        <Modal title={`Working hours — Dr. ${hoursTarget.name}`} onClose={() => setHoursTarget(null)}>
          <div className="form-group">
            <WorkingHoursEditor value={hoursDraft} onChange={setHoursDraft} />
          </div>
          <button className="btn btn-primary btn-block" onClick={saveHours} disabled={savingHours}>
            {savingHours ? 'Saving…' : 'Save hours'}
          </button>
        </Modal>
      )}
    </main>
  )
}
