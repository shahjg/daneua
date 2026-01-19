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

export default function HomePage({ onOpenSettings }) {
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
  const theirName = user?.role === 'shah' ? 'Dane' : 'Shahjahan'

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
    if (duaSent) return
    try {
      await sendDuaRequest(user.role)
      setDuaSent(true)
      setTimeout(() => setDuaSent(false), 5000)
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

  return (
    <div className="min-h-screen pb-28">
      {/* Hero Section */}
      <div className="bg-forest text-cream-100 px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto">
          {/* Settings Button */}
          <div className="flex justify-end mb-4">
            <button 
              onClick={onOpenSettings}
              className="p-2 rounded-full hover:bg-forest-500 transition-colors"
            >
              <svg className="w-6 h-6 text-cream-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>

          <div className="text-center">
            <p className="text-body text-cream-300 mb-2">{greeting}</p>
            <h1 className="font-serif text-display-sm text-cream-50 mb-6">{userName}</h1>
            
            {/* Status */}
            {status && (
              <div className="inline-flex items-center gap-3 bg-forest-700/50 rounded-full px-5 py-3">
                <span className="w-2 h-2 bg-gold rounded-full animate-pulse" />
                <p className="text-body-sm text-cream-200">
                  {theirName} is <span className="text-cream-50 font-medium">{status.status}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dua Request Alert */}
      {duaRequests.length > 0 && (
        <div className="bg-rose-100 px-6 py-5">
          <div className="max-w-lg mx-auto flex items-center justify-center gap-4">
            <span className="text-3xl">🤲</span>
            <div className="text-center">
              <p className="text-body font-medium text-rose-700">{theirName} needs a Dua</p>
              <p className="text-body-sm text-rose-500">They're thinking of you</p>
            </div>
          </div>
        </div>
      )}

      {/* Countdowns */}
      {countdowns.length > 0 && (
        <div className="px-6 py-10 bg-cream">
          <div className="max-w-lg mx-auto">
            <p className="section-label text-center mb-6">Counting Down</p>
            <div className="grid grid-cols-2 gap-4">
              {countdowns.slice(0, 2).map((countdown) => {
                const days = getDaysUntil(countdown.target_date)
                return (
                  <div key={countdown.id} className="bg-gold-100 rounded-3xl p-6 text-center">
                    <span className="text-3xl mb-3 block">{countdown.emoji}</span>
                    <p className="font-serif text-display-sm text-forest">{days}</p>
                    <p className="text-caption text-gold-700 uppercase tracking-widest">days</p>
                    <p className="text-body-sm text-gold-600 mt-2">{countdown.title}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Daily Question */}
      {question && (
        <div className="bg-cream-200 px-6 py-10">
          <div className="max-w-lg mx-auto">
            <p className="section-label text-center mb-4">Today's Question</p>
            <h2 className="font-serif text-title text-forest mb-8 text-center text-balance">
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
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleSendDua}
            disabled={duaSent}
            className={`
              w-full py-6 rounded-3xl transition-all duration-500
              ${duaSent 
                ? 'bg-forest text-cream-100' 
                : 'bg-gradient-to-r from-gold-200 via-rose-200 to-gold-200 text-forest hover:shadow-elevated active:scale-[0.98]'
              }
            `}
          >
            {duaSent ? (
              <span className="flex items-center justify-center gap-3">
                <span className="text-2xl">✓</span>
                <span className="font-serif text-title-sm">Dua sent to {theirName}</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <span className="text-2xl">🤲</span>
                <span className="font-serif text-title-sm">Send a Dua</span>
              </span>
            )}
          </button>
          <p className="text-center text-body-sm text-ink-400 mt-4">
            Let {theirName} know you're thinking of them
          </p>
        </div>
      </div>
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
  today.setHours(0, 0, 0, 0)
  const diff = target - today
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}
