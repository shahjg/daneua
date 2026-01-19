import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getLoveMessage,
  getLoveLetters,
  addLoveLetter,
  getTodaysMoments,
  getMomentsHistory,
  addMoment,
  supabase
} from '../lib/supabase'

const moods = [
  { id: 'miss_you', label: 'I miss you', emoji: '🥺', gradient: 'from-rose-100 to-rose-200' },
  { id: 'need_encouragement', label: 'Need a boost', emoji: '💪', gradient: 'from-gold-100 to-gold-200' },
  { id: 'stressed', label: 'Stressed', emoji: '😮‍💨', gradient: 'from-cream-200 to-cream-300' },
  { id: 'anxious', label: 'Anxious', emoji: '😰', gradient: 'from-forest-50 to-forest-100' },
  { id: 'happy', label: 'So happy', emoji: '🥰', gradient: 'from-gold-100 to-rose-100' },
  { id: 'loved', label: 'Feeling loved', emoji: '💕', gradient: 'from-rose-100 to-gold-100' },
]

// Get voice notes from database
async function getVoiceNotes() {
  const { data, error } = await supabase
    .from('voice_notes')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)
  
  if (error) {
    console.error('Voice notes error:', error)
    return []
  }
  return data || []
}

// Save voice note to database
async function saveVoiceNote(fromUser, audioUrl) {
  const { data, error } = await supabase
    .from('voice_notes')
    .insert({ from_user: fromUser, audio_url: audioUrl })
    .select()
    .single()
  
  if (error) throw error
  return data
}

