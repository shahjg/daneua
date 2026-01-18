import { useState, useEffect } from 'react'
import { getCurrentStatus, subscribeToStatus } from './lib/supabase'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import LearnPage from './pages/LearnPage'
import UsPage from './pages/UsPage'
import PlansPage from './pages/PlansPage'
import GoalsPage from './pages/GoalsPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [status, setStatus] = useState(null)

  useEffect(() => {
    getCurrentStatus().then(setStatus).catch(console.error)

    const subscription = subscribeToStatus((payload) => {
      if (payload.new?.is_current) {
        setStatus(payload.new)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const renderPage = () => {
    switch (currentPage) {
      case 'home': return <HomePage status={status} />
      case 'learn': return <LearnPage />
      case 'us': return <UsPage />
      case 'plans': return <PlansPage />
      case 'goals': return <GoalsPage />
      default: return <HomePage status={status} />
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

export default App
