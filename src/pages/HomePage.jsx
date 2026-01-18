import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  getCurrentStatus, 
  getCountdowns, 
  getDailyQuestion, 
  answerQuestion,
  sendDuaRequest,
  getUnreadDuaRequests,
  subscribeToStatus,
  subscribeToDuaRequests
} from '../lib/supabase'

export default function HomePage() {
  const { user } = useAuth()
  const [status, setStatus] = useState(null)
  const [countdowns, setCountdowns] = useState([])
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [showAnswerInput, setShowAnswerInput] = useState(false)
  const [duaRequests, setDuaRequests] = useState([])
  const [duaSent, setDuaSent] = useState(false)
  const [loading, setLoading] = useState(true)

  const greeting = getGreeting()
  const userName = user?.name || 'Love'

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusData, countdownData, questionData, duaData] = await Promise.all([
          getCurrentStatus(),
          getCountdowns(),
          getDailyQuestion(),
          user ? getUnreadDuaRequests(user.role) : []
        ])
        setStatus(statusData)
        setCountdowns(countdownData || [])
        setQuestion(questionData)
        setDuaRequests(duaData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
      setLoading(false)
    }

    fetchData()

    // Subscriptions
    const statusSub = subscribeToStatus((payload) => {
      if (payload.new?.is_current) setStatus(payload.new)
    })

    const duaSub = subscribeToDuaRequests((payload) => {
      if (payload.new?.from_user !== user?.role) {
        setDuaRequests(prev => [payload.new, ...prev])
      }
    })

    return () => {
      statusSub.unsubscribe()
      duaSub.unsubscribe()
    }
  }, [user])

  const handleSendDua = async () => {
    try {
      await sendDuaRequest(user.role)
      setDuaSent(true)
      setTimeout(() => setDuaSent(false), 3000)
    } catch (error) {
      console.error('Error sending dua:', error)
    }
  }

  const handleAnswerSubmit = async () => {
    if (!answer.trim() || !question) return
    try {
      await answerQuestion(question.id, user.role, answer)
      setQuestion(prev => ({
        ...prev,
        [user.role === 'shah' ? 'shah_answer' : 'dane_answer']: answer
      }))
      setShowAnswerInput(false)
      setAnswer('')
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  const myAnswer = user?.role === 'shah' ? question?.shah_answer : question?.dane_answer
  const theirAnswer = user?.role === 'shah' ? question?.dane_answer : question?.shah_answer
  const theirName = user?.role === 'shah' ? 'Dane' : 'Shah'

  return (
    <div className="min-h-screen">
      {/* Hero Section - Forest */}
      <div className="bg-forest text-cream-100 px-6 pt-16 pb-12">
        <div className="stagger">
          <p className="text-caption text-cream-300 mb-2">{greeting}</p>
          <h1 className="font-serif text-display-sm text-cream-50 mb-6">{userName}</h1>
          
          {/* Status */}
          {status && (
            <div className="flex items-center gap-3 bg-forest-700/50 rounded-2xl px-4 py-3">
              <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
              <p className="text-body-sm text-cream-200">
                {theirName} is <span className="text-cream-50 font-medium">{status.status}</span>
                {status.location && <span className="text-cream-400"> · {status.location}</span>}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dua Requests Alert */}
      {duaRequests.length > 0 && (
        <div className="bg-rose-100 px-6 py-4 animate-fade-up">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🤲</span>
            <div>
              <p className="text-body font-medium text-rose-700">{theirName} needs a Dua</p>
              <p className="text-body-sm text-rose-500">They're thinking of you</p>
            </div>
          </div>
        </div>
      )}

      {/* Countdowns */}
      {countdowns.length > 0 && (
        <div className="px-6 py-8 bg-cream">
          <div className="grid grid-cols-2 gap-4 stagger">
            {countdowns.slice(0, 2).map((countdown) => {
              const days = getDaysUntil(countdown.target_date)
              return (
                <div key={countdown.id} className="card-gold text-center">
                  <span className="text-2xl mb-2 block">{countdown.emoji}</span>
                  <p className="countdown-number">{days}</p>
                  <p className="countdown-label">days</p>
                  <p className="text-body-sm text-gold-700 mt-2">{countdown.title}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Daily Question */}
      {question && (
        <div className="bg-cream-200 px-6 py-10">
          <div className="stagger">
            <p className="section-label mb-4">Today's Question</p>
            <h2 className="font-serif text-title text-forest mb-8 text-balance">
              {question.question}
            </h2>

            {/* Their Answer */}
            {theirAnswer && (
              <div className="bg-white rounded-2xl p-5 mb-4">
                <p className="text-caption text-ink-400 mb-2">{theirName}</p>
                <p className="text-body text-ink-600">{theirAnswer}</p>
              </div>
            )}

            {/* My Answer */}
            {myAnswer ? (
              <div className="bg-forest rounded-2xl p-5">
                <p className="text-caption text-forest-200 mb-2">You</p>
                <p className="text-body text-cream-100">{myAnswer}</p>
              </div>
            ) : showAnswerInput ? (
              <div className="space-y-4">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Your answer..."
                  className="input min-h-[120px] resize-none"
                  autoFocus
                />
                <div className="flex gap-3">
                  <button onClick={handleAnswerSubmit} className="btn-primary flex-1">
                    Submit
                  </button>
                  <button onClick={() => setShowAnswerInput(false)} className="btn-ghost">
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setShowAnswerInput(true)}
                className="w-full py-5 border-2 border-dashed border-cream-400 rounded-2xl text-ink-400 hover:border-forest hover:text-forest transition-all"
              >
                Tap to answer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Send a Dua */}
      <div className="px-6 py-10 bg-cream">
        <button
          onClick={handleSendDua}
          disabled={duaSent}
          className={`
            w-full py-6 rounded-3xl transition-all duration-300
            ${duaSent 
              ? 'bg-forest text-cream-100' 
              : 'bg-gradient-to-r from-gold-200 to-rose-200 text-forest hover:shadow-elevated'
            }
          `}
        >
          {duaSent ? (
            <span className="flex items-center justify-center gap-3">
              <span className="text-xl">✓</span>
              <span className="font-serif text-title-sm">Dua sent to {theirName}</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <span className="text-2xl">🤲</span>
              <span className="font-serif text-title-sm">Send a Dua</span>
            </span>
          )}
        </button>
        <p className="text-center text-body-sm text-ink-400 mt-3">
          Let {theirName} know you're thinking of them
        </p>
      </div>

      {/* Quick Actions */}
      <div className="px-6 py-8 bg-cream-200">
        <p className="section-label mb-4">Quick Actions</p>
        <div className="grid grid-cols-2 gap-4 stagger">
          <QuickCard 
            title="How are you?"
            subtitle="Get a message"
            emoji="💌"
            bg="bg-rose-100"
          />
          <QuickCard 
            title="Learn"
            subtitle="Today's word"
            emoji="📚"
            bg="bg-forest-50"
          />
        </div>
      </div>

      {/* Spacer for nav */}
      <div className="h-24" />
    </div>
  )
}

function QuickCard({ title, subtitle, emoji, bg }) {
  return (
    <div className={`${bg} rounded-2xl p-5 hover:scale-[1.02] transition-transform cursor-pointer`}>
      <span className="text-2xl mb-3 block">{emoji}</span>
      <h3 className="font-serif text-title-sm text-forest">{title}</h3>
      <p className="text-body-sm text-ink-400">{subtitle}</p>
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

function getDaysUntil(dateStr) {
  const target = new Date(dateStr)
  const today = new Date()
  const diff = target - today
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