export default function UsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('feel')
  const [selectedMood, setSelectedMood] = useState(null)
  const [moodMessage, setMoodMessage] = useState(null)
  const [letters, setLetters] = useState([])
  const [voiceNotes, setVoiceNotes] = useState([])
  const [showWriteLetter, setShowWriteLetter] = useState(false)
  const [todaysMoments, setTodaysMoments] = useState([])
  const [momentsHistory, setMomentsHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const theirName = user?.role === 'shah' ? 'Dane' : 'Shahjahan'

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [lettersData, todayData, historyData, notesData] = await Promise.all([
        getLoveLetters(),
        getTodaysMoments(),
        getMomentsHistory(14),
        getVoiceNotes()
      ])
      setLetters(lettersData || [])
      setTodaysMoments(todayData || [])
      setMomentsHistory(historyData || [])
      setVoiceNotes(notesData || [])
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood)
    try {
      const message = await getLoveMessage(mood.id)
      setMoodMessage(message?.content || `${theirName} loves you so much 💕`)
    } catch (error) {
      setMoodMessage(`${theirName} loves you so much 💕`)
    }
  }

  const handleAddLetter = async (title, content) => {
    try {
      const newLetter = await addLoveLetter(user.role, title, content)
      setLetters(prev => [newLetter, ...prev])
      setShowWriteLetter(false)
    } catch (error) {
      console.error('Error:', error)
      alert('Could not save letter. Please try again.')
    }
  }

  const handleVoiceNoteSent = (newNote) => {
    setVoiceNotes(prev => [newNote, ...prev])
  }

  const handlePhotoUpload = async (file) => {
    try {
      const ext = file.name?.split('.').pop() || 'jpg'
      const fileName = `moments/${user.role}/${Date.now()}.${ext}`
      
      const { error } = await supabase.storage
        .from('photos')
        .upload(fileName, file, { 
          contentType: file.type || 'image/jpeg',
          upsert: true
        })
      
      if (error) throw new Error(error.message)

      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName)
      const newMoment = await addMoment(user.role, urlData.publicUrl)
      setTodaysMoments(prev => [...prev, newMoment])
      setMomentsHistory(prev => [newMoment, ...prev])
      
      alert('Photo uploaded!')
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Could not upload: ${error.message}\n\nMake sure "photos" bucket exists in Supabase Storage and is set to Public.`)
    }
  }

  const tabs = [
    { id: 'feel', label: 'How I Feel' },
    { id: 'voice', label: 'Voice Notes' },
    { id: 'letters', label: 'Letters' },
    { id: 'photo', label: 'Pic of Day' },
  ]

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-200 via-gold-100 to-rose-100 px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-display-sm text-forest mb-2">Us</h1>
          <p className="text-body text-forest-600">Our little corner 💕</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-cream px-4 py-4 sticky top-0 z-20 border-b border-cream-300">
        <div className="max-w-lg mx-auto flex justify-center gap-1 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-full text-body-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-forest text-cream-100' 
                  : 'bg-cream-200 text-ink-500 hover:bg-cream-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-cream min-h-[60vh]">
        {/* How I Feel */}
        {activeTab === 'feel' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <p className="text-center text-body text-ink-500 mb-6">
                Tap how you're feeling
              </p>
              <div className="grid grid-cols-2 gap-4">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => handleMoodSelect(mood)}
                    className={`bg-gradient-to-br ${mood.gradient} rounded-3xl p-6 text-center hover:scale-[1.02] transition-transform active:scale-[0.98]`}
                  >
                    <span className="text-4xl mb-3 block">{mood.emoji}</span>
                    <p className="font-medium text-forest">{mood.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Voice Notes */}
        {activeTab === 'voice' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <VoiceNoteRecorder user={user} theirName={theirName} onSent={handleVoiceNoteSent} />
              
              {voiceNotes.length > 0 && (
                <div className="mt-8">
                  <p className="section-label mb-4">Previous Notes</p>
                  <div className="space-y-3">
                    {voiceNotes.map((note) => (
                      <div key={note.id} className="bg-white rounded-2xl p-4 shadow-soft">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-body-sm font-medium text-forest">
                            {note.from_user === user?.role ? 'You' : theirName}
                          </p>
                          <p className="text-caption text-ink-300">
                            {new Date(note.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <audio src={note.audio_url} controls className="w-full h-10" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Letters */}
        {activeTab === 'letters' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <button
                onClick={() => setShowWriteLetter(true)}
                className="w-full mb-6 py-5 border-2 border-dashed border-rose-300 rounded-2xl text-rose-500 hover:border-rose-400 hover:bg-rose-50 transition-all font-medium"
              >
                ✍️ Write a letter
              </button>

              {letters.length > 0 ? (
                <div className="space-y-4">
                  {letters.map((letter) => (
                    <LetterCard key={letter.id} letter={letter} currentUser={user?.role} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <span className="text-5xl mb-4 block">💌</span>
                  <p className="text-body text-ink-400">No letters yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pic of the Day */}
        {activeTab === 'photo' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <p className="text-center text-body text-ink-500 mb-6">Share a photo from your day</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <PhotoSlot 
                  label="Shahjahan" 
                  photo={todaysMoments.find(m => m.user_role === 'shah')}
                  canUpload={user?.role === 'shah'}
                  onUpload={handlePhotoUpload}
                />
                <PhotoSlot 
                  label="Dane" 
                  photo={todaysMoments.find(m => m.user_role === 'dane')}
                  canUpload={user?.role === 'dane'}
                  onUpload={handlePhotoUpload}
                />
              </div>

              {momentsHistory.length > 0 && (
                <div>
                  <p className="section-label mb-4">Recent Memories</p>
                  <div className="grid grid-cols-3 gap-2">
                    {momentsHistory.map((moment) => (
                      <div key={moment.id} className="aspect-square rounded-xl overflow-hidden bg-cream-200">
                        <img src={moment.photo_url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mood Message Modal */}
      {selectedMood && (
        <div className="fixed inset-0 bg-forest-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-6" onClick={() => setSelectedMood(null)}>
          <div className={`bg-gradient-to-br ${selectedMood.gradient} rounded-3xl p-8 w-full max-w-sm text-center shadow-elevated`} onClick={(e) => e.stopPropagation()}>
            <span className="text-6xl mb-6 block">{selectedMood.emoji}</span>
            <p className="font-serif text-title text-forest mb-6 text-balance">{moodMessage}</p>
            <button onClick={() => setSelectedMood(null)} className="btn-primary">I needed that ❤️</button>
          </div>
        </div>
      )}

      {/* Write Letter Modal */}
      {showWriteLetter && (
        <WriteLetterModal user={user} onClose={() => setShowWriteLetter(false)} onSubmit={handleAddLetter} />
      )}
    </div>
  )
}

function VoiceNoteRecorder({ user, theirName, onSent }) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState(null)
  const [recordingTime, setRecordingTime] = useState(0)
  
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const streamRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  const startRecording = async () => {
    setError(null)
    setRecordingTime(0)
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      streamRef.current = stream
      
      // Try different mime types for iOS/Android compatibility
      let options = {}
      const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/aac', '']
      for (const type of types) {
        if (type === '' || MediaRecorder.isTypeSupported(type)) {
          if (type) options = { mimeType: type }
          break
        }
      }
      
      mediaRecorderRef.current = new MediaRecorder(stream, options)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start(1000)
      setIsRecording(true)
      timerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000)
    } catch (err) {
      console.error('Recording error:', err)
      setError(err.name === 'NotAllowedError' ? 'Microphone access denied. Please allow permission.' : `Could not start recording: ${err.message}`)
    }
  }

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const cancelRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setError(null)
    setRecordingTime(0)
  }

  const sendVoiceNote = async () => {
    if (!audioBlob) return
    setSending(true)
    setError(null)
    
    try {
      let ext = 'webm'
      if (audioBlob.type.includes('mp4')) ext = 'mp4'
      else if (audioBlob.type.includes('aac')) ext = 'aac'
      
      const fileName = `voice-notes/${user.role}/${Date.now()}.${ext}`
      
      const { error: uploadError } = await supabase.storage
        .from('audio')
        .upload(fileName, audioBlob, { contentType: audioBlob.type || 'audio/webm', upsert: true })
      
      if (uploadError) throw new Error(uploadError.message)

      const { data: urlData } = supabase.storage.from('audio').getPublicUrl(fileName)
      const newNote = await saveVoiceNote(user.role, urlData.publicUrl)
      
      setSent(true)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      setAudioBlob(null)
      setAudioUrl(null)
      setRecordingTime(0)
      if (onSent) onSent(newNote)
      setTimeout(() => setSent(false), 3000)
    } catch (err) {
      console.error('Upload error:', err)
      setError(`Could not send: ${err.message}\n\nMake sure:\n1. "audio" bucket exists in Supabase Storage\n2. Bucket is set to Public\n3. "voice_notes" table exists`)
    }
    setSending(false)
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="text-center">
      <p className="text-body text-ink-500 mb-8">Record a voice message for {theirName}</p>

      {error && <div className="bg-rose-100 text-rose-700 rounded-xl p-4 mb-6 text-body-sm text-left whitespace-pre-wrap">{error}</div>}
      {sent && <div className="bg-forest text-cream-100 rounded-xl p-4 mb-6 flex items-center justify-center gap-2">✓ Voice note sent!</div>}

      {!audioUrl ? (
        <div className="space-y-6">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto transition-all shadow-lg ${
              isRecording ? 'bg-rose-500 animate-pulse scale-110' : 'bg-forest hover:bg-forest-600 active:scale-95'
            }`}
          >
            {isRecording ? (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
            ) : (
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
              </svg>
            )}
          </button>
          {isRecording ? (
            <div>
              <p className="text-title text-rose-500 font-mono">{formatTime(recordingTime)}</p>
              <p className="text-body-sm text-ink-400 mt-1">Tap to stop</p>
            </div>
          ) : (
            <p className="text-body-sm text-ink-400">Tap to record</p>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-cream-200 rounded-2xl p-6">
            <p className="text-caption text-ink-400 mb-3">Preview ({formatTime(recordingTime)})</p>
            <audio src={audioUrl} controls className="w-full" />
          </div>
          <div className="flex gap-3">
            <button onClick={cancelRecording} className="btn-ghost flex-1">Cancel</button>
            <button onClick={sendVoiceNote} className="btn-primary flex-1" disabled={sending}>
              {sending ? 'Sending...' : `Send to ${theirName}`}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function WriteLetterModal({ user, onClose, onSubmit }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim()) return
    setLoading(true)
    await onSubmit(title || 'Untitled', content)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream w-full max-w-md rounded-3xl shadow-elevated overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 bg-rose-100">
          <h2 className="font-serif text-title text-forest">Write a Letter</h2>
          <button onClick={onClose} className="p-2 text-forest hover:text-forest-700 rounded-full hover:bg-rose-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-5">
          <form id="letter-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Title (optional)</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input" placeholder="My dearest..." />
            </div>
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Your letter *</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className="input min-h-[150px] resize-none" placeholder="Write from your heart..." required />
            </div>
            <p className="text-body-sm text-ink-400 text-right">— {user?.role === 'shah' ? 'Shahjahan' : 'Dane'}</p>
          </form>
        </div>

        <div className="p-5 bg-cream border-t border-cream-300">
          <button type="submit" form="letter-form" className="w-full py-4 bg-rose-500 text-white rounded-2xl font-semibold text-lg hover:bg-rose-600 transition-colors shadow-lg" disabled={loading || !content.trim()}>
            {loading ? 'Sending...' : '💌 Send Letter'}
          </button>
        </div>
      </div>
    </div>
  )
}

