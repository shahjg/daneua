import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const [selectedUser, setSelectedUser] = useState(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handlePinInput = (digit) => {
    if (pin.length < 4) {
      const newPin = pin + digit
      setPin(newPin)
      setError('')
      if (newPin.length === 4) {
        if (login(selectedUser, newPin)) {
          navigate('/')
        } else {
          setError('Wrong PIN')
          setPin('')
        }
      }
    }
  }

  const handleDelete = () => {
    setPin(pin.slice(0, -1))
    setError('')
  }

  if (!selectedUser) {
    return (
      <div className="min-h-screen bg-forest flex flex-col items-center justify-center p-6">
        <h1 className="font-serif text-display text-cream-100 mb-2 text-center">D(ane)ua</h1>
        <p className="text-body text-cream-200/70 mb-12">Our little world</p>
        
        <div className="w-full max-w-xs space-y-4">
          <button
            onClick={() => setSelectedUser('shahjahan')}
            className="w-full bg-cream-100 text-forest py-4 px-6 rounded-2xl font-serif text-title hover:bg-cream-50 transition-colors"
          >
            I'm Shahjahan
          </button>
          <button
            onClick={() => setSelectedUser('dane')}
            className="w-full bg-cream-100/10 text-cream-100 py-4 px-6 rounded-2xl font-serif text-title border border-cream-100/30 hover:bg-cream-100/20 transition-colors"
          >
            I'm Dane
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-forest flex flex-col items-center justify-center p-6">
      <button onClick={() => { setSelectedUser(null); setPin(''); setError('') }} className="absolute top-6 left-6 text-cream-100/70 text-body-sm">← Back</button>
      
      <h2 className="font-serif text-title text-cream-100 mb-2">Hi, {selectedUser === 'shahjahan' ? 'Shahjahan' : 'Dane'}</h2>
      <p className="text-body-sm text-cream-200/70 mb-8">Enter your PIN</p>

      <div className="flex gap-3 mb-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`w-4 h-4 rounded-full transition-all ${pin.length > i ? 'bg-gold' : 'bg-cream-100/30'}`} />
        ))}
      </div>

      {error && <p className="text-rose-300 text-body-sm mb-4">{error}</p>}

      <div className="grid grid-cols-3 gap-4 w-full max-w-xs">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, null, 0, 'del'].map((item, i) => (
          item === null ? <div key={i} /> : (
            <button
              key={i}
              onClick={() => item === 'del' ? handleDelete() : handlePinInput(String(item))}
              className="aspect-square rounded-full bg-cream-100/10 text-cream-100 font-serif text-title flex items-center justify-center hover:bg-cream-100/20 transition-colors"
            >
              {item === 'del' ? '⌫' : item}
            </button>
          )
        ))}
      </div>
    </div>
  )
}
