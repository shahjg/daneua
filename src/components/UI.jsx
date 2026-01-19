import { useState, useEffect } from 'react'

// Toast notification
export function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  const bgColor = type === 'error' ? 'bg-rose-500' : type === 'success' ? 'bg-forest' : 'bg-gold-500'

  return (
    <div className="fixed top-4 left-4 right-4 z-[100] animate-slide-down">
      <div className={`${bgColor} text-white px-4 py-3 rounded-2xl shadow-lg max-w-md mx-auto`}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-body-sm">{message}</p>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none">&times;</button>
        </div>
      </div>
    </div>
  )
}

// Confirm dialog
export function ConfirmDialog({ title, message, confirmText = 'Delete', cancelText = 'Cancel', onConfirm, onCancel, danger = true }) {
  return (
    <div className="fixed inset-0 bg-forest-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-6" onClick={onCancel}>
      <div className="bg-cream rounded-3xl p-6 max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="font-serif text-title text-forest mb-2">{title}</h3>
        <p className="text-body text-ink-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-3 bg-cream-200 text-forest rounded-xl font-medium">
            {cancelText}
          </button>
          <button 
            onClick={onConfirm} 
            className={`flex-1 py-3 rounded-xl font-medium ${danger ? 'bg-rose-500 text-white' : 'bg-forest text-cream-100'}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

// Global toast state manager
let toastCallback = null

export function setToastCallback(cb) {
  toastCallback = cb
}

export function showToast(message, type = 'error') {
  if (toastCallback) {
    toastCallback({ message, type })
  }
}

// Toast provider component
export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  useEffect(() => {
    setToastCallback(setToast)
    return () => setToastCallback(null)
  }, [])

  return (
    <>
      {children}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  )
}
