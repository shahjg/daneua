import { useState, useEffect } from 'react'
import { supabase, getCurrentStatus, subscribeToStatus } from './lib/supabase'
import MoodDashboard from './components/MoodDashboard'
import GrowthModule from './components/GrowthModule'
import LiveUtility from './components/LiveUtility'
import MediaVault from './components/MediaVault'
import Navigation from './components/Navigation'

function App() {
  const [currentPage, setCurrentPage] = useState('mood')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch initial status
    getCurrentStatus().then(data => {
      setStatus(data)
      setLoading(false)
    })

    // Subscribe to real-time status updates
    const subscription = subscribeToStatus((payload) => {
      if (payload.new?.is_current) {
        setStatus(payload.new)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'mood':
        return <MoodDashboard />
      case 'growth':
        return <GrowthModule />
      case 'live':
        return <LiveUtility />
      case 'vault':
        return <MediaVault />
      default:
        return <MoodDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-ivory font-body">
      {/* Status Ticker */}
      {status && (
        <div className="bg-evergreen text-ivory-100 py-2 px-4 text-center text-sm animate-fade-in">
          <span className="font-medium">Shah is currently:</span>{' '}
          <span className="text-blush-200">{status.status}</span>
          {status.location && (
            <span className="text-ivory-300 ml-2">📍 {status.location}</span>
          )}
        </div>
      )}

      {/* Header */}
      <header className="px-6 pt-8 pb-4">
        <div className="text-center">
          <h1 className="font-display text-3xl text-evergreen tracking-tight">
            D(ane)ua
          </h1>
          <p className="text-evergreen-400 text-sm mt-1">Our little world 💚</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pb-24">
        {renderPage()}
      </main>

      {/* Bottom Navigation */}
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  )
}

export default App
