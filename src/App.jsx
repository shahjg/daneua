import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navigation from './components/Navigation'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import LearnPage from './pages/LearnPage'
import UsPage from './pages/UsPage'
import PlansPage from './pages/PlansPage'
import GoalsPage from './pages/GoalsPage'

function AppContent() {
  const { user, loading } = useAuth()
  const [currentPage, setCurrentPage] = useState('home')

  // Loading state
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

  // Not logged in
  if (!user) {
    return <LoginPage />
  }

  // Logged in - show app
  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage />
      case 'learn': return <LearnPage />
      case 'us': return <UsPage />
      case 'plans': return <PlansPage />
      case 'goals': return <GoalsPage />
      default: return <HomePage />
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <main className="pb-24">
        {renderPage()}
      </main>
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
