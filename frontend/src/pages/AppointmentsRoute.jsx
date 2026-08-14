import { useAuth } from '../context/AuthContext.jsx'
import MyAppointments from './patient/MyAppointments.jsx'
import DentistAppointments from './dentist/DentistAppointments.jsx'
import ManageAppointments from './admin/ManageAppointments.jsx'

export default function AppointmentsRoute() {
  const { user } = useAuth()
  if (user?.role === 'dentist') return <DentistAppointments />
  if (user?.role === 'admin') return <ManageAppointments />
  return <MyAppointments />
}
