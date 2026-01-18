import { useState, useEffect } from 'react'
import { getDailyQuestion, answerQuestion } from '../lib/supabase'

export default function HomePage({ status }) {
  const [greeting, setGreeting] = useState('')
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [showAnswerInput, setShowAnswerInput] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Set greeting based on time
    const hour = new Date().getHours()
    if (hour < 12) setGreeting('Good morning')
    else if (hour < 17) setGreeting('Good afternoon')
    else if (hour < 21) setGreeting('Good evening')
    else setGreeting('Good night')

    // Fetch daily question
    getDailyQuestion()
      .then(setQuestion)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleAnswerSubmit = async () => {
    if (!answer.trim() || !question) return
    
    try {
      await answerQuestion(question.id, 'dane', answer)
      setQuestion(prev => ({ ...prev, dane_answer: answer }))
      setShowAnswerInput(false)
      setAnswer('')
    } catch (error) {
      console.error('Error submitting answer:', error)
    }
  }

  return (
    <div className="px-6 pt-12 pb-8">
      {/* Header */}
      <header className="mb-10 animate-fade-up">
        <p className="text-small text-ink-400 mb-1">{greeting}</p>
        <h1 className="font-serif text-4xl text-forest tracking-tight">Dane</h1>
      </header>

      {/* Status Bar */}
      {status && (
        <div className="mb-8 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-3 text-small text-ink-400">
            <span className="w-2 h-2 bg-forest rounded-full animate-pulse" />
            <span>
              Shah is <span className="text-forest font-medium">{status.status.toLowerCase()}</span>
              {status.location && <span className="text-ink-300"> · {status.location}</span>}
            </span>
          </div>
        </div>
      )}

      {/* Daily Question Card */}
      {!loading && question && (
        <div className="card-elevated mb-6 animate-fade-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="tag tag-gold">Today's Question</span>
          </div>
          
          <h3 className="font-serif text-xl text-forest leading-relaxed mb-6">
            {question.question}
          </h3>

          {/* Answers Section */}
          <div className="space-y-4">
            {/* Shah's Answer */}
            {question.shah_answer && (
              <div className="bg-cream-100 rounded-xl p-4">
                <p className="text-tiny text-ink-400 mb-1 font-medium">Shah</p>
                <p className="text-body text-ink-600">{question.shah_answer}</p>
              </div>
            )}

            {/* Dane's Answer */}
            {question.dane_answer ? (
              <div className="bg-forest-50 rounded-xl p-4">
                <p className="text-tiny text-forest-600 mb-1 font-medium">You</p>
                <p className="text-body text-forest-700">{question.dane_answer}</p>
              </div>
            ) : showAnswerInput ? (
              <div className="space-y-3">
                <textarea
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Your answer..."
                  className="input min-h-[100px] resize-none"
                  autoFocus
                />
                <div className="flex gap-2">
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
                className="w-full py-4 border-2 border-dashed border-cream-300 rounded-xl text-ink-400 hover:border-forest-200 hover:text-forest transition-colors"
              >
                Tap to answer
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <QuickAction 
          title="How are you feeling?"
          subtitle="Get a message from Shah"
          href="us"
        />
        <QuickAction 
          title="Learn something"
          subtitle="Today's word awaits"
          href="learn"
        />
      </div>

      {/* Recent Activity Teaser */}
      <div className="mt-8 animate-fade-up" style={{ animationDelay: '0.25s' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-forest">Recent</h3>
        </div>
        <div className="space-y-3">
          <ActivityItem 
            title="New word added"
            description="Shukriya — Thank you"
            time="Today"
          />
          <ActivityItem 
            title="Goal updated"
            description="Morning routine — 60% complete"
            time="Yesterday"
          />
        </div>
      </div>
    </div>
  )
}

function QuickAction({ title, subtitle, href }) {
  return (
    <button className="card text-left hover:shadow-card transition-shadow">
      <h4 className="font-serif text-lg text-forest mb-1">{title}</h4>
      <p className="text-small text-ink-400">{subtitle}</p>
    </button>
  )
}

function ActivityItem({ title, description, time }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-cream-200 last:border-0">
      <div className="w-2 h-2 bg-gold rounded-full mt-2 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-small font-medium text-ink-600">{title}</p>
        <p className="text-small text-ink-400 truncate">{description}</p>
      </div>
      <span className="text-tiny text-ink-300 flex-shrink-0">{time}</span>
    </div>
  )
}
