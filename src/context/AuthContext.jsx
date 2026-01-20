import { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

const AuthContext = createContext({})

const USERS = {
  shahjahan: { name: 'Shahjahan', pin: '1111' },
  dane: { name: 'Dane', pin: '2222' }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('daneua_user')
    if (saved) setUser(JSON.parse(saved))
    setLoading(false)
  }, [])

  const login = (userId, pin) => {
    const u = USERS[userId]
    if (u && u.pin === pin) {
      const userData = { id: userId, name: u.name }
      setUser(userData)
      localStorage.setItem('daneua_user', JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('daneua_user')
  }

  const getPartner = () => {
    if (!user) return null
    return user.id === 'shahjahan' ? { id: 'dane', name: 'Dane' } : { id: 'shahjahan', name: 'Shahjahan' }
  }

  if (loading) return <div className="min-h-screen bg-cream-100 flex items-center justify-center"><div className="w-8 h-8 border-4 border-forest border-t-transparent rounded-full animate-spin" /></div>

  return (
    <AuthContext.Provider value={{ user, login, logout, getPartner, supabase }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
