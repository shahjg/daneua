import { useState } from 'react'

// Reusable Modal Component
export function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-forest-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-cream rounded-2xl w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

// Confirm Dialog (replaces browser confirm)
export function ConfirmModal({ isOpen, onClose, onConfirm, title, message, confirmText = 'Delete', cancelText = 'Cancel', danger = true }) {
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 bg-forest-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div className="bg-cream rounded-2xl w-full max-w-sm shadow-xl p-6" onClick={e => e.stopPropagation()}>
        <h3 className="font-serif text-title text-forest mb-2">{title}</h3>
        <p className="text-body text-ink-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-cream-200 text-forest rounded-xl font-medium">
            {cancelText}
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }} 
            className={`flex-1 py-3 rounded-xl font-medium ${danger ? 'bg-rose-500 text-white' : 'bg-forest text-cream-100'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Alert/Toast (replaces browser alert)
export function Toast({ message, type = 'error', isOpen, onClose }) {
  if (!isOpen) return null
  
  const bgColor = type === 'error' ? 'bg-rose-500' : type === 'success' ? 'bg-forest' : 'bg-gold-500'
  
  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex justify-center">
      <div className={`${bgColor} text-white px-6 py-4 rounded-2xl shadow-xl max-w-sm`}>
        <div className="flex items-center justify-between gap-4">
          <p className="text-body-sm">{message}</p>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

// Hook for using toast
export function useToast() {
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'error' })
  
  const showToast = (message, type = 'error') => {
    setToast({ isOpen: true, message, type })
    setTimeout(() => setToast(t => ({ ...t, isOpen: false })), 4000)
  }
  
  const hideToast = () => setToast(t => ({ ...t, isOpen: false }))
  
  return { toast, showToast, hideToast }
}
