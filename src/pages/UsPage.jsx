import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getLoveMessage,
  getLoveLetters,
  getTodaysMoments,
  getMomentsHistory,
  sendDuaRequest
} from '../lib/supabase'

const moods = [
  { id: 'miss_you', label: 'I miss you', class: 'mood-miss-you' },
  { id: 'need_encouragement', label: 'I need encouragement', class: 'mood-encouragement' },
  { id: 'stressed', label: "I'm stressed", class: 'mood-stressed' },
  { id: 'anxious', label: "I'm anxious", class: 'mood-anxious' },
  { id: 'happy', label: "I'm happy", class: 'mood-happy' },
  { id: 'loved', label: 'I feel loved', class: 'mood-loved' },
]

export default function UsPage() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('feel')
  const [selectedMood, setSelectedMood] = useState(null)
  const [message, setMessage] = useState(null)
  const [letters, setLetters] = useState([])
  const [moments, setMoments] = useState([])
  const [todayMoments, setTodayMoments] = useState([])
  const [loadingMessage, setLoadingMessage] = useState(false)
  const [expandedLetter, setExpandedLetter] = useState(null)

  const theirName = user?.role === 'shah' ? 'Dane' : 'Shah'

  useEffect(() => {
    getLoveLetters().then(setLetters).catch(console.error)
    getTodaysMoments().then(setTodayMoments).catch(console.error)
    getMomentsHistory(14).then(setMoments).catch(console.error)
  }, [])

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood.id)
    setLoadingMessage(true)
    setMessage(null)

    try {
      const msg = await getLoveMessage(mood.id)
      setMessage(msg)
    } catch (error) {
      console.error('Error:', error)
      setMessage({ content: "Something went wrong, but know that I love you. Always." })
    }

    setLoadingMessage(false)
  }

  const closeMessage = () => {
    setSelectedMood(null)
    setMessage(null)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-200 via-rose-100 to-gold-100 px-6 pt-16 pb-10">
        <div className="stagger">
          <h1 className="font-serif text-display-sm text-forest mb-2">Us</h1>
          <p className="text-body text-forest-600">Our little world together</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-cream px-6 py-4 sticky top-0 z-20 border-b border-cream-300">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'feel', label: 'How I Feel' },
            { id: 'letters', label: 'Letters' },
            { id: 'moments', label: 'Moments' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`
                px-5 py-3 rounded-full text-body-sm font-medium whitespace-nowrap transition-all
                ${activeSection === tab.id 
                  ? 'bg-forest text-cream-100' 
                  : 'bg-cream-200 text-ink-500 hover:bg-cream-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-cream min-h-[60vh]">
        {/* Feel Section */}
        {activeSection === 'feel' && (
          <div className="px-6 py-8">
            <p className="section-label mb-2">What do you need right now?</p>
            <p className="text-body text-ink-400 mb-8">Shah left messages for you</p>

            <div className="space-y-4 stagger">
              {moods.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => handleMoodSelect(mood)}
                  className={`w-full text-left p-6 rounded-3xl transition-all duration-300 ${mood.class}`}
                >
                  <p className="font-serif text-title-sm">{mood.label}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Letters Section */}
        {activeSection === 'letters' && (
          <div className="px-6 py-8">
            {letters.length > 0 ? (
              <div className="space-y-6 stagger">
                {letters.map((letter) => (
                  <div 
                    key={letter.id} 
                    className="letter-paper cursor-pointer"
                    onClick={() => setExpandedLetter(expandedLetter === letter.id ? null : letter.id)}
                  >
                    {letter.is_pinned && (
                      <span className="tag tag-gold mb-4">Pinned</span>
                    )}
                    
                    <h3 className="font-serif text-title text-forest mb-3">
                      {letter.title || 'A letter for you'}
                    </h3>
                    
                    <p className={`text-body text-ink-500 leading-relaxed whitespace-pre-wrap ${
                      expandedLetter === letter.id ? '' : 'line-clamp-4'
                    }`}>
                      {letter.content}
                    </p>
                    
                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-cream-300">
                      <p className="text-caption text-ink-400">
                        From {letter.from_user === 'shah' ? 'Shah' : 'Dane'}
                      </p>
                      <p className="text-caption text-ink-300">
                        {formatDate(letter.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <span className="text-5xl mb-4 block">💌</span>
                <p className="text-body text-ink-400">No letters yet</p>
                <p className="text-body-sm text-ink-300 mt-1">Check back soon</p>
              </div>
            )}
          </div>
        )}

        {/* Moments Section */}
        {activeSection === 'moments' && (
          <div className="px-6 py-8">
            {/* Today's Moments */}
            <div className="mb-10">
              <p className="section-label mb-4">Today</p>
              <div className="grid grid-cols-2 gap-4">
                {/* Shah's moment */}
                <div className="polaroid">
                  {todayMoments.find(m => m.user_role === 'shah') ? (
                    <>
                      <img 
                        src={todayMoments.find(m => m.user_role === 'shah').photo_url}
                        alt="Shah's moment"
                        className="w-full aspect-square object-cover rounded"
                      />
                      <p className="text-body-sm text-ink-600 mt-3">Shah</p>
                    </>
                  ) : (
                    <div className="w-full aspect-square bg-cream-200 rounded flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-body-sm text-ink-400">Shah</p>
                        <p className="text-caption text-ink-300">Not yet</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dane's moment */}
                <div className="polaroid">
                  {todayMoments.find(m => m.user_role === 'dane') ? (
                    <>
                      <img 
                        src={todayMoments.find(m => m.user_role === 'dane').photo_url}
                        alt="Dane's moment"
                        className="w-full aspect-square object-cover rounded"
                      />
                      <p className="text-body-sm text-ink-600 mt-3">Dane</p>
                    </>
                  ) : (
                    <button className="w-full aspect-square bg-cream-200 rounded flex items-center justify-center hover:bg-cream-300 transition-colors">
                      <div className="text-center">
                        <svg className="w-8 h-8 mx-auto mb-2 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                        </svg>
                        <p className="text-body-sm text-ink-400">Add photo</p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Past Moments */}
            {moments.length > 0 && (
              <div>
                <p className="section-label mb-4">Memories</p>
                <div className="grid grid-cols-3 gap-2">
                  {moments.map((moment) => (
                    <div key={moment.id} className="aspect-square rounded-xl overflow-hidden">
                      <img 
                        src={moment.photo_url}
                        alt={moment.caption || 'Moment'}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Message Modal */}
      {message && (
        <div 
          className="fixed inset-0 bg-forest-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={closeMessage}
        >
          <div 
            className="bg-cream rounded-4xl p-10 max-w-md w-full shadow-elevated animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              {message.message_type === 'text' ? (
                <p className="font-serif text-title text-forest leading-relaxed">
                  "{message.content}"
                </p>
              ) : message.message_type === 'audio' && message.storage_url ? (
                <div>
                  <p className="text-body text-ink-400 mb-4">A voice note from Shah</p>
                  <audio controls src={message.storage_url} className="w-full" />
                </div>
              ) : message.message_type === 'video' && message.storage_url ? (
                <video controls src={message.storage_url} className="w-full rounded-2xl" />
              ) : (
                <p className="font-serif text-title text-forest leading-relaxed">
                  "{message.content}"
                </p>
              )}

              <div className="line-accent mx-auto mt-8 mb-6" />
              <p className="text-body-sm text-ink-400">— Shah</p>
            </div>

            <button onClick={closeMessage} className="btn-primary w-full mt-8">
              Thank you
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loadingMessage && (
        <div className="fixed inset-0 bg-cream/90 z-50 flex items-center justify-center">
          <p className="font-serif text-title text-forest animate-pulse-soft">
            Finding something for you...
          </p>
        </div>
      )}

      {/* Spacer */}
      <div className="h-24 bg-cream" />
    </div>
  )
}
