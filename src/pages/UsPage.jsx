import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

const MOODS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '🥰', label: 'Loved' },
  { emoji: '😌', label: 'Peaceful' },
  { emoji: '🤗', label: 'Grateful' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '🤒', label: 'Sick' },
  { emoji: '😰', label: 'Anxious' },
  { emoji: '🥳', label: 'Excited' }
]

export default function UsPage() {
  const { user, supabase, getPartner } = useAuth()
  const partner = getPartner()
  const [tab, setTab] = useState('mood')
  const [toast, setToast] = useState(null)
  
  // Mood State
  const [myMood, setMyMood] = useState(null)
  const [partnerMood, setPartnerMood] = useState(null)
  
  // Voice Notes State
  const [voiceNotes, setVoiceNotes] = useState([])
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])
  
  // Letters State
  const [letters, setLetters] = useState([])
  const [showWriteLetter, setShowWriteLetter] = useState(false)
  const [letterContent, setLetterContent] = useState('')
  const [selectedLetter, setSelectedLetter] = useState(null)
  
  // Photo State
  const [todayPhoto, setTodayPhoto] = useState(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = async () => {
    if (!supabase) return
    const today = new Date().toISOString().split('T')[0]
    
    // Load moods
    const { data: moods } = await supabase.from('moods').select('*').eq('date', today)
    if (moods) {
      const mine = moods.find(m => m.user_id === user.id)
      const theirs = moods.find(m => m.user_id === partner?.id)
      if (mine) setMyMood(mine.mood)
      if (theirs) setPartnerMood(theirs.mood)
    }
    
    // Load voice notes
    const { data: notes } = await supabase.from('voice_notes').select('*').order('created_at', { ascending: false }).limit(20)
    if (notes) setVoiceNotes(notes)
    
    // Load letters
    const { data: ltrs } = await supabase.from('love_letters').select('*').order('created_at', { ascending: false })
    if (ltrs) setLetters(ltrs)
    
    // Load today's photo
    const { data: photos } = await supabase.from('daily_photos').select('*').eq('date', today).limit(1)
    if (photos && photos.length > 0) setTodayPhoto(photos[0])
  }

  const saveMood = async (mood) => {
    if (!supabase) return
    const today = new Date().toISOString().split('T')[0]
    
    await supabase.from('moods').upsert({
      user_id: user.id,
      date: today,
      mood
    }, { onConflict: 'user_id,date' })
    
    setMyMood(mood)
    showToast('Mood saved!', 'success')
  }

  // Voice Recording
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : {}
      mediaRecorder.current = new MediaRecorder(stream, options)
      audioChunks.current = []
      
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data)
      }
      
      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach(track => track.stop())
        
        // Upload to Supabase
        if (supabase) {
          const fileName = `${user.id}_${Date.now()}.webm`
          const { data, error } = await supabase.storage.from('audio').upload(fileName, blob)
          
          if (error) {
            showToast('Upload failed. Make sure "audio" bucket exists in Supabase Storage.', 'error')
            return
          }
          
          const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(fileName)
          
          await supabase.from('voice_notes').insert({
            user_id: user.id,
            audio_url: publicUrl
          })
          
          showToast('Voice note sent!', 'success')
          loadData()
        }
      }
      
      mediaRecorder.current.start()
      setRecording(true)
    } catch (err) {
      showToast('Could not access microphone', 'error')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop()
      setRecording(false)
    }
  }

  // Letters
  const sendLetter = async () => {
    if (!letterContent.trim() || !supabase) return
    
    await supabase.from('love_letters').insert({
      from_user: user.id,
      to_user: partner?.id,
      content: letterContent.trim()
    })
    
    setLetterContent('')
    setShowWriteLetter(false)
    showToast('Letter sent with love 💕', 'success')
    loadData()
  }

  // Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !supabase) return
    
    setUploading(true)
    
    try {
      // Process image to fix orientation
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = async () => {
        // Resize if too large
        const maxSize = 1200
        let { width, height } = img
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize
            width = maxSize
          } else {
            width = (width / height) * maxSize
            height = maxSize
          }
        }
        
        canvas.width = width
        canvas.height = height
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob(async (blob) => {
          const fileName = `${user.id}_${Date.now()}.jpg`
          const { error: uploadError } = await supabase.storage.from('photos').upload(fileName, blob)
          
          if (uploadError) {
            showToast('Upload failed. Make sure "photos" bucket exists in Supabase Storage.', 'error')
            setUploading(false)
            return
          }
          
          const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName)
          const today = new Date().toISOString().split('T')[0]
          
          await supabase.from('daily_photos').upsert({
            date: today,
            photo_url: publicUrl,
            uploaded_by: user.id
          }, { onConflict: 'date' })
          
          showToast('Photo uploaded!', 'success')
          loadData()
          setUploading(false)
        }, 'image/jpeg', 0.85)
      }
      
      img.src = URL.createObjectURL(file)
    } catch (err) {
      showToast('Upload failed', 'error')
      setUploading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-card ${toast.type === 'success' ? 'bg-forest text-cream-100' : toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-ink-700 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="p-6">
        <h1 className="font-serif text-display-sm text-forest mb-2">Us</h1>
        <p className="text-body text-ink-500 mb-6">Our little corner</p>

        {/* Tabs */}
        <div className="flex gap-2 bg-cream-200 p-1 rounded-xl mb-6 overflow-x-auto hide-scrollbar">
          {['mood', 'voice', 'letters', 'photo'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 px-3 rounded-lg text-body-sm font-medium transition-colors whitespace-nowrap ${tab === t ? 'bg-white text-forest shadow-soft' : 'text-ink-500'}`}
            >
              {t === 'mood' ? '😊 Mood' : t === 'voice' ? '🎤 Voice' : t === 'letters' ? '💌 Letters' : '📸 Photo'}
            </button>
          ))}
        </div>

        {/* MOOD TAB */}
        {tab === 'mood' && (
          <div className="space-y-6 pb-24">
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h3 className="font-serif text-title-sm text-forest mb-4">How are you feeling?</h3>
              <div className="grid grid-cols-5 gap-3">
                {MOODS.map(mood => (
                  <button
                    key={mood.label}
                    onClick={() => saveMood(mood.label)}
                    className={`flex flex-col items-center p-3 rounded-xl transition-all ${myMood === mood.label ? 'bg-forest text-cream-100 scale-105' : 'bg-cream-50 hover:bg-cream-100'}`}
                  >
                    <span className="text-2xl mb-1">{mood.emoji}</span>
                    <span className="text-caption">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Partner's Mood */}
            <div className="bg-rose-50 rounded-2xl p-6">
              <h3 className="font-serif text-title-sm text-rose-600 mb-2">{partner?.name}'s Mood</h3>
              {partnerMood ? (
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{MOODS.find(m => m.label === partnerMood)?.emoji}</span>
                  <span className="text-body text-ink-600">{partnerMood}</span>
                </div>
              ) : (
                <p className="text-body-sm text-ink-400">Waiting for {partner?.name} to share their mood...</p>
              )}
            </div>
          </div>
        )}

        {/* VOICE TAB */}
        {tab === 'voice' && (
          <div className="space-y-6 pb-24">
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h3 className="font-serif text-title-sm text-forest mb-4">Send a Voice Note</h3>
              
              <div className="flex flex-col items-center">
                {!recording ? (
                  <button
                    onClick={startRecording}
                    className="w-20 h-20 bg-forest rounded-full flex items-center justify-center text-3xl text-cream-100 hover:bg-forest-light transition-colors"
                  >
                    🎤
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="w-20 h-20 bg-rose-500 rounded-full flex items-center justify-center text-3xl text-white animate-pulse"
                  >
                    ⏹
                  </button>
                )}
                <p className="text-body-sm text-ink-400 mt-3">
                  {recording ? 'Recording... Tap to stop' : 'Tap to record'}
                </p>
              </div>

              {audioUrl && (
                <div className="mt-4">
                  <audio controls src={audioUrl} className="w-full" />
                </div>
              )}
            </div>

            {/* Voice Notes List */}
            <div>
              <h3 className="font-serif text-title-sm text-forest mb-3">Recent Voice Notes</h3>
              <div className="space-y-3">
                {voiceNotes.map(note => (
                  <div key={note.id} className="bg-white rounded-xl p-4 shadow-soft">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-caption font-medium ${note.user_id === user.id ? 'text-forest' : 'text-rose-500'}`}>
                        {note.user_id === user.id ? 'You' : partner?.name}
                      </span>
                      <span className="text-caption text-ink-400">
                        {new Date(note.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <audio controls src={note.audio_url} className="w-full h-10" />
                  </div>
                ))}
                
                {voiceNotes.length === 0 && (
                  <p className="text-center text-ink-400 py-8">No voice notes yet. Record one!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LETTERS TAB */}
        {tab === 'letters' && (
          <div className="space-y-6 pb-24">
            <button
              onClick={() => setShowWriteLetter(true)}
              className="w-full bg-rose-500 text-white py-4 rounded-xl font-medium"
            >
              💌 Write a Letter
            </button>

            <div className="space-y-4">
              {letters.map(letter => (
                <button
                  key={letter.id}
                  onClick={() => setSelectedLetter(letter)}
                  className="w-full bg-white rounded-2xl p-5 shadow-soft text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-caption font-medium ${letter.from_user === user.id ? 'text-forest' : 'text-rose-500'}`}>
                      {letter.from_user === user.id ? 'You' : partner?.name}
                    </span>
                    <span className="text-caption text-ink-400">→</span>
                    <span className={`text-caption font-medium ${letter.to_user === user.id ? 'text-forest' : 'text-rose-500'}`}>
                      {letter.to_user === user.id ? 'You' : partner?.name}
                    </span>
                  </div>
                  <p className="text-body text-ink-600 line-clamp-2">{letter.content}</p>
                  <p className="text-caption text-ink-400 mt-2">
                    {new Date(letter.created_at).toLocaleDateString()}
                  </p>
                </button>
              ))}
              
              {letters.length === 0 && (
                <p className="text-center text-ink-400 py-8">No letters yet. Write one!</p>
              )}
            </div>
          </div>
        )}

        {/* PHOTO TAB */}
        {tab === 'photo' && (
          <div className="pb-24">
            <div className="bg-white rounded-2xl p-6 shadow-soft">
              <h3 className="font-serif text-title-sm text-forest mb-4">Photo of the Day</h3>
              
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="aspect-square rounded-2xl bg-cream-50 overflow-hidden cursor-pointer relative"
              >
                {todayPhoto ? (
                  <img src={todayPhoto.photo_url} alt="Today's photo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-ink-300">
                    <span className="text-5xl mb-3">📸</span>
                    <p className="text-body">Tap to add today's photo</p>
                  </div>
                )}
                
                {uploading && (
                  <div className="absolute inset-0 bg-forest/50 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-cream-100 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              
              {todayPhoto && (
                <p className="text-caption text-ink-400 text-center mt-3">
                  Uploaded by {todayPhoto.uploaded_by === user.id ? 'you' : partner?.name}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Write Letter Modal */}
      {showWriteLetter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[80vh] flex flex-col">
            <h3 className="font-serif text-title text-forest mb-4">Write to {partner?.name}</h3>
            <textarea
              value={letterContent}
              onChange={(e) => setLetterContent(e.target.value)}
              placeholder="Pour your heart out..."
              className="flex-1 p-4 bg-cream-50 rounded-xl text-body resize-none focus:outline-none focus:ring-2 focus:ring-rose-200 min-h-[200px]"
            />
            <div className="flex gap-3 mt-4">
              <button onClick={() => setShowWriteLetter(false)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={sendLetter} className="flex-1 py-3 bg-rose-500 text-white rounded-xl">Send 💕</button>
            </div>
          </div>
        </div>
      )}

      {/* View Letter Modal */}
      {selectedLetter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[80vh] overflow-y-auto">
            <div className="flex items-center gap-2 mb-4">
              <span className={`text-body-sm font-medium ${selectedLetter.from_user === user.id ? 'text-forest' : 'text-rose-500'}`}>
                From {selectedLetter.from_user === user.id ? 'You' : partner?.name}
              </span>
              <span className="text-caption text-ink-400">
                {new Date(selectedLetter.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-body text-ink-600 whitespace-pre-wrap">{selectedLetter.content}</p>
            <button onClick={() => setSelectedLetter(null)} className="w-full mt-6 py-3 bg-cream-200 rounded-xl text-ink-600">Close</button>
          </div>
        </div>
      )}
    </div>
  )
}
