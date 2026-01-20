import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [step, setStep] = useState('select')
  const [selectedRole, setSelectedRole] = useState(null)
  const [pin, setPin] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setStep('pin')
    setError('')
  }

  const handlePinChange = (index, value) => {
    if (value.length > 1) return
    if (value && !/^\d$/.test(value)) return

    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    if (value && index < 3) {
      const next = document.getElementById(`pin-${index + 1}`)
      next?.focus()
    }

    if (index === 3 && value) {
      const fullPin = [...newPin.slice(0, 3), value].join('')
      handleSubmit(fullPin)
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prev = document.getElementById(`pin-${index - 1}`)
      prev?.focus()
    }
  }

  const handleSubmit = async (fullPin) => {
    setLoading(true)
    setError('')

    try {
      await login(selectedRole, fullPin)
    } catch (err) {
      setError('Wrong PIN. Try again.')
      setPin(['', '', '', ''])
      document.getElementById('pin-0')?.focus()
    }

    setLoading(false)
  }

  const handleBack = () => {
    setStep('select')
    setSelectedRole(null)
    setPin(['', '', '', ''])
    setError('')
  }

  return (
    <div className="min-h-screen bg-forest flex flex-col">
      {/* Top section */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 pt-20 pb-10">
        <div className="text-center">
          <h1 className="font-serif text-display-sm text-cream-100 mb-4">
            D(ane)ua
          </h1>
          <div className="w-12 h-1 bg-gold rounded-full mx-auto mb-6" />
          <p className="text-body text-cream-300">
            Our little world
          </p>
        </div>
      </div>

      {/* Bottom card */}
      <div className="bg-cream rounded-t-[3rem] px-8 pt-10 pb-12" style={{ paddingBottom: 'max(48px, env(safe-area-inset-bottom))' }}>
        {step === 'select' ? (
          <div className="space-y-6 max-w-sm mx-auto">
            <div className="text-center mb-8">
              <h2 className="font-serif text-title text-forest mb-2">Welcome back</h2>
              <p className="text-body-sm text-ink-400">Who's this?</p>
            </div>

            <button
              onClick={() => handleRoleSelect('shah')}
              className="w-full bg-white rounded-2xl p-6 text-left shadow-soft hover:shadow-card transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-serif text-title-sm text-forest group-hover:text-forest-700">Shahjahan</p>
                  <p className="text-body-sm text-ink-400">The one building this</p>
                </div>
                <div className="w-12 h-12 bg-forest-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">👨‍💻</span>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleRoleSelect('dane')}
              className="w-full bg-white rounded-2xl p-6 text-left shadow-soft hover:shadow-card transition-all duration-200 group"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-serif text-title-sm text-forest group-hover:text-forest-700">Dane</p>
                  <p className="text-body-sm text-ink-400">The reason it exists</p>
                </div>
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                  <span className="text-xl">💕</span>
                </div>
              </div>
            </button>
          </div>
        ) : (
          <div className="space-y-8 max-w-sm mx-auto">
            <button 
              onClick={handleBack}
              className="text-body-sm text-ink-400 hover:text-forest flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>

            <div className="text-center">
              <h2 className="font-serif text-title text-forest mb-2">
                Hey {selectedRole === 'shah' ? 'Shahjahan' : 'Dane'}
              </h2>
              <p className="text-body-sm text-ink-400">Enter your PIN</p>
            </div>

            <div className="flex justify-center gap-4">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  id={`pin-${index}`}
                  type="tel"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-14 h-16 text-center text-2xl font-serif bg-white border-2 border-cream-300 rounded-2xl focus:border-forest focus:ring-0 focus:outline-none transition-all"
                  autoFocus={index === 0}
                  disabled={loading}
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-rose-500 text-body-sm">
                {error}
              </p>
            )}

            {loading && (
              <p className="text-center text-ink-400 text-body-sm animate-pulse">
                Checking...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