function LetterCard({ letter, currentUser }) {
  const [expanded, setExpanded] = useState(false)
  const senderName = letter.from_user === 'shah' ? 'Shahjahan' : 'Dane'

  return (
    <div className="bg-white rounded-2xl p-6 shadow-soft cursor-pointer hover:shadow-card transition-shadow" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          {letter.title && <h3 className="font-serif text-title-sm text-forest">{letter.title}</h3>}
          <p className="text-caption text-ink-400">From {senderName} • {new Date(letter.created_at).toLocaleDateString()}</p>
        </div>
        <span className="text-rose-400">{letter.from_user === currentUser ? '📝' : '💌'}</span>
      </div>
      <p className={`text-body text-ink-600 whitespace-pre-wrap ${!expanded && 'line-clamp-3'}`}>{letter.content}</p>
      {letter.content.length > 150 && <p className="text-body-sm text-forest mt-2 font-medium">{expanded ? 'Tap to collapse' : 'Tap to read more...'}</p>}
    </div>
  )
}

function PhotoSlot({ label, photo, canUpload, onUpload }) {
  const fileInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploading(true)
      await onUpload(file)
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="relative">
      <div className="aspect-[3/4] bg-cream-200 rounded-2xl overflow-hidden relative">
        {photo ? (
          <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-ink-300">
            <span className="text-4xl mb-2">📷</span>
            <p className="text-body-sm">{label}</p>
          </div>
        )}
        
        {canUpload && !photo && (
          <label className="absolute inset-0 flex items-center justify-center bg-forest/20 hover:bg-forest/30 transition-colors cursor-pointer">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              {uploading ? (
                <div className="w-6 h-6 border-2 border-forest border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-6 h-6 text-forest" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
          </label>
        )}
      </div>
      <p className="text-center text-caption text-ink-400 mt-2">{label}</p>
    </div>
  )
}
