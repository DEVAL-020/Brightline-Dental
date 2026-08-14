import { useAuth } from '../context/AuthContext.jsx'
import PatientDashboard from './patient/PatientDashboard.jsx'
import DentistDashboard from './dentist/DentistDashboard.jsx'
import AdminDashboard from './admin/AdminDashboard.jsx'

export default function RoleHome() {
  const { user } = useAuth()
  if (user?.role === 'dentist') return <DentistDashboard />
  if (user?.role === 'admin') return <AdminDashboard />
  return <PatientDashboard />
}
