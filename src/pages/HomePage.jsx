import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { 
  getCountdowns,
  addCountdown,
  deleteCountdown,
  getDailyQuestion, 
  answerQuestion,
  sendDuaRequest,
  getLoveNotes,
  addLoveNote,
  getTodaysMoments,
  addMoment,
  supabase
} from '../lib/supabase'

export default function HomePage({ onOpenSettings }) {
  const { user } = useAuth()
  const [countdowns, setCountdowns] = useState([])
  const [question, setQuestion] = useState(null)
  const [answer, setAnswer] = useState('')
  const [showAnswerInput, setShowAnswerInput] = useState(false)
  const [duaSent, setDuaSent] = useState(false)
  const [showAddCountdown, setShowAddCountdown] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false)
  const [loveNotes, setLoveNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [showAddNote, setShowAddNote] = useState(false)
  const [todaysMoments, setTodaysMoments] = useState([])
  const [photoStatus, setPhotoStatus] = useState('')
  const [fullscreenPhoto, setFullscreenPhoto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState(null)

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

  const greeting = getGreeting()
  const userName = user?.name || 'Love'
  const theirName = user?.role === 'shah' ? 'Dane' : 'Shahjahan'

  useEffect(() => {
    fetchData()
    checkNotificationPermission()
  }, [user])

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      const enabled = Notification.permission === 'granted'
      setNotificationsEnabled(enabled)
      setShowNotificationPrompt(Notification.permission === 'default')
    }
  }

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setNotificationsEnabled(true)
        setShowNotificationPrompt(false)
      }
    }
  }

  const fetchData = async () => {
    try {
      const [countdownData, questionData, notesData, momentsData] = await Promise.all([
        getCountdowns(),
        getDailyQuestion(),
        getLoveNotes ? getLoveNotes() : [],
        getTodaysMoments()
      ])
      setCountdowns(countdownData || [])
      setQuestion(questionData)
      setLoveNotes(notesData || [])
      setTodaysMoments(momentsData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const handlePhotoUpload = async (file) => {
    setPhotoStatus('Uploading...')
    try {
      const fileName = `${user.role}_${Date.now()}.jpg`
      
      const { error } = await supabase.storage.from('photos').upload(fileName, file, { 
        contentType: 'image/jpeg', 
        upsert: true 
      })
      
      if (error) {
        console.error('Storage error:', error)
        setPhotoStatus(`Failed: ${error.message}`)
        setTimeout(() => setPhotoStatus(''), 4000)
        return
      }

      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName)
      const newMoment = await addMoment(user.role, urlData.publicUrl)
      setTodaysMoments(prev => [...prev, newMoment])
      
      setPhotoStatus('Uploaded!')
      setTimeout(() => setPhotoStatus(''), 2000)
    } catch (error) {
      console.error('Upload error:', error)
      setPhotoStatus(`Error: ${error.message}`)
      setTimeout(() => setPhotoStatus(''), 4000)
    }
  }

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

  const handleAddCountdown = async (title, targetDate, emoji) => {
    try {
      const newCountdown = await addCountdown(title, targetDate, emoji)
      setCountdowns(prev => [...prev, newCountdown])
      setShowAddCountdown(false)
    } catch (error) {
      console.error('Error adding countdown:', error)
    }
  }

  const handleDeleteCountdown = async (id) => {
    try {
      await deleteCountdown(id)
      setCountdowns(prev => prev.filter(c => c.id !== id))
    } catch (error) {
      console.error('Error deleting countdown:', error)
    }
  }

  const handleAddNote = async () => {
    if (!newNote.trim()) return
    try {
      const note = await addLoveNote(user.role, newNote)
      setLoveNotes(prev => [note, ...prev])
      setNewNote('')
      setShowAddNote(false)
      showToast('Love note sent! 💕', 'success')
    } catch (error) {
      console.error('Error adding note:', error)
      showToast(`Error: ${error.message}`, 'error')
    }
  }

  const handleReactToNote = async (noteId, reaction) => {
    try {
      // Delete the note after reacting
      await supabase
        .from('love_notes')
        .delete()
        .eq('id', noteId)
      
      // Remove from local state
      setLoveNotes(prev => prev.filter(n => n.id !== noteId))
      showToast(`Reacted with ${reaction}`, 'success')
    } catch (error) {
      console.error('Error reacting:', error)
      showToast(`Error: ${error.message}`, 'error')
    }
  }

  const myAnswer = user?.role === 'shah' ? question?.shah_answer : question?.dane_answer
  const theirAnswer = user?.role === 'shah' ? question?.dane_answer : question?.shah_answer

  return (
    <div className="min-h-screen pb-28">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-lg ${toast.type === 'error' ? 'bg-rose-500 text-white' : toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-forest text-cream-100'}`}>
          <p className="text-body-sm text-center">{toast.message}</p>
        </div>
      )}

      {/* Hero Section */}
      <div className="bg-forest text-cream-100 px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto">
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
          </div>
        </div>
      </div>

      {/* Notification Prompt - disappears after enabling */}
      {showNotificationPrompt && !notificationsEnabled && (
        <div className="bg-gold-100 px-6 py-4">
          <div className="max-w-lg mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔔</span>
              <p className="text-body-sm text-forest">Enable notifications?</p>
            </div>
            <button
              onClick={handleEnableNotifications}
              className="px-4 py-2 bg-forest text-cream-100 rounded-full text-body-sm font-medium"
            >
              Enable
            </button>
          </div>
        </div>
      )}

      {/* Countdowns */}
      <div className="px-6 py-10 bg-cream">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="section-label">Counting Down</p>
            <button 
              onClick={() => setShowAddCountdown(true)}
              className="text-body-sm text-forest font-medium hover:text-forest-700"
            >
              + Add
            </button>
          </div>
          
          {countdowns.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {countdowns.map((countdown) => {
                const days = getDaysUntil(countdown.target_date)
                return (
                  <div key={countdown.id} className="bg-gold-100 rounded-3xl p-6 text-center relative group">
                    <button
                      onClick={() => handleDeleteCountdown(countdown.id)}
                      className="absolute top-3 right-3 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-ink-400 hover:text-rose-500"
                    >
                      ×
                    </button>
                    <span className="text-3xl mb-3 block">{countdown.emoji || '📅'}</span>
                    <p className="font-serif text-display-sm text-forest">{days}</p>
                    <p className="text-caption text-gold-700 uppercase tracking-widest">days</p>
                    <p className="text-body-sm text-gold-600 mt-2">{countdown.title}</p>
                  </div>
                )
              })}
            </div>
          ) : (
            <button 
              onClick={() => setShowAddCountdown(true)}
              className="w-full py-8 border-2 border-dashed border-gold-300 rounded-3xl text-gold-600 hover:border-gold-400 hover:bg-gold-50 transition-all"
            >
              <span className="text-3xl block mb-2">📅</span>
              <span className="text-body">Add a countdown</span>
            </button>
          )}
        </div>
      </div>

      {/* Daily Question */}
      {question && (
        <div className="bg-cream-200 px-6 py-10">
          <div className="max-w-lg mx-auto">
            <p className="section-label text-center mb-4">Today's Question</p>
            <h2 className="font-serif text-title text-forest mb-8 text-center text-balance">
              {question.question}
            </h2>

            {theirAnswer && (
              <div className="bg-white rounded-2xl p-5 mb-4">
                <p className="text-caption text-ink-400 mb-2">{theirName}</p>
                <p className="text-body text-ink-600">{theirAnswer}</p>
              </div>
            )}

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
                  <button onClick={handleAnswerSubmit} className="btn-primary flex-1">Submit</button>
                  <button onClick={() => setShowAnswerInput(false)} className="btn-ghost">Cancel</button>
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

      {/* Love Notes */}
      <div className="px-6 py-10 bg-cream">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="section-label">Love Notes</p>
            <button 
              onClick={() => setShowAddNote(true)}
              className="text-body-sm text-forest font-medium hover:text-forest-700"
            >
              + Send
            </button>
          </div>

          {showAddNote && (
            <div className="bg-rose-50 rounded-2xl p-4 mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={`Write something sweet for ${theirName}...`}
                className="input min-h-[80px] resize-none mb-3"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleAddNote} className="btn-primary flex-1 py-2">Send 💕</button>
                <button onClick={() => { setShowAddNote(false); setNewNote('') }} className="btn-ghost py-2">Cancel</button>
              </div>
            </div>
          )}

          {/* Unread notes from partner - show prominently */}
          {loveNotes.filter(n => n.to_user === user?.role && !n.read).map((note) => (
            <div key={note.id} className="bg-gradient-to-br from-rose-100 to-gold-50 rounded-2xl p-5 mb-4 shadow-soft">
              <p className="text-caption text-rose-600 mb-2">{theirName} sent you a note 💌</p>
              <p className="text-body text-ink-700 mb-4">{note.note}</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleReactToNote(note.id, '❤️')}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors"
                >
                  ❤️ Love it
                </button>
                <button 
                  onClick={() => handleReactToNote(note.id, '🥰')}
                  className="flex-1 py-3 bg-gold-500 text-white rounded-xl font-medium hover:bg-gold-600 transition-colors"
                >
                  🥰 So sweet
                </button>
              </div>
            </div>
          ))}

          {/* Notes you sent - pending reaction */}
          {loveNotes.filter(n => n.from_user === user?.role).length > 0 && (
            <div className="space-y-3">
              {loveNotes.filter(n => n.from_user === user?.role).slice(0, 3).map((note) => (
                <div key={note.id} className="rounded-2xl p-4 bg-forest text-cream-100">
                  <p className="text-caption opacity-70 mb-1">You sent</p>
                  <p className="text-body">{note.note}</p>
                  <p className="text-caption opacity-50 mt-2">Waiting for {theirName} to react...</p>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {loveNotes.length === 0 && !showAddNote && (
            <button 
              onClick={() => setShowAddNote(true)}
              className="w-full py-6 border-2 border-dashed border-rose-200 rounded-2xl text-rose-400 hover:border-rose-300 hover:bg-rose-50 transition-all"
            >
              <span className="text-2xl block mb-2">💕</span>
              <span className="text-body">Send a love note</span>
            </button>
          )}
        </div>
      </div>

      {/* Pic of the Day */}
      <div className="px-6 py-10 bg-gradient-to-br from-rose-50 to-gold-50">
        <div className="max-w-lg mx-auto">
          <p className="section-label text-center mb-6">📸 Pic of the Day</p>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <PhotoSlot 
              label="Shahjahan" 
              photo={todaysMoments.find(m => m.user_role === 'shah')} 
              canUpload={user?.role === 'shah'} 
              onUpload={handlePhotoUpload}
              onViewPhoto={setFullscreenPhoto}
            />
            <PhotoSlot 
              label="Dane" 
              photo={todaysMoments.find(m => m.user_role === 'dane')} 
              canUpload={user?.role === 'dane'} 
              onUpload={handlePhotoUpload}
              onViewPhoto={setFullscreenPhoto}
            />
          </div>
          
          {photoStatus && (
            <p className="text-center text-body-sm text-ink-500">{photoStatus}</p>
          )}
        </div>
      </div>

      {/* Send a Dua */}
      <div className="px-6 py-10 bg-cream-200">
        <div className="max-w-lg mx-auto">
          <DuaSelector theirName={theirName} user={user} showToast={showToast} />
        </div>
      </div>

      {/* Fullscreen Photo Modal */}
      {fullscreenPhoto && (
        <div 
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          onClick={() => setFullscreenPhoto(null)}
        >
          <button 
            className="absolute top-4 right-4 text-white text-3xl z-10 w-12 h-12 flex items-center justify-center"
            onClick={() => setFullscreenPhoto(null)}
          >
            ✕
          </button>
          <img 
            src={fullscreenPhoto} 
            alt="" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}

      {/* Add Countdown Modal */}
      {showAddCountdown && (
        <AddCountdownModal 
          onClose={() => setShowAddCountdown(false)} 
          onAdd={handleAddCountdown}
        />
      )}
    </div>
  )
}

function AddCountdownModal({ onClose, onAdd }) {
  const [title, setTitle] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const [emoji, setEmoji] = useState('🎯')
  const [loading, setLoading] = useState(false)

  const emojis = ['🎯', '✈️', '🏖️', '💍', '🎂', '🎄', '🎉', '💪', '📅', '❤️']

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim() || !targetDate) return
    setLoading(true)
    await onAdd(title, targetDate, emoji)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-forest-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={onClose}>
      <div 
        className="bg-cream rounded-3xl p-6 w-full max-w-sm shadow-elevated"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-serif text-title text-forest text-center mb-6">Add Countdown</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-body-sm font-medium text-ink-600 block mb-2">What are you counting down to?</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="Summer vacation..."
              required
            />
          </div>

          <div>
            <label className="text-body-sm font-medium text-ink-600 block mb-2">Date</label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="text-body-sm font-medium text-ink-600 block mb-2">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {emojis.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    emoji === e ? 'bg-forest text-white scale-110' : 'bg-cream-200 hover:bg-cream-300'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1" disabled={loading}>
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
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

function DuaSelector({ theirName, user, showToast }) {
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [sent, setSent] = useState(false)
  const [receivedDuas, setReceivedDuas] = useState([])
  const [sending, setSending] = useState(false)

  const categories = [
    { id: 'prayer', label: 'Prayer', emoji: '🤲', message: `May Allah bless you and keep you safe, ${theirName}. You are always in my prayers.` },
    { id: 'affirmation', label: 'Affirmation', emoji: '💪', message: `You are capable of amazing things, ${theirName}. I believe in you completely.` },
    { id: 'love', label: 'Love', emoji: '💕', message: `My heart is full of love for you, ${theirName}. You mean everything to me.` },
    { id: 'sincerity', label: 'Sincerity', emoji: '🤍', message: `I want you to know how much I appreciate you, ${theirName}. My love for you is pure and true.` },
    { id: 'gratitude', label: 'Gratitude', emoji: '🙏', message: `I thank Allah every day for bringing you into my life, ${theirName}. Alhamdulillah.` },
    { id: 'peace', label: 'Peace', emoji: '☮️', message: `May peace and tranquility fill your heart today, ${theirName}. I'm sending you calm energy.` },
  ]

  useEffect(() => {
    if (user?.role) {
      fetchReceivedDuas()
      const interval = setInterval(fetchReceivedDuas, 30000)
      return () => clearInterval(interval)
    }
  }, [user?.role])

  const fetchReceivedDuas = async () => {
    if (!user?.role) return
    try {
      const { data, error } = await supabase
        .from('dua_messages')
        .select('*')
        .eq('to_user', user.role)
        .eq('read', false)
        .order('created_at', { ascending: false })
      if (!error) setReceivedDuas(data || [])
    } catch (err) {
      console.error('Error fetching duas:', err)
    }
  }

  const handleSend = async (cat) => {
    if (sending) return
    setSending(true)
    setSelectedCategory(cat)
    
    try {
      const toUser = user?.role === 'shah' ? 'dane' : 'shah'
      const fromUser = user?.role || 'shah'
      
      const { error } = await supabase.from('dua_messages').insert({
        from_user: fromUser,
        to_user: toUser,
        category: cat.id,
        emoji: cat.emoji,
        message: cat.message
      })
      
      if (error) {
        console.error('Dua error:', error)
        showToast?.(`Error: ${error.message}`, 'error')
        setSending(false)
        setSelectedCategory(null)
        return
      }
      
      setSent(true)
      setTimeout(() => {
        setSent(false)
        setSelectedCategory(null)
        setSending(false)
      }, 4000)
    } catch (err) {
      console.error('Error sending dua:', err)
      showToast?.(`Error: ${err.message}`, 'error')
      setSending(false)
      setSelectedCategory(null)
    }
  }

  const markAsRead = async (duaId) => {
    await supabase.from('dua_messages').update({ read: true }).eq('id', duaId)
    setReceivedDuas(prev => prev.filter(d => d.id !== duaId))
  }

  // Show received dua if there are any unread
  if (receivedDuas.length > 0) {
    const dua = receivedDuas[0]
    const senderName = dua.from_user === 'shah' ? 'Shahjahan' : 'Dane'
    return (
      <div className="bg-gradient-to-br from-gold-100 to-rose-100 rounded-3xl p-6 text-center">
        <span className="text-3xl block mb-3">{dua.emoji}</span>
        <p className="font-serif text-title-sm text-forest mb-2">{senderName} sent you a message</p>
        <p className="text-body text-ink-600 mb-4">{dua.message}</p>
        <button 
          onClick={() => markAsRead(dua.id)}
          className="bg-forest text-cream-100 px-6 py-3 rounded-xl font-medium"
        >
          Thank you 💚
        </button>
        {receivedDuas.length > 1 && (
          <p className="text-caption text-ink-400 mt-3">+{receivedDuas.length - 1} more</p>
        )}
      </div>
    )
  }

  if (sent && selectedCategory) {
    return (
      <div className="bg-forest rounded-3xl p-6 text-center">
        <span className="text-3xl block mb-3">{selectedCategory.emoji}</span>
        <p className="font-serif text-title-sm text-cream-100 mb-2">Sent to {theirName}</p>
        <p className="text-body text-cream-300">{selectedCategory.message}</p>
      </div>
    )
  }

  return (
    <div>
      <p className="section-label text-center mb-4">Send {theirName} a...</p>
      <div className="grid grid-cols-3 gap-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSend(cat)}
            disabled={sending}
            className={`bg-gradient-to-b from-white to-cream-100 rounded-2xl p-4 shadow-soft hover:shadow-card transition-all text-center ${sending ? 'opacity-50' : ''}`}
          >
            <span className="text-2xl block mb-2">{cat.emoji}</span>
            <span className="text-body-sm font-medium text-forest">{cat.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

function getDaysUntil(dateStr) {
  const target = new Date(dateStr)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = target - today
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
}

function PhotoSlot({ label, photo, canUpload, onUpload, onViewPhoto }) {
  const inputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    // Upload directly without canvas processing to preserve orientation
    await onUpload(file)
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="relative">
      <div className="aspect-square rounded-2xl overflow-hidden bg-white shadow-soft">
        {photo ? (
          <img 
            src={photo.photo_url} 
            alt="" 
            className="w-full h-full object-cover cursor-pointer" 
            onClick={() => onViewPhoto && onViewPhoto(photo.photo_url)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-ink-300">
            <span className="text-4xl mb-2">📷</span>
            <p className="text-body-sm">{canUpload ? 'Add photo' : 'Waiting...'}</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-forest/50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-cream-100 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {canUpload && !photo && (
        <button onClick={() => inputRef.current?.click()} className="absolute inset-0 w-full h-full" />
      )}
      <input 
        ref={inputRef} 
        type="file" 
        accept="image/*" 
        capture="environment"
        className="hidden" 
        onChange={handleFileChange} 
      />
      <p className="text-center text-caption text-ink-500 mt-2 font-medium">{label}</p>
    </div>
  )
}
