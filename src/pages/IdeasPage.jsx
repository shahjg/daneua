import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// Ideas types for post-it style
const ideaColors = [
  { id: 'yellow', bg: 'bg-yellow-100', border: 'border-yellow-300' },
  { id: 'pink', bg: 'bg-rose-100', border: 'border-rose-300' },
  { id: 'blue', bg: 'bg-blue-100', border: 'border-blue-300' },
  { id: 'green', bg: 'bg-emerald-100', border: 'border-emerald-300' },
  { id: 'purple', bg: 'bg-purple-100', border: 'border-purple-300' },
]

const categories = [
  { id: 'general', label: 'General', emoji: '💭' },
  { id: 'travel', label: 'Travel', emoji: '✈️' },
  { id: 'home', label: 'Home', emoji: '🏠' },
  { id: 'date', label: 'Date Ideas', emoji: '💕' },
  { id: 'bucket', label: 'Bucket List', emoji: '🌟' },
  { id: 'food', label: 'Food', emoji: '🍽️' },
  { id: 'gift', label: 'Gift Ideas', emoji: '🎁' },
]

export default function IdeasPage() {
  const { user } = useAuth()
  const [ideas, setIdeas] = useState([])
  const [filter, setFilter] = useState('all')
  const [showAddIdea, setShowAddIdea] = useState(false)
  const [showVoiceNote, setShowVoiceNote] = useState(false)
  const [partnerTyping, setPartnerTyping] = useState(false)
  const [loading, setLoading] = useState(true)

  const theirName = user?.role === 'shah' ? 'Dane' : 'Shahjahan'

  useEffect(() => {
    fetchIdeas()
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel('ideas')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shared_ideas' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setIdeas(prev => [payload.new, ...prev])
        } else if (payload.eventType === 'DELETE') {
          setIdeas(prev => prev.filter(i => i.id !== payload.old.id))
        } else if (payload.eventType === 'UPDATE') {
          setIdeas(prev => prev.map(i => i.id === payload.new.id ? payload.new : i))
        }
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user !== user?.role) {
          setPartnerTyping(true)
          setTimeout(() => setPartnerTyping(false), 3000)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const fetchIdeas = async () => {
    try {
      let query = supabase
        .from('shared_ideas')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
      
      if (filter !== 'all') {
        query = query.eq('category', filter)
      }

      const { data, error } = await query
      if (error) throw error
      setIdeas(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchIdeas()
  }, [filter])

  const handleAddIdea = async (ideaData) => {
    try {
      const { data, error } = await supabase
        .from('shared_ideas')
        .insert({ ...ideaData, added_by: user.role })
        .select()
        .single()
      
      if (error) throw error
      setIdeas(prev => [data, ...prev])
      setShowAddIdea(false)
    } catch (error) {
      console.error('Error:', error)
      alert('Could not add idea')
    }
  }

  const handleDeleteIdea = async (id) => {
    if (!confirm('Delete this idea?')) return
    try {
      await supabase.from('shared_ideas').delete().eq('id', id)
      setIdeas(prev => prev.filter(i => i.id !== id))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleTogglePin = async (id, currentPinned) => {
    try {
      await supabase
        .from('shared_ideas')
        .update({ is_pinned: !currentPinned })
        .eq('id', id)
      
      setIdeas(prev => prev.map(i => 
        i.id === id ? { ...i, is_pinned: !currentPinned } : i
      ))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleToggleComplete = async (id, currentComplete) => {
    try {
      await supabase
        .from('shared_ideas')
        .update({ is_completed: !currentComplete })
        .eq('id', id)
      
      setIdeas(prev => prev.map(i => 
        i.id === id ? { ...i, is_completed: !currentComplete } : i
      ))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-display-sm text-forest mb-2">Our Ideas</h1>
          <p className="text-body text-forest-600">Dream together, plan together 💭</p>
          
          {partnerTyping && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/80 rounded-full px-4 py-2 text-body-sm text-forest">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-forest rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-forest rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-forest rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              {theirName} is adding an idea...
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-cream px-6 py-4 border-b border-cream-300">
        <div className="max-w-lg mx-auto flex gap-3">
          <button
            onClick={() => setShowAddIdea(true)}
            className="flex-1 py-3 bg-forest text-cream-100 rounded-2xl font-medium flex items-center justify-center gap-2"
          >
            <span>✏️</span> Quick Note
          </button>
          <button
            onClick={() => setShowVoiceNote(true)}
            className="flex-1 py-3 bg-rose-100 text-rose-600 rounded-2xl font-medium flex items-center justify-center gap-2"
          >
            <span>🎤</span> Voice Idea
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="bg-cream px-4 py-3 sticky top-0 z-20 border-b border-cream-200 overflow-x-auto">
        <div className="max-w-lg mx-auto flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-body-sm font-medium whitespace-nowrap transition-all ${
              filter === 'all' ? 'bg-forest text-cream-100' : 'bg-cream-200 text-ink-500'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setFilter(cat.id)}
              className={`px-4 py-2 rounded-full text-body-sm font-medium whitespace-nowrap transition-all ${
                filter === cat.id ? 'bg-forest text-cream-100' : 'bg-cream-200 text-ink-500'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ideas Grid */}
      <div className="bg-cream min-h-[60vh] px-6 py-6">
        <div className="max-w-lg mx-auto">
          {loading ? (
            <p className="text-center py-12 text-ink-400">Loading...</p>
          ) : ideas.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {ideas.map((idea) => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  currentUser={user?.role}
                  theirName={theirName}
                  onDelete={handleDeleteIdea}
                  onTogglePin={handleTogglePin}
                  onToggleComplete={handleToggleComplete}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <span className="text-6xl mb-4 block">💭</span>
              <p className="text-body text-ink-400">No ideas yet</p>
              <p className="text-body-sm text-ink-300 mt-1">Add your first one!</p>
              <button
                onClick={() => setShowAddIdea(true)}
                className="mt-4 btn-primary"
              >
                + Add Idea
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Idea Modal */}
      {showAddIdea && (
        <AddIdeaModal
          user={user}
          onClose={() => setShowAddIdea(false)}
          onAdd={handleAddIdea}
        />
      )}

      {/* Voice Note Modal */}
      {showVoiceNote && (
        <VoiceIdeaModal
          user={user}
          theirName={theirName}
          onClose={() => setShowVoiceNote(false)}
          onSave={handleAddIdea}
        />
      )}
    </div>
  )
}

function IdeaCard({ idea, currentUser, theirName, onDelete, onTogglePin, onToggleComplete }) {
  const [expanded, setExpanded] = useState(false)
  const colorStyle = ideaColors.find(c => c.id === idea.color) || ideaColors[0]
  const category = categories.find(c => c.id === idea.category)
  const isFromMe = idea.added_by === currentUser

  return (
    <div
      className={`${colorStyle.bg} rounded-2xl p-4 shadow-soft relative group transition-all ${
        idea.is_completed ? 'opacity-60' : ''
      } ${idea.is_pinned ? 'ring-2 ring-gold' : ''}`}
      style={{
        transform: `rotate(${(idea.id?.charCodeAt(0) || 0) % 3 - 1}deg)`,
      }}
    >
      {/* Actions */}
      <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onTogglePin(idea.id, idea.is_pinned)}
          className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm ${
            idea.is_pinned ? 'bg-gold text-white' : 'bg-white text-gold-600'
          }`}
        >
          📌
        </button>
        <button
          onClick={() => onDelete(idea.id)}
          className="w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm text-rose-500"
        >
          ×
        </button>
      </div>

      {/* Pin indicator */}
      {idea.is_pinned && (
        <div className="absolute -top-1 -left-1 text-lg">📌</div>
      )}

      {/* Category */}
      {category && (
        <div className="text-xs text-ink-400 mb-2">
          {category.emoji} {category.label}
        </div>
      )}

      {/* Content */}
      <div onClick={() => setExpanded(!expanded)} className="cursor-pointer">
        {idea.title && (
          <h3 className={`font-medium text-forest mb-1 ${idea.is_completed ? 'line-through' : ''}`}>
            {idea.title}
          </h3>
        )}
        
        <p className={`text-body-sm text-ink-600 ${!expanded && 'line-clamp-4'} ${idea.is_completed ? 'line-through' : ''}`}>
          {idea.content}
        </p>

        {/* Image */}
        {idea.image_url && (
          <div className="mt-3 rounded-xl overflow-hidden">
            <img src={idea.image_url} alt="" className="w-full h-32 object-cover" />
          </div>
        )}

        {/* Audio */}
        {idea.audio_url && (
          <div className="mt-3">
            <audio src={idea.audio_url} controls className="w-full h-8" />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-black/10 flex items-center justify-between">
        <p className="text-caption text-ink-400">
          {isFromMe ? 'You' : theirName}
        </p>
        <button
          onClick={() => onToggleComplete(idea.id, idea.is_completed)}
          className={`text-lg ${idea.is_completed ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
        >
          ✓
        </button>
      </div>
    </div>
  )
}

function AddIdeaModal({ user, onClose, onAdd }) {
  const [form, setForm] = useState({
    title: '',
    content: '',
    category: 'general',
    color: 'yellow',
  })
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef(null)

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const fileName = `ideas/${user.role}/${Date.now()}.${file.name.split('.').pop()}`
      const { error } = await supabase.storage
        .from('photos')
        .upload(fileName, file, { contentType: file.type, upsert: true })
      
      if (error) throw error

      const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName)
      setImage(urlData.publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Could not upload image')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.content.trim()) return
    
    setLoading(true)
    
    // Broadcast typing indicator
    await supabase.channel('ideas').send({
      type: 'broadcast',
      event: 'typing',
      payload: { user: user.role }
    })

    await onAdd({
      ...form,
      image_url: image,
    })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream w-full max-w-md rounded-3xl shadow-elevated overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-100 to-pink-100">
          <h2 className="font-serif text-title text-forest">Add Idea</h2>
          <button onClick={onClose} className="p-2 text-forest hover:text-forest-700 rounded-full">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-5">
          <form id="idea-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Title (optional)</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                className="input"
                placeholder="Quick idea title..."
              />
            </div>

            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">What's on your mind? *</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm(p => ({ ...p, content: e.target.value }))}
                className="input min-h-[100px] resize-none"
                placeholder="Write your idea..."
                required
              />
            </div>

            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-2">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, category: cat.id }))}
                    className={`px-3 py-1.5 rounded-full text-body-sm transition-all ${
                      form.category === cat.id 
                        ? 'bg-forest text-cream-100' 
                        : 'bg-cream-200 text-ink-500'
                    }`}
                  >
                    {cat.emoji} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-2">Color</label>
              <div className="flex gap-2">
                {ideaColors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, color: color.id }))}
                    className={`w-10 h-10 rounded-xl ${color.bg} ${color.border} border-2 transition-all ${
                      form.color === color.id ? 'ring-2 ring-forest ring-offset-2' : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Image */}
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-2">Add Photo</label>
              {image ? (
                <div className="relative">
                  <img src={image} alt="" className="w-full h-32 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-sm text-rose-500"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-4 border-2 border-dashed border-cream-400 rounded-xl text-ink-400 hover:border-forest hover:text-forest transition-all"
                >
                  📷 Add Photo
                </button>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            </div>
          </form>
        </div>

        <div className="p-5 bg-cream border-t border-cream-300">
          <button
            type="submit"
            form="idea-form"
            className="w-full py-4 bg-forest text-cream-100 rounded-2xl font-semibold text-lg shadow-lg"
            disabled={loading}
          >
            {loading ? 'Adding...' : '💭 Add Idea'}
          </button>
        </div>
      </div>
    </div>
  )
}

function VoiceIdeaModal({ user, theirName, onClose, onSave }) {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [saving, setSaving] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [category, setCategory] = useState('general')
  
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
      alert('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const handleSave = async () => {
    if (!audioBlob) return
    setSaving(true)

    try {
      const ext = audioBlob.type.includes('mp4') ? 'mp4' : 'webm'
      const fileName = `ideas/${user.role}/${Date.now()}.${ext}`
      
      const { error } = await supabase.storage
        .from('audio')
        .upload(fileName, audioBlob, { contentType: audioBlob.type, upsert: true })
      
      if (error) throw error

      const { data: urlData } = supabase.storage.from('audio').getPublicUrl(fileName)
      
      await onSave({
        content: '🎤 Voice idea',
        audio_url: urlData.publicUrl,
        category,
        color: 'pink',
      })
      
      onClose()
    } catch (error) {
      console.error('Error:', error)
      alert('Could not save voice idea')
    }
    setSaving(false)
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  return (
    <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream w-full max-w-sm rounded-3xl shadow-elevated p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-serif text-title text-forest text-center mb-6">Voice Idea</h2>

        <div className="text-center">
          {!audioUrl ? (
            <>
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto transition-all shadow-lg ${
                  isRecording ? 'bg-rose-500 animate-pulse' : 'bg-forest'
                }`}
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
              {isRecording && <p className="text-title text-rose-500 font-mono mt-4">{formatTime(recordingTime)}</p>}
              <p className="text-body-sm text-ink-400 mt-2">{isRecording ? 'Tap to stop' : 'Tap to record'}</p>
            </>
          ) : (
            <>
              <div className="bg-cream-200 rounded-2xl p-4 mb-4">
                <audio src={audioUrl} controls className="w-full" />
              </div>

              <div className="mb-4">
                <p className="text-body-sm font-medium text-ink-600 mb-2">Category</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {categories.slice(0, 4).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-full text-body-sm ${
                        category === cat.id ? 'bg-forest text-cream-100' : 'bg-cream-200 text-ink-500'
                      }`}
                    >
                      {cat.emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => { setAudioBlob(null); setAudioUrl(null); setRecordingTime(0); }} className="btn-ghost flex-1">
                  Redo
                </button>
                <button onClick={handleSave} className="btn-primary flex-1" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Idea'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
