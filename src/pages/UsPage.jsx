import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getLoveMessage,
  getLoveLetters,
  addLoveLetter,
  getTodaysMoments,
  getMomentsHistory,
  addMoment,
  uploadPhoto,
  uploadAudio
} from '../lib/supabase'

const moods = [
  { id: 'miss_you', label: 'I miss you', gradient: 'from-rose-300 via-rose-200 to-rose-100' },
  { id: 'need_encouragement', label: 'I need encouragement', gradient: 'from-gold-300 via-gold-200 to-gold-100' },
  { id: 'stressed', label: "I'm stressed", gradient: 'from-forest-200 via-forest-100 to-cream' },
  { id: 'anxious', label: "I'm anxious", gradient: 'from-cream-400 via-cream-300 to-cream-200' },
  { id: 'happy', label: "I'm so happy", gradient: 'from-gold-200 via-rose-100 to-cream' },
  { id: 'loved', label: 'I feel loved', gradient: 'from-rose-400 via-rose-300 to-gold-200' },
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
  const [showAddLetter, setShowAddLetter] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  
  // Recording
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const photoInputRef = useRef(null)

  const theirName = user?.role === 'shah' ? 'Dane' : 'Shahjahan'
  const myName = user?.role === 'shah' ? 'Shahjahan' : 'Dane'

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

  const handleAddLetter = async (title, content) => {
    try {
      const letter = await addLoveLetter(user.role, title, content)
      setLetters(prev => [letter, ...prev])
      setShowAddLetter(false)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const fileName = `${user.role}-${Date.now()}.${file.name.split('.').pop()}`
      const url = await uploadPhoto(file, fileName)
      await addMoment(user.role, url, null)
      const newMoments = await getTodaysMoments()
      setTodayMoments(newMoments)
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Could not upload photo')
    }
  }

  // Voice recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => chunksRef.current.push(e.data)
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error:', error)
      alert('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-300 via-rose-200 to-gold-100 px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-display-sm text-forest mb-2">Us</h1>
          <p className="text-body text-forest-600">Our little corner of the world</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-cream px-6 py-4 sticky top-0 z-20 border-b border-cream-300">
        <div className="max-w-lg mx-auto flex justify-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { id: 'feel', label: 'How I Feel' },
            { id: 'voice', label: 'Voice Notes' },
            { id: 'letters', label: 'Letters' },
            { id: 'pics', label: 'Pic of the Day' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`
                px-4 py-3 rounded-full text-body-sm font-medium whitespace-nowrap transition-all
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
            <div className="max-w-lg mx-auto text-center">
              <p className="font-serif text-title text-forest mb-2">What do you need?</p>
              <p className="text-body text-ink-400 mb-8">{myName} left messages just for you</p>

              <div className="space-y-4">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => handleMoodSelect(mood)}
                    className={`w-full text-left p-6 rounded-3xl bg-gradient-to-r ${mood.gradient} transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <p className="font-serif text-title-sm text-forest">{mood.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Voice Notes Section */}
        {activeSection === 'voice' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto text-center">
              <p className="font-serif text-title text-forest mb-2">Send a Voice Note</p>
              <p className="text-body text-ink-400 mb-8">Sometimes words are better heard</p>

              <div className="bg-white rounded-3xl p-8 shadow-card">
                {!audioUrl ? (
                  <>
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`
                        w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all
                        ${isRecording 
                          ? 'bg-rose-500 animate-pulse' 
                          : 'bg-gradient-to-br from-rose-400 to-gold-400 hover:shadow-elevated'
                        }
                      `}
                    >
                      {isRecording ? (
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <rect x="6" y="6" width="12" height="12" rx="2" />
                        </svg>
                      ) : (
                        <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                        </svg>
                      )}
                    </button>
                    <p className="text-body text-ink-400 mt-4">
                      {isRecording ? 'Recording... Tap to stop' : 'Tap to record'}
                    </p>
                  </>
                ) : (
                  <div className="space-y-4">
                    <audio controls src={audioUrl} className="w-full" />
                    <div className="flex gap-3">
                      <button className="btn-primary flex-1">
                        Send to {theirName}
                      </button>
                      <button 
                        onClick={() => { setAudioBlob(null); setAudioUrl(null); }} 
                        className="btn-ghost"
                      >
                        Redo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Letters Section */}
        {activeSection === 'letters' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <div className="text-center mb-8">
                <p className="font-serif text-title text-forest mb-2">Love Letters</p>
                <p className="text-body text-ink-400">Words to keep forever</p>
              </div>

              {/* Add Letter Button */}
              <button 
                onClick={() => setShowAddLetter(true)}
                className="w-full mb-6 py-5 border-2 border-dashed border-rose-300 rounded-2xl text-rose-500 hover:border-rose-400 hover:bg-rose-50 transition-all font-medium"
              >
                + Write a letter
              </button>

              {letters.length > 0 ? (
                <div className="space-y-6">
                  {letters.map((letter) => (
                    <div 
                      key={letter.id} 
                      className="bg-cream-50 rounded-3xl p-8 shadow-card cursor-pointer border-l-4 border-rose-300"
                      onClick={() => setExpandedLetter(expandedLetter === letter.id ? null : letter.id)}
                      style={{
                        backgroundImage: 'linear-gradient(rgba(26, 60, 52, 0.02) 1px, transparent 1px)',
                        backgroundSize: '100% 2rem',
                      }}
                    >
                      {letter.is_pinned && (
                        <span className="tag tag-gold mb-4">Pinned</span>
                      )}
                      
                      <h3 className="font-serif text-title text-forest mb-4">
                        {letter.title || 'A letter for you'}
                      </h3>
                      
                      <p className={`text-body text-ink-500 leading-relaxed whitespace-pre-wrap ${
                        expandedLetter === letter.id ? '' : 'line-clamp-4'
                      }`}>
                        {letter.content}
                      </p>
                      
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-cream-300">
                        <p className="text-caption text-ink-400">
                          With love, {letter.from_user === 'shah' ? 'Shahjahan' : 'Dane'}
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
                  <p className="text-body-sm text-ink-300 mt-1">Write the first one</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pic of the Day Section */}
        {activeSection === 'pics' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <div className="text-center mb-8">
                <p className="font-serif text-title text-forest mb-2">Pic of the Day</p>
                <p className="text-body text-ink-400">A moment from your world</p>
              </div>

              {/* Today's Pics */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                {/* Shahjahan's pic */}
                <div className="bg-white p-3 pb-10 shadow-card rounded-lg">
                  {todayMoments.find(m => m.user_role === 'shah') ? (
                    <>
                      <img 
                        src={todayMoments.find(m => m.user_role === 'shah').photo_url}
                        alt="Shahjahan's moment"
                        className="w-full aspect-square object-cover rounded"
                      />
                      <p className="text-body-sm text-ink-600 mt-3 text-center">Shahjahan</p>
                    </>
                  ) : (
                    <div className="w-full aspect-square bg-cream-200 rounded flex items-center justify-center">
                      <div className="text-center p-4">
                        <p className="text-body-sm text-ink-400">Shahjahan</p>
                        <p className="text-caption text-ink-300">Not yet</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dane's pic */}
                <div className="bg-white p-3 pb-10 shadow-card rounded-lg">
                  {todayMoments.find(m => m.user_role === 'dane') ? (
                    <>
                      <img 
                        src={todayMoments.find(m => m.user_role === 'dane').photo_url}
                        alt="Dane's moment"
                        className="w-full aspect-square object-cover rounded"
                      />
                      <p className="text-body-sm text-ink-600 mt-3 text-center">Dane</p>
                    </>
                  ) : user?.role === 'dane' ? (
                    <button 
                      onClick={() => photoInputRef.current?.click()}
                      className="w-full aspect-square bg-cream-200 rounded flex items-center justify-center hover:bg-cream-300 transition-colors"
                    >
                      <div className="text-center p-4">
                        <svg className="w-10 h-10 mx-auto mb-2 text-ink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
                        </svg>
                        <p className="text-body-sm text-ink-400">Add photo</p>
                      </div>
                    </button>
                  ) : (
                    <div className="w-full aspect-square bg-cream-200 rounded flex items-center justify-center">
                      <div className="text-center p-4">
                        <p className="text-body-sm text-ink-400">Dane</p>
                        <p className="text-caption text-ink-300">Not yet</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Add photo for Shahjahan */}
              {user?.role === 'shah' && !todayMoments.find(m => m.user_role === 'shah') && (
                <button 
                  onClick={() => photoInputRef.current?.click()}
                  className="w-full mb-8 py-5 border-2 border-dashed border-forest-300 rounded-2xl text-forest hover:border-forest-400 hover:bg-forest-50 transition-all font-medium"
                >
                  + Add your photo for today
                </button>
              )}

              {/* Hidden file input */}
              <input 
                ref={photoInputRef}
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handlePhotoUpload}
              />

              {/* Past Pics */}
              {moments.length > 0 && (
                <div>
                  <p className="section-label text-center mb-4">Memories</p>
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
          </div>
        )}
      </div>

      {/* Message Modal */}
      {message && (
        <div 
          className="fixed inset-0 bg-forest-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={closeMessage}
        >
          <div 
            className="bg-gradient-to-br from-cream via-rose-50 to-cream rounded-[2rem] p-10 max-w-md w-full shadow-elevated"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <p className="font-serif text-title text-forest leading-relaxed">
                "{message.content}"
              </p>

              <div className="w-12 h-1 bg-gold rounded-full mx-auto mt-8 mb-6" />
              <p className="text-body-sm text-ink-400 italic">— {myName}</p>
            </div>

            <button onClick={closeMessage} className="btn-primary w-full mt-8">
              I needed that ❤️
            </button>
          </div>
        </div>
      )}

      {/* Add Letter Modal */}
      {showAddLetter && (
        <AddLetterModal 
          onClose={() => setShowAddLetter(false)} 
          onAdd={handleAddLetter}
          myName={myName}
        />
      )}

      {/* Loading */}
      {loadingMessage && (
        <div className="fixed inset-0 bg-cream/90 z-50 flex items-center justify-center">
          <p className="font-serif text-title text-forest animate-pulse-soft">
            Finding something for you...
          </p>
        </div>
      )}
    </div>
  )
}

function AddLetterModal({ onClose, onAdd, myName }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    await onAdd(title, content)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-forest-900/50 backdrop-blur-sm z-50 flex items-end" onClick={onClose}>
      <div 
        className="bg-cream w-full rounded-t-[2rem] p-6 max-h-[90vh] overflow-y-auto safe-bottom"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-title text-forest">Write a Letter</h2>
          <button onClick={onClose} className="p-2 text-ink-400 hover:text-ink-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-body-sm font-medium text-ink-600 block mb-2">Title (optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input"
              placeholder="For when you need to know..."
            />
          </div>

          <div>
            <label className="text-body-sm font-medium text-ink-600 block mb-2">Your letter</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="input min-h-[200px] resize-none"
              placeholder="Write from the heart..."
              required
            />
          </div>

          <p className="text-body-sm text-ink-400 text-center">
            Signed with love, {myName}
          </p>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send Letter'}
          </button>
        </form>
      </div>
    </div>
  )
}
