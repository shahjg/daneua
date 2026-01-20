import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

const DAILY_QUESTIONS = [
  "What's one thing you're grateful for today?",
  "What made you smile recently?",
  "What's something you're looking forward to?",
  "What's a memory of us that makes you happy?",
  "What's something you wish we did more often?",
  "What's one thing you love about our relationship?",
  "What's a goal you want us to achieve together?",
  "What's something new you'd like to try with me?",
  "What's your favorite thing about today?",
  "What's one way I can support you better?",
  "What's a dream date you'd like to have?",
  "What's something you've learned about yourself recently?",
  "What's a song that reminds you of us?",
  "What's one thing that always makes you feel loved?",
  "What's your current mood in one word?"
]

const DUAS = {
  love: ["Ya Allah, bless our love and keep us united.", "May our bond grow stronger each day.", "Grant us patience and understanding with each other."],
  prayer: ["Ya Allah, guide us on the straight path.", "Accept our prayers and forgive our shortcomings.", "Make us among those who are grateful."],
  work: ["Ya Allah, bless our efforts and grant us success.", "Help us work hard with good intentions.", "Make our work a means of barakah."],
  health: ["Ya Allah, grant us health and wellness.", "Protect us from illness and harm.", "Give us strength in body and mind."],
  peace: ["Ya Allah, grant us peace in our hearts.", "Remove anxiety and worry from our lives.", "Fill our home with tranquility."],
  gratitude: ["Alhamdulillah for all Your blessings.", "Thank You for bringing us together.", "We are grateful for every moment."]
}

export default function HomePage() {
  const { user, supabase, getPartner } = useAuth()
  const [toast, setToast] = useState(null)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [question, setQuestion] = useState('')
  const [myAnswer, setMyAnswer] = useState('')
  const [partnerAnswer, setPartnerAnswer] = useState('')
  const [answerInput, setAnswerInput] = useState('')
  const [hasAnswered, setHasAnswered] = useState(false)
  const [selectedDuaCategory, setSelectedDuaCategory] = useState(null)
  const [loveNote, setLoveNote] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)
  const partner = getPartner()

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted')
    }
    
    // Get daily question based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    setQuestion(DAILY_QUESTIONS[dayOfYear % DAILY_QUESTIONS.length])
    
    loadAnswers()
  }, [])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const enableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        showToast('Notifications enabled!', 'success')
      }
    }
  }

  const loadAnswers = async () => {
    if (!supabase) return
    const today = new Date().toISOString().split('T')[0]
    
    const { data } = await supabase
      .from('daily_answers')
      .select('*')
      .eq('date', today)
    
    if (data) {
      const mine = data.find(a => a.user_id === user.id)
      const theirs = data.find(a => a.user_id === partner?.id)
      if (mine) {
        setMyAnswer(mine.answer)
        setHasAnswered(true)
      }
      if (theirs) setPartnerAnswer(theirs.answer)
    }
  }

  const submitAnswer = async () => {
    if (!answerInput.trim() || !supabase) return
    const today = new Date().toISOString().split('T')[0]
    
    const { error } = await supabase.from('daily_answers').upsert({
      user_id: user.id,
      date: today,
      question,
      answer: answerInput.trim()
    }, { onConflict: 'user_id,date' })
    
    if (!error) {
      setMyAnswer(answerInput.trim())
      setHasAnswered(true)
      setAnswerInput('')
      showToast('Answer saved!', 'success')
      loadAnswers()
    }
  }

  const sendLoveNote = async () => {
    if (!loveNote.trim() || !supabase) return
    
    await supabase.from('love_notes').insert({
      from_user: user.id,
      to_user: partner?.id,
      note: loveNote.trim()
    })
    
    setLoveNote('')
    setShowNoteInput(false)
    showToast('Love note sent! 💕', 'success')
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-card ${toast.type === 'success' ? 'bg-forest text-cream-100' : toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-ink-700 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="bg-forest p-6 pb-8 rounded-b-3xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-cream-200/70 text-body-sm">Welcome back,</p>
            <h1 className="font-serif text-display-sm text-cream-100">{user?.name}</h1>
          </div>
          {!notificationsEnabled && (
            <button onClick={enableNotifications} className="bg-cream-100/10 text-cream-100 px-4 py-2 rounded-xl text-body-sm">
              🔔 Enable
            </button>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6 -mt-4">
        {/* Daily Question Card */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h2 className="font-serif text-title-sm text-forest mb-2">Today's Question</h2>
          <p className="text-body text-ink-600 mb-4">{question}</p>
          
          {!hasAnswered ? (
            <div className="space-y-3">
              <textarea
                value={answerInput}
                onChange={(e) => setAnswerInput(e.target.value)}
                placeholder="Your answer..."
                className="w-full p-4 bg-cream-50 rounded-xl text-body text-ink-600 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
              <button onClick={submitAnswer} className="w-full bg-forest text-cream-100 py-3 rounded-xl font-medium">
                Submit Answer
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-cream-50 rounded-xl p-4">
                <p className="text-caption text-ink-400 mb-1">Your answer</p>
                <p className="text-body text-ink-600">{myAnswer}</p>
              </div>
              {partnerAnswer ? (
                <div className="bg-rose-50 rounded-xl p-4">
                  <p className="text-caption text-rose-400 mb-1">{partner?.name}'s answer</p>
                  <p className="text-body text-ink-600">{partnerAnswer}</p>
                </div>
              ) : (
                <p className="text-body-sm text-ink-400 text-center">Waiting for {partner?.name}'s answer...</p>
              )}
            </div>
          )}
        </div>

        {/* Send a Dua */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h2 className="font-serif text-title-sm text-forest mb-4">Send a Dua</h2>
          
          {!selectedDuaCategory ? (
            <div className="grid grid-cols-3 gap-3">
              {Object.keys(DUAS).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedDuaCategory(cat)}
                  className="bg-cream-50 hover:bg-cream-100 py-3 px-2 rounded-xl text-body-sm text-ink-600 capitalize transition-colors"
                >
                  {cat === 'work' ? 'Work Hard' : cat}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <button onClick={() => setSelectedDuaCategory(null)} className="text-body-sm text-ink-400 mb-4">← Back</button>
              <div className="space-y-3">
                {DUAS[selectedDuaCategory].map((dua, i) => (
                  <div key={i} className="bg-gold-50 rounded-xl p-4">
                    <p className="text-body text-ink-600 text-center" dir="auto">{dua}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Love Note */}
        <div className="bg-white rounded-2xl p-6 shadow-soft">
          <h2 className="font-serif text-title-sm text-forest mb-4">Send a Love Note</h2>
          
          {!showNoteInput ? (
            <button onClick={() => setShowNoteInput(true)} className="w-full bg-rose-50 text-rose-600 py-4 rounded-xl font-medium hover:bg-rose-100 transition-colors">
              💕 Write a note for {partner?.name}
            </button>
          ) : (
            <div className="space-y-3">
              <textarea
                value={loveNote}
                onChange={(e) => setLoveNote(e.target.value)}
                placeholder="Write something sweet..."
                className="w-full p-4 bg-cream-50 rounded-xl text-body text-ink-600 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-rose-200"
              />
              <div className="flex gap-3">
                <button onClick={() => { setShowNoteInput(false); setLoveNote('') }} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">
                  Cancel
                </button>
                <button onClick={sendLoveNote} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-medium">
                  Send 💕
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
