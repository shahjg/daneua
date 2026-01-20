import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ToastProvider } from './components/UI'
import Navigation from './components/Navigation'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import LearnPage from './pages/LearnPage'
import UsPage from './pages/UsPage'
import PlansPage from './pages/PlansPage'
import GoalsPage from './pages/GoalsPage'
import IdeasPage from './pages/IdeasPage'

function AppContent() {
  const { user, loading, logout } = useAuth()
  const [currentPage, setCurrentPage] = useState('home')
  const [showSettings, setShowSettings] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-forest flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-display-sm text-cream-100 mb-4">D(ane)ua</h1>
          <p className="text-body text-cream-300 animate-pulse-soft">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage onOpenSettings={() => setShowSettings(true)} />
      case 'learn': return <LearnPage />
      case 'us': return <UsPage />
      case 'plans': return <PlansPage />
      case 'goals': return <GoalsPage />
      case 'ideas': return <IdeasPage />
      default: return <HomePage onOpenSettings={() => setShowSettings(true)} />
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <main>
        {renderPage()}
      </main>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />

      {/* Settings Modal */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-forest-900/50 backdrop-blur-sm z-[60] flex items-center justify-center p-6"
          onClick={() => setShowSettings(false)}
        >
          <div 
            className="bg-cream rounded-3xl p-6 w-full max-w-sm shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-serif text-title text-forest text-center mb-6">Settings</h2>
            
            <div className="space-y-4">
              <div className="bg-cream-200 rounded-2xl p-4 text-center">
                <p className="text-body-sm text-ink-400">Logged in as</p>
                <p className="font-serif text-title-sm text-forest">{user.name}</p>
              </div>

              <button
                onClick={() => {
                  logout()
                  setShowSettings(false)
                }}
                className="w-full py-4 bg-rose-100 text-rose-600 rounded-2xl font-medium hover:bg-rose-200 transition-colors"
              >
                Switch User / Logout
              </button>

              <button
                onClick={() => setShowSettings(false)}
                className="w-full py-4 bg-cream-200 text-ink-500 rounded-2xl font-medium hover:bg-cream-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  )
}
