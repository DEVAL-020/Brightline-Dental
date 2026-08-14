import api from './axios.js'

/*
 * Mirrors dental-appointment-backend exactly:
 *   routes/authRoutes.js, routes/userRoutes.js, routes/appointmentRoutes.js
 * Every response is wrapped as { success, data, count?, message? }.
 */

// ---- Auth ----
export const registerUser = (payload) => api.post('/auth/register', payload)
export const loginUser = (payload) => api.post('/auth/login', payload)
export const getMe = () => api.get('/auth/me')

// ---- Dentists (public) ----
export const getDentists = () => api.get('/users/dentists')

// ---- Users (admin only) ----
export const getUsers = (role) => api.get('/users', { params: role ? { role } : {} })
export const getUserById = (id) => api.get(`/users/${id}`)
export const createUser = (payload) => api.post('/users', payload)
export const updateUser = (id, payload) => api.patch(`/users/${id}`, payload)
export const deactivateUser = (id) => api.delete(`/users/${id}`)

// ---- Appointments ----
export const createAppointment = (payload) => api.post('/appointments', payload)
export const getAppointments = (params = {}) => api.get('/appointments', { params })
export const getAppointmentById = (id) => api.get(`/appointments/${id}`)
export const updateAppointment = (id, payload) => api.patch(`/appointments/${id}`, payload)
export const deleteAppointment = (id) => api.delete(`/appointments/${id}`)
export const getAvailability = (dentist, date, excludeId) =>
  api.get('/appointments/availability', { params: { dentist, date, excludeId } })
