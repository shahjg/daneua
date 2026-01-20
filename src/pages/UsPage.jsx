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
  { id: 'miss_you', label: 'I miss you', gradient: 'from-rose-100 to-rose-200' },
  { id: 'need_encouragement', label: 'Need a boost', gradient: 'from-gold-100 to-gold-200' },
  { id: 'stressed', label: 'Stressed', gradient: 'from-cream-200 to-cream-300' },
  { id: 'anxious', label: 'Anxious', gradient: 'from-forest-50 to-forest-100' },
  { id: 'happy', label: 'So happy', gradient: 'from-gold-100 to-rose-100' },
  { id: 'loved', label: 'Feeling loved', gradient: 'from-rose-100 to-gold-100' },
]

async function getVoiceNotes() {
  const { data, error } = await supabase.from('voice_notes').select('*').order('created_at', { ascending: false }).limit(20)
  if (error) return []
  return data || []
}

async function saveVoiceNote(fromUser, audioUrl) {
  const { data, error } = await supabase.from('voice_notes').insert({ from_user: fromUser, audio_url: audioUrl }).select().single()
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
  const [toast, setToast] = useState(null)

  const theirName = user?.role === 'shah' ? 'Dane' : 'Shahjahan'

  useEffect(() => { fetchData() }, [])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 4000)
  }

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
      setMoodMessage(message?.content || `${theirName} loves you so much`)
    } catch (error) {
      setMoodMessage(`${theirName} loves you so much`)
    }
  }

  const handleAddLetter = async (title, content) => {
    try {
      const newLetter = await addLoveLetter(user.role, title, content)
      setLetters(prev => [newLetter, ...prev])
      setShowWriteLetter(false)
      showToast('Letter sent!', 'success')
    } catch (error) {
      showToast('Could not save letter', 'error')
    }
  }

  const handleVoiceNoteSent = (newNote) => {
    setVoiceNotes(prev => [newNote, ...prev])
    showToast('Voice note sent!', 'success')
  }

  const handlePhotoUpload = async (file) => {
    try {
      const ext = file.name?.split('.').pop() || 'jpg'
      const fileName = `moments/${user.role}/${Date.now()}.${ext}`
      
      const { error } = await supabase.storage.from('photos').upload(fileName, file, { contentType: file.type || 'image/jpeg', upsert: true })
      
      if (error) throw new Error(error.message)

      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName)
      const newMoment = await addMoment(user.role, urlData.publicUrl)
      setTodaysMoments(prev => [...prev, newMoment])
      setMomentsHistory(prev => [newMoment, ...prev])
      
      showToast('Photo uploaded!', 'success')
    } catch (error) {
      console.error('Upload error:', error)
      showToast('Could not upload. Make sure photos bucket exists in Supabase and is public.', 'error')
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
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-lg ${toast.type === 'error' ? 'bg-rose-500 text-white' : toast.type === 'success' ? 'bg-green-500 text-white' : 'bg-forest text-cream-100'}`}>
          <p className="text-body-sm text-center">{toast.message}</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-rose-200 via-gold-100 to-rose-100 px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-display-sm text-forest mb-2">Us</h1>
          <p className="text-body text-forest-600">Our little corner</p>
        </div>
      </div>

      <div className="bg-cream px-4 py-4 sticky top-0 z-20 border-b border-cream-300">
        <div className="max-w-lg mx-auto flex justify-center gap-1 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2.5 rounded-full text-body-sm font-medium transition-all ${activeTab === tab.id ? 'bg-forest text-cream-100' : 'bg-cream-200 text-ink-500'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-cream min-h-[60vh]">
        {activeTab === 'feel' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <p className="text-body text-ink-500 text-center mb-6">How are you feeling?</p>
              <div className="grid grid-cols-2 gap-3">
                {moods.map((mood) => (
                  <button key={mood.id} onClick={() => handleMoodSelect(mood)} className={`bg-gradient-to-br ${mood.gradient} rounded-2xl p-5 text-left shadow-soft`}>
                    <p className="font-serif text-title-sm text-forest">{mood.label}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'voice' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <VoiceNoteRecorder user={user} theirName={theirName} onSent={handleVoiceNoteSent} showToast={showToast} />
              {voiceNotes.length > 0 && (
                <div className="mt-8">
                  <p className="text-body-sm text-ink-400 mb-4">Previous Notes</p>
                  <div className="space-y-3">
                    {voiceNotes.map((note) => (
                      <div key={note.id} className="bg-white rounded-2xl p-4 shadow-soft">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-body-sm font-medium text-forest">{note.from_user === user?.role ? 'You' : theirName}</p>
                          <p className="text-caption text-ink-300">{new Date(note.created_at).toLocaleDateString()}</p>
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

        {activeTab === 'letters' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <button onClick={() => setShowWriteLetter(true)} className="w-full mb-6 py-5 border-2 border-dashed border-rose-300 rounded-2xl text-rose-500 font-medium">
                Write a letter
              </button>
              {letters.length > 0 ? (
                <div className="space-y-4">
                  {letters.map((letter) => <LetterCard key={letter.id} letter={letter} currentUser={user?.role} />)}
                </div>
              ) : (
                <p className="text-center text-ink-400 py-12">No letters yet</p>
              )}
            </div>
          </div>
        )}

        {activeTab === 'photo' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <p className="text-center text-body text-ink-500 mb-6">Share a photo from your day</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                <PhotoSlot label="Shahjahan" photo={todaysMoments.find(m => m.user_role === 'shah')} canUpload={user?.role === 'shah'} onUpload={handlePhotoUpload} />
                <PhotoSlot label="Dane" photo={todaysMoments.find(m => m.user_role === 'dane')} canUpload={user?.role === 'dane'} onUpload={handlePhotoUpload} />
              </div>
              {momentsHistory.length > 0 && (
                <div>
                  <p className="text-body-sm text-ink-400 mb-4">Recent Memories</p>
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

      {selectedMood && (
        <div className="fixed inset-0 bg-forest-900/50 z-50 flex items-center justify-center p-6" onClick={() => setSelectedMood(null)}>
          <div className={`bg-gradient-to-br ${selectedMood.gradient} rounded-3xl p-8 w-full max-w-sm text-center shadow-elevated`} onClick={(e) => e.stopPropagation()}>
            <p className="font-serif text-title text-forest mb-6">{moodMessage}</p>
            <button onClick={() => setSelectedMood(null)} className="bg-forest text-cream-100 px-6 py-3 rounded-xl font-medium">I needed that</button>
          </div>
        </div>
      )}

      {showWriteLetter && <WriteLetterModal user={user} onClose={() => setShowWriteLetter(false)} onSubmit={handleAddLetter} />}
    </div>
  )
}

function VoiceNoteRecorder({ user, theirName, onSent, showToast }) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [sending, setSending] = useState(false)
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
    setRecordingTime(0)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      let options = {}
      const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', '']
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
        const blob = new Blob(chunksRef.current, { type: mediaRecorderRef.current.mimeType || 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        streamRef.current?.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorderRef.current.start(1000)
      setIsRecording(true)
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000)
    } catch (err) {
      showToast('Microphone access is required', 'error')
    }
  }

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
    setIsRecording(false)
  }

  const cancelRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioBlob(null)
    setAudioUrl(null)
    setRecordingTime(0)
  }

  const sendVoiceNote = async () => {
    if (!audioBlob) return
    setSending(true)
    try {
      const fileName = `${user.role}_${Date.now()}.webm`
      const { error: uploadError } = await supabase.storage.from('audio').upload(fileName, audioBlob, { contentType: audioBlob.type })
      
      if (uploadError) throw new Error(uploadError.message)

      const { data: urlData } = supabase.storage.from('audio').getPublicUrl(fileName)
      const newNote = await saveVoiceNote(user.role, urlData.publicUrl)
      
      onSent(newNote)
      cancelRecording()
    } catch (err) {
      showToast('Could not send. Make sure audio bucket exists in Supabase and is public.', 'error')
    }
    setSending(false)
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  return (
    <div className="bg-white rounded-3xl p-6 shadow-card">
      <h2 className="font-serif text-title text-forest mb-4 text-center">Voice Note</h2>
      {!audioBlob ? (
        <div className="text-center">
          <button onClick={isRecording ? stopRecording : startRecording} className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 transition-all ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-forest'}`}>
            <span className="text-white text-3xl">{isRecording ? 'Stop' : 'Rec'}</span>
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
            <button onClick={cancelRecording} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
            <button onClick={sendVoiceNote} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl" disabled={sending}>
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
    <div className="fixed inset-0 bg-forest-900/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream w-full max-w-md rounded-3xl shadow-elevated overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 bg-rose-100">
          <h2 className="font-serif text-title text-forest">Write a Letter</h2>
          <button onClick={onClose} className="p-2 text-forest rounded-full">X</button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto p-5">
          <form id="letter-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Title (optional)</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-4 py-3 border border-cream-300 rounded-xl" placeholder="My dearest..." />
            </div>
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Your letter</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} className="w-full px-4 py-3 border border-cream-300 rounded-xl min-h-[150px] resize-none" placeholder="Write from your heart..." required />
            </div>
          </form>
        </div>
        <div className="p-5 bg-cream border-t border-cream-300">
          <button type="submit" form="letter-form" className="w-full py-4 bg-rose-500 text-white rounded-2xl font-semibold" disabled={loading || !content.trim()}>
            {loading ? 'Sending...' : 'Send Letter'}
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
    <div className="bg-white rounded-2xl p-6 shadow-soft cursor-pointer" onClick={() => setExpanded(!expanded)}>
      <div className="flex items-start justify-between mb-3">
        <div>
          {letter.title && <h3 className="font-serif text-title-sm text-forest">{letter.title}</h3>}
          <p className="text-caption text-ink-400">From {senderName} - {new Date(letter.created_at).toLocaleDateString()}</p>
        </div>
      </div>
      <p className={`text-body text-ink-600 whitespace-pre-wrap ${!expanded && 'line-clamp-3'}`}>{letter.content}</p>
      {letter.content.length > 150 && <p className="text-body-sm text-forest mt-2 font-medium">{expanded ? 'Tap to collapse' : 'Tap to read more...'}</p>}
    </div>
  )
}

function PhotoSlot({ label, photo, canUpload, onUpload }) {
  const cameraInputRef = useRef(null)
  const [uploading, setUploading] = useState(false)

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setUploading(true)
    try {
      const img = new Image()
      img.src = URL.createObjectURL(file)
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject })
      
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)
      
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9))
      const processedFile = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' })
      
      URL.revokeObjectURL(img.src)
      await onUpload(processedFile)
    } catch (err) {
      await onUpload(file)
    }
    setUploading(false)
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  return (
    <div className="relative">
      <div className="aspect-square rounded-2xl overflow-hidden bg-cream-200 shadow-soft">
        {photo ? (
          <img src={photo.photo_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-ink-300">
            <span className="text-4xl mb-2">+</span>
            <p className="text-body-sm">{label}</p>
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-forest/50 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-cream-100 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      {canUpload && !photo && (
        <button onClick={() => cameraInputRef.current?.click()} className="absolute inset-0 w-full h-full" />
      )}
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
      <p className="text-center text-caption text-ink-400 mt-2">{label}</p>
    </div>
  )
}
