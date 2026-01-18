import { useState, useEffect } from 'react'
import { getLoveMessage, getLoveLetters, getTodaysMoments } from '../lib/supabase'

const emotionalNeeds = [
  { id: 'miss_you', label: 'I miss you' },
  { id: 'encouragement', label: 'I need encouragement' },
  { id: 'make_me_laugh', label: 'Make me laugh' },
  { id: 'stressed', label: 'I am stressed' },
  { id: 'hear_your_voice', label: 'I want to hear your voice' },
]

export default function UsPage() {
  const [activeSection, setActiveSection] = useState('feel')
  const [selectedNeed, setSelectedNeed] = useState(null)
  const [message, setMessage] = useState(null)
  const [letters, setLetters] = useState([])
  const [moments, setMoments] = useState([])
  const [loadingMessage, setLoadingMessage] = useState(false)

  useEffect(() => {
    getLoveLetters().then(setLetters).catch(console.error)
    getTodaysMoments().then(setMoments).catch(console.error)
  }, [])

  const handleNeedSelect = async (need) => {
    setSelectedNeed(need.id)
    setLoadingMessage(true)
    setMessage(null)
    
    try {
      const msg = await getLoveMessage(need.id)
      setMessage(msg)
    } catch (error) {
      console.error('Error fetching message:', error)
      setMessage({ content: 'Something went wrong, but know that I love you always.' })
    }
    
    setLoadingMessage(false)
  }

  const closeMessage = () => {
    setSelectedNeed(null)
    setMessage(null)
  }

  return (
    <div className="px-6 pt-12 pb-8">
      {/* Header */}
      <header className="mb-8 animate-fade-up">
        <h1 className="font-serif text-3xl text-forest">Us</h1>
        <p className="text-small text-ink-400 mt-1">Our little world</p>
      </header>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-8 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        {[
          { id: 'feel', label: 'How You Feel' },
          { id: 'letters', label: 'Letters' },
          { id: 'moments', label: 'Moments' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`
              px-4 py-2 rounded-full text-small font-medium transition-all duration-200
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

      {/* Feel Section */}
      {activeSection === 'feel' && (
        <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <p className="text-body text-ink-500 mb-6">What do you need right now?</p>
          
          <div className="space-y-3">
            {emotionalNeeds.map((need, index) => (
              <button
                key={need.id}
                onClick={() => handleNeedSelect(need)}
                className={`
                  w-full text-left px-5 py-4 rounded-xl border transition-all duration-200
                  ${selectedNeed === need.id 
                    ? 'border-forest bg-forest-50 text-forest' 
                    : 'border-cream-300 bg-white text-ink-600 hover:border-forest-200 hover:bg-cream-100'
                  }
                `}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <span className="font-medium">{need.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Letters Section */}
      {activeSection === 'letters' && (
        <div className="space-y-4 animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {letters.length > 0 ? (
            letters.map((letter, index) => (
              <div 
                key={letter.id} 
                className="card-elevated"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                {letter.is_pinned && (
                  <span className="tag tag-gold mb-3">Pinned</span>
                )}
                <h3 className="font-serif text-lg text-forest mb-3">{letter.title}</h3>
                <p className="text-body text-ink-500 leading-relaxed whitespace-pre-wrap">
                  {letter.content}
                </p>
                <p className="text-tiny text-ink-300 mt-4">
                  {new Date(letter.created_at).toLocaleDateString('en-US', { 
                    month: 'long', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-ink-400">No letters yet</p>
              <p className="text-small text-ink-300 mt-1">Shah will write you something soon</p>
            </div>
          )}
        </div>
      )}

      {/* Moments Section */}
      {activeSection === 'moments' && (
        <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          <div className="card-elevated mb-6">
            <h3 className="font-serif text-lg text-forest mb-4">Today</h3>
            <div className="grid grid-cols-2 gap-4">
              {/* Shah's moment */}
              <div className="aspect-square bg-cream-200 rounded-xl flex items-center justify-center">
                {moments.find(m => m.user_role === 'shah') ? (
                  <img 
                    src={moments.find(m => m.user_role === 'shah').photo_url}
                    alt="Shah's moment"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="text-center p-4">
                    <p className="text-small text-ink-400">Shah</p>
                    <p className="text-tiny text-ink-300">No photo yet</p>
                  </div>
                )}
              </div>
              
              {/* Dane's moment */}
              <div className="aspect-square bg-cream-200 rounded-xl flex items-center justify-center">
                {moments.find(m => m.user_role === 'dane') ? (
                  <img 
                    src={moments.find(m => m.user_role === 'dane').photo_url}
                    alt="Your moment"
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <button className="w-full h-full flex flex-col items-center justify-center text-ink-400 hover:text-forest transition-colors">
                    <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                    </svg>
                    <p className="text-small">Add photo</p>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-center text-small text-ink-400">
            Share a moment from your day
          </p>
        </div>
      )}

      {/* Message Modal */}
      {message && (
        <div 
          className="fixed inset-0 bg-forest-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={closeMessage}
        >
          <div 
            className="bg-cream rounded-3xl p-8 max-w-sm w-full shadow-elevated animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {message.title && (
              <h3 className="font-serif text-xl text-forest mb-4 text-center">{message.title}</h3>
            )}
            
            {message.message_type === 'text' ? (
              <p className="text-body text-ink-600 leading-relaxed text-center">
                {message.content}
              </p>
            ) : message.message_type === 'audio' && message.storage_url ? (
              <div className="space-y-4">
                <p className="text-small text-ink-400 text-center">A voice note from Shah</p>
                <audio controls src={message.storage_url} className="w-full" />
              </div>
            ) : message.message_type === 'video' && message.storage_url ? (
              <video controls src={message.storage_url} className="w-full rounded-xl" />
            ) : (
              <p className="text-body text-ink-600 text-center">{message.content}</p>
            )}

            <button
              onClick={closeMessage}
              className="btn-primary w-full mt-8"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loadingMessage && (
        <div className="fixed inset-0 bg-cream/80 z-50 flex items-center justify-center">
          <p className="text-forest font-serif text-xl animate-pulse">Finding something for you...</p>
        </div>
      )}
    </div>
  )
}
