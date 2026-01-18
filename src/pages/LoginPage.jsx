import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const [step, setStep] = useState('select') // 'select' | 'pin'
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

    // Auto-focus next input
    if (value && index < 3) {
      const next = document.getElementById(`pin-${index + 1}`)
      next?.focus()
    }

    // Auto-submit when complete
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
        <div className="text-center animate-fade-up">
          <h1 className="font-serif text-display-sm text-cream-100 mb-4">
            D(ane)ua
          </h1>
          <div className="line-accent mx-auto mb-6 bg-gold" />
          <p className="text-body text-cream-300">
            Our little world
          </p>
        </div>
      </div>

      {/* Bottom card */}
      <div className="bg-cream rounded-t-[3rem] px-8 pt-10 pb-12 safe-bottom animate-slide-up">
        {step === 'select' ? (
          <div className="space-y-6">
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
                  <p className="font-serif text-title-sm text-forest group-hover:text-forest-700">Shah</p>
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
          <div className="space-y-8 animate-fade-in">
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
                Hey {selectedRole === 'shah' ? 'Shah' : 'Dane'}
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
                  className="pin-input"
                  autoFocus={index === 0}
                  disabled={loading}
                />
              ))}
            </div>

            {error && (
              <p className="text-center text-rose-500 text-body-sm animate-fade-in">
                {error}
              </p>
            )}

            {loading && (
              <p className="text-center text-ink-400 text-body-sm animate-pulse-soft">
                Checking...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
