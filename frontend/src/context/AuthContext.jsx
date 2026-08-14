import { createContext, useContext, useEffect, useState } from 'react'
import * as endpoints from '../api/endpoints.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('dental_user')
    const token = localStorage.getItem('dental_token')
    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser))
      } catch {
        // Corrupted/tampered localStorage value - clear it and fall back to logged-out state
        localStorage.removeItem('dental_user')
        localStorage.removeItem('dental_token')
      }
    }
    setLoading(false)
  }, [])

  function persist(data) {
    localStorage.setItem('dental_token', data.token)
    localStorage.setItem('dental_user', JSON.stringify(data.user))
    setUser(data.user)
  }

  async function login(email, password) {
    const { data } = await endpoints.loginUser({ email, password })
    persist(data.data)
    return data.data.user
  }

  async function register(payload) {
    const { data } = await endpoints.registerUser(payload)
    persist(data.data)
    return data.data.user
  }

  function logout() {
    localStorage.removeItem('dental_token')
    localStorage.removeItem('dental_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
