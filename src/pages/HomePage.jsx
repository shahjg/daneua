import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

const duaCategories = [
  { id: 'love', label: 'Love', dua: 'May Allah bless our love and keep our hearts connected always.' },
  { id: 'prayer', label: 'Prayer', dua: 'May Allah guide us on the straight path and accept our prayers.' },
  { id: 'work', label: 'Work Hard', dua: 'May Allah give you strength and success in all your efforts today.' },
  { id: 'health', label: 'Health', dua: 'May Allah grant you good health and protect you from all harm.' },
  { id: 'peace', label: 'Peace', dua: 'May Allah fill your heart with peace and tranquility.' },
  { id: 'gratitude', label: 'Gratitude', dua: 'Alhamdulillah for another day with you. May we always be grateful.' },
]

export default function HomePage() {
  const { user, logout } = useAuth()
  const [status, setStatus] = useState(null)
  const [partnerStatus, setPartnerStatus] = useState(null)
  const [question, setQuestion] = useState(null)
  const [answers, setAnswers] = useState({ shah: null, dane: null })
  const [myAnswer, setMyAnswer] = useState('')
  const [showDuaModal, setShowDuaModal] = useState(false)
  const [selectedDua, setSelectedDua] = useState(null)
  const [recentDuas, setRecentDuas] = useState([])
  const [loveMessage, setLoveMessage] = useState(null)
  const [showLoveModal, setShowLoveModal] = useState(false)
  const [newLove, setNewLove] = useState('')

  const theirName = user?.role === 'shah' ? 'Dane' : 'Shahjahan'
  const partnerRole = user?.role === 'shah' ? 'dane' : 'shah'

  useEffect(() => {
    if (user) {
      fetchStatus()
      fetchTodaysQuestion()
      fetchRecentDuas()
      fetchLoveMessage()

      const channel = supabase.channel('home-updates')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'status_updates' }, fetchStatus)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_questions' }, fetchTodaysQuestion)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'dua_requests' }, fetchRecentDuas)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'love_messages' }, fetchLoveMessage)
        .subscribe()

      return () => supabase.removeChannel(channel)
    }
  }, [user])

  const fetchStatus = async () => {
    const { data: myData } = await supabase.from('status_updates').select('*').eq('user_role', user.role).order('created_at', { ascending: false }).limit(1).single()
    const { data: theirData } = await supabase.from('status_updates').select('*').eq('user_role', partnerRole).order('created_at', { ascending: false }).limit(1).single()
    setStatus(myData)
    setPartnerStatus(theirData)
  }

  const fetchTodaysQuestion = async () => {
    const today = new Date().toISOString().split('T')[0]
    const { data: q } = await supabase.from('daily_questions').select('*').eq('date', today).single()
    if (q) {
      setQuestion(q)
      const { data: ans } = await supabase.from('question_answers').select('*').eq('question_id', q.id)
      const ansMap = { shah: null, dane: null }
      ans?.forEach(a => { ansMap[a.user_role] = a.answer })
      setAnswers(ansMap)
      if (ansMap[user.role]) setMyAnswer(ansMap[user.role])
    }
  }

  const fetchRecentDuas = async () => {
    const { data } = await supabase.from('dua_requests').select('*').order('created_at', { ascending: false }).limit(5)
    setRecentDuas(data || [])
  }

  const fetchLoveMessage = async () => {
    const { data } = await supabase.from('love_messages').select('*').eq('to_user', user.role).order('created_at', { ascending: false }).limit(1).single()
    setLoveMessage(data)
  }

  const updateStatus = async (newStatus) => {
    await supabase.from('status_updates').upsert({ user_role: user.role, status: newStatus, updated_at: new Date().toISOString() }, { onConflict: 'user_role' })
    fetchStatus()
  }

  const submitAnswer = async () => {
    if (!myAnswer.trim() || !question) return
    await supabase.from('question_answers').upsert({ question_id: question.id, user_role: user.role, answer: myAnswer }, { onConflict: 'question_id,user_role' })
    fetchTodaysQuestion()
  }

  const sendDua = async (category) => {
    const dua = duaCategories.find(d => d.id === category)
    await supabase.from('dua_requests').insert({
      from_user: user.role,
      to_user: partnerRole,
      category: category,
      message: dua.dua
    })
    setSelectedDua(dua)
    setShowDuaModal(false)
    fetchRecentDuas()
    // Try to send notification
    sendNotification(theirName, `${user.role === 'shah' ? 'Shahjahan' : 'Dane'} sent you a dua: ${dua.label}`)
  }

  const sendLoveMessage = async () => {
    if (!newLove.trim()) return
    await supabase.from('love_messages').insert({ from_user: user.role, to_user: partnerRole, message: newLove })
    setNewLove('')
    setShowLoveModal(false)
    sendNotification(theirName, `${user.role === 'shah' ? 'Shahjahan' : 'Dane'} sent you a love note`)
  }

  const sendNotification = async (to, message) => {
    // PWA notifications - requires service worker registration
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('D(ane)ua', { body: message, icon: '/icon-192.png' })
    }
  }

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        alert('Notifications enabled')
      }
    }
  }

  const statusOptions = ['Thinking of you', 'Working', 'Relaxing', 'Missing you', 'Praying', 'Eating', 'Sleeping']

  return (
    <div className="min-h-screen pb-28">
      <div className="bg-forest px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="font-serif text-display-sm text-cream-50">Salaam,</h1>
              <p className="text-body-lg text-cream-200">{user?.role === 'shah' ? 'Shahjahan' : 'Dane'}</p>
            </div>
            <button onClick={logout} className="text-cream-300 text-body-sm">Logout</button>
          </div>

          {/* Partner Status */}
          {partnerStatus && (
            <div className="bg-white/10 rounded-2xl p-4">
              <p className="text-cream-300 text-body-sm mb-1">{theirName} is</p>
              <p className="text-cream-100 font-serif text-title">{partnerStatus.status}</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-cream px-6 py-8 -mt-4 rounded-t-3xl min-h-[60vh]">
        <div className="max-w-lg mx-auto">
          {/* Enable Notifications */}
          <button onClick={requestNotificationPermission} className="w-full bg-amber-100 rounded-xl p-3 mb-6 text-body-sm text-amber-800">
            Tap to enable notifications
          </button>

          {/* My Status */}
          <div className="mb-8">
            <p className="text-body-sm text-ink-400 mb-3">Update your status</p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map(s => (
                <button key={s} onClick={() => updateStatus(s)} className={`px-4 py-2 rounded-full text-body-sm transition-colors ${status?.status === s ? 'bg-forest text-cream-100' : 'bg-white shadow-soft text-ink-600'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Today's Question */}
          {question && (
            <div className="bg-white rounded-2xl p-5 shadow-card mb-6">
              <p className="text-body-sm text-forest font-medium mb-2">Today's Question</p>
              <p className="font-serif text-title-sm text-forest mb-4">{question.question}</p>

              {!answers[user.role] ? (
                <div>
                  <textarea
                    value={myAnswer}
                    onChange={e => setMyAnswer(e.target.value)}
                    placeholder="Your answer..."
                    className="w-full px-4 py-3 border border-cream-300 rounded-xl h-24 resize-none mb-3"
                  />
                  <button onClick={submitAnswer} className="w-full bg-forest text-cream-100 py-3 rounded-xl font-medium">Submit</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-cream-100 rounded-xl p-4">
                    <p className="text-caption text-ink-400 mb-1">Your answer</p>
                    <p className="text-body text-ink-600">{answers[user.role]}</p>
                  </div>
                  {answers[partnerRole] ? (
                    <div className="bg-rose-50 rounded-xl p-4">
                      <p className="text-caption text-ink-400 mb-1">{theirName}'s answer</p>
                      <p className="text-body text-ink-600">{answers[partnerRole]}</p>
                    </div>
                  ) : (
                    <p className="text-body-sm text-ink-400 text-center">Waiting for {theirName}...</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Love Message */}
          {loveMessage && (
            <div className="bg-rose-50 rounded-2xl p-5 mb-6">
              <p className="text-body-sm text-rose-600 mb-2">Love note from {loveMessage.from_user === 'shah' ? 'Shahjahan' : 'Dane'}</p>
              <p className="font-serif text-title-sm text-forest">{loveMessage.message}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button onClick={() => setShowDuaModal(true)} className="bg-forest text-cream-100 rounded-xl p-4 text-left">
              <p className="font-serif text-title-sm">Send a Dua</p>
              <p className="text-body-sm text-cream-300">Pray for {theirName}</p>
            </button>
            <button onClick={() => setShowLoveModal(true)} className="bg-rose-500 text-white rounded-xl p-4 text-left">
              <p className="font-serif text-title-sm">Love Note</p>
              <p className="text-body-sm text-rose-200">Send some love</p>
            </button>
          </div>

          {/* Recent Duas */}
          {recentDuas.length > 0 && (
            <div>
              <p className="text-body-sm text-ink-400 mb-3">Recent Duas</p>
              <div className="space-y-2">
                {recentDuas.map(dua => (
                  <div key={dua.id} className="bg-white rounded-xl p-4 shadow-soft">
                    <p className="text-body-sm text-forest">{dua.from_user === 'shah' ? 'Shahjahan' : 'Dane'} sent: {dua.category}</p>
                    <p className="text-caption text-ink-400">{new Date(dua.created_at).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sent Dua Confirmation */}
          {selectedDua && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
              <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center">
                <p className="text-body-sm text-forest mb-2">Dua Sent</p>
                <p className="font-serif text-title text-forest mb-4">{selectedDua.label}</p>
                <p className="text-body text-ink-500 mb-6">{selectedDua.dua}</p>
                <button onClick={() => setSelectedDua(null)} className="w-full bg-forest text-cream-100 py-3 rounded-xl">Done</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dua Modal */}
      {showDuaModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-4">Send a Dua to {theirName}</h3>
            <div className="space-y-2">
              {duaCategories.map(dua => (
                <button key={dua.id} onClick={() => sendDua(dua.id)} className="w-full bg-cream-100 rounded-xl p-4 text-left hover:bg-cream-200 transition-colors">
                  <p className="font-medium text-forest">{dua.label}</p>
                  <p className="text-body-sm text-ink-400">{dua.dua}</p>
                </button>
              ))}
            </div>
            <button onClick={() => setShowDuaModal(false)} className="w-full mt-4 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
          </div>
        </div>
      )}

      {/* Love Note Modal */}
      {showLoveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-4">Send Love to {theirName}</h3>
            <textarea
              value={newLove}
              onChange={e => setNewLove(e.target.value)}
              placeholder="Write something sweet..."
              className="w-full px-4 py-3 border border-cream-300 rounded-xl h-32 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setShowLoveModal(false); setNewLove('') }} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={sendLoveMessage} className="flex-1 py-3 bg-rose-500 text-white rounded-xl">Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
