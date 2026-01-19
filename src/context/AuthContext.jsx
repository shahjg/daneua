import { createContext, useContext, useState, useEffect } from 'react'
import { verifyPin, getUser } from '../lib/supabase'

const AuthContext = createContext(null)

const STORAGE_KEY = 'daneua_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const { role } = JSON.parse(saved)
      getUser(role)
        .then(setUser)
        .catch(() => localStorage.removeItem(STORAGE_KEY))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (role, pin) => {
    const valid = await verifyPin(role, pin)
    if (!valid) throw new Error('Invalid PIN')

    const userData = await getUser(role)
    setUser(userData)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ role }))
    return userData
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
