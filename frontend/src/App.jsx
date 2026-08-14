import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import RoleGate from './components/RoleGate.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import RoleHome from './pages/RoleHome.jsx'
import AppointmentsRoute from './pages/AppointmentsRoute.jsx'
import BookAppointment from './pages/patient/BookAppointment.jsx'
import ManageUsers from './pages/admin/ManageUsers.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/app" element={<ProtectedRoute />}>
        <Route index element={<RoleHome />} />
        <Route path="appointments" element={<AppointmentsRoute />} />

        <Route element={<RoleGate roles={['patient']} />}>
          <Route path="book" element={<BookAppointment />} />
        </Route>

        <Route element={<RoleGate roles={['admin']} />}>
          <Route path="users" element={<ManageUsers />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
