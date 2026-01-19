import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// Folder structure
const defaultFolders = [
  { id: 'business', name: 'Business', emoji: '💼', color: 'bg-blue-100' },
  { id: 'life', name: 'Life Planning', emoji: '🏠', color: 'bg-green-100' },
  { id: 'creative', name: 'Creative', emoji: '🎨', color: 'bg-purple-100' },
  { id: 'other', name: 'Other', emoji: '📁', color: 'bg-cream-200' },
]

export default function IdeasPage() {
  const { user } = useAuth()
  const [view, setView] = useState('home') // home | folder | document | quicknotes | draw
  const [folders, setFolders] = useState(defaultFolders)
  const [documents, setDocuments] = useState([])
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [quickNotes, setQuickNotes] = useState([])
  const [partnerTyping, setPartnerTyping] = useState(false)
  const [loading, setLoading] = useState(true)

  const theirName = user?.role === 'shah' ? 'Dane' : 'Shahjahan'

  useEffect(() => {
    fetchData()
    
    // Subscribe to realtime
    const channel = supabase
      .channel('ideas-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'idea_documents' }, handleDocChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'quick_notes' }, handleNoteChange)
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload.user !== user?.role && payload.docId === selectedDoc?.id) {
          setPartnerTyping(true)
          setTimeout(() => setPartnerTyping(false), 2000)
        }
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [user, selectedDoc])

  const handleDocChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      setDocuments(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'UPDATE') {
      setDocuments(prev => prev.map(d => d.id === payload.new.id ? payload.new : d))
      if (selectedDoc?.id === payload.new.id) {
        setSelectedDoc(payload.new)
      }
    } else if (payload.eventType === 'DELETE') {
      setDocuments(prev => prev.filter(d => d.id !== payload.old.id))
    }
  }

  const handleNoteChange = (payload) => {
    if (payload.eventType === 'INSERT') {
      setQuickNotes(prev => [payload.new, ...prev])
    } else if (payload.eventType === 'DELETE') {
      setQuickNotes(prev => prev.filter(n => n.id !== payload.old.id))
    }
  }

  const fetchData = async () => {
    try {
      const [docsRes, notesRes] = await Promise.all([
        supabase.from('idea_documents').select('*').order('updated_at', { ascending: false }),
        supabase.from('quick_notes').select('*').order('created_at', { ascending: false }).limit(20)
      ])
      setDocuments(docsRes.data || [])
      setQuickNotes(notesRes.data || [])
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  const createDocument = async (folderId, title) => {
    try {
      const { data, error } = await supabase
        .from('idea_documents')
        .insert({
          folder_id: folderId,
          title: title || 'Untitled',
          content: '',
          created_by: user.role
        })
        .select()
        .single()
      
      if (error) throw error
      setDocuments(prev => [data, ...prev])
      setSelectedDoc(data)
      setView('document')
    } catch (err) {
      console.error(err)
      alert('Could not create document')
    }
  }

  const openFolder = (folder) => {
    setSelectedFolder(folder)
    setView('folder')
  }

  const openDocument = (doc) => {
    setSelectedDoc(doc)
    setView('document')
  }

  const goHome = () => {
    setView('home')
    setSelectedFolder(null)
    setSelectedDoc(null)
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-100 via-purple-50 to-pink-50 px-6 pt-14 pb-8">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between">
            {view !== 'home' && (
              <button onClick={goHome} className="p-2 -ml-2 text-forest">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <div className={view === 'home' ? 'text-center w-full' : ''}>
              <h1 className="font-serif text-display-sm text-forest">
                {view === 'home' ? 'Ideas' : view === 'folder' ? selectedFolder?.name : view === 'document' ? selectedDoc?.title : view === 'quicknotes' ? 'Quick Notes' : 'Sketch'}
              </h1>
              {view === 'home' && <p className="text-body text-forest-600">Dream together, build together 💭</p>}
            </div>
            {view !== 'home' && <div className="w-10" />}
          </div>
          
          {partnerTyping && (
            <div className="mt-4 flex items-center justify-center gap-2 text-body-sm text-forest-600">
              <span className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-forest rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-forest rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-forest rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              {theirName} is typing...
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="bg-cream min-h-[60vh]">
        {view === 'home' && (
          <HomeView 
            folders={folders}
            documents={documents}
            quickNotes={quickNotes}
            openFolder={openFolder}
            openDocument={openDocument}
            setView={setView}
            user={user}
          />
        )}
        {view === 'folder' && (
          <FolderView
            folder={selectedFolder}
            documents={documents.filter(d => d.folder_id === selectedFolder?.id)}
            createDocument={createDocument}
            openDocument={openDocument}
          />
        )}
        {view === 'document' && (
          <DocumentView
            doc={selectedDoc}
            user={user}
            theirName={theirName}
            onUpdate={(updated) => setSelectedDoc(updated)}
          />
        )}
        {view === 'quicknotes' && (
          <QuickNotesView
            notes={quickNotes}
            user={user}
            onBack={goHome}
          />
        )}
        {view === 'draw' && (
          <DrawView onBack={goHome} user={user} />
        )}
      </div>
    </div>
  )
}

// ============================================
// HOME VIEW
// ============================================

function HomeView({ folders, documents, quickNotes, openFolder, openDocument, setView, user }) {
  const recentDocs = documents.slice(0, 4)

  return (
    <div className="px-6 py-6">
      <div className="max-w-lg mx-auto">
        {/* Quick Actions */}
        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setView('quicknotes')}
            className="flex-1 bg-gold-100 rounded-2xl p-4 text-left"
          >
            <span className="text-2xl mb-2 block">📝</span>
            <p className="font-medium text-forest">Quick Notes</p>
            <p className="text-body-sm text-forest-600">{quickNotes.length} notes</p>
          </button>
          <button
            onClick={() => setView('draw')}
            className="flex-1 bg-purple-100 rounded-2xl p-4 text-left"
          >
            <span className="text-2xl mb-2 block">✏️</span>
            <p className="font-medium text-forest">Sketch</p>
            <p className="text-body-sm text-forest-600">Draw ideas</p>
          </button>
        </div>

        {/* Folders */}
        <h2 className="font-serif text-title-sm text-forest mb-4">Folders</h2>
        <div className="grid grid-cols-2 gap-3 mb-8">
          {folders.map(folder => {
            const count = documents.filter(d => d.folder_id === folder.id).length
            return (
              <button
                key={folder.id}
                onClick={() => openFolder(folder)}
                className={`${folder.color} rounded-2xl p-5 text-left hover:scale-[1.02] transition-transform`}
              >
                <span className="text-3xl mb-2 block">{folder.emoji}</span>
                <p className="font-serif text-title-sm text-forest">{folder.name}</p>
                <p className="text-body-sm text-forest-600">{count} docs</p>
              </button>
            )
          })}
        </div>

        {/* Recent Documents */}
        {recentDocs.length > 0 && (
          <>
            <h2 className="font-serif text-title-sm text-forest mb-4">Recent</h2>
            <div className="space-y-3">
              {recentDocs.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => openDocument(doc)}
                  className="w-full bg-white rounded-xl p-4 text-left shadow-soft hover:shadow-card transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-forest">{doc.title}</p>
                      <p className="text-body-sm text-ink-400">
                        {doc.content?.substring(0, 50) || 'Empty document'}...
                      </p>
                    </div>
                    <span className="text-ink-300">→</span>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ============================================
// FOLDER VIEW
// ============================================

function FolderView({ folder, documents, createDocument, openDocument }) {
  const [showNew, setShowNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  const handleCreate = () => {
    if (newTitle.trim()) {
      createDocument(folder.id, newTitle.trim())
      setNewTitle('')
      setShowNew(false)
    }
  }

  return (
    <div className="px-6 py-6">
      <div className="max-w-lg mx-auto">
        {/* New Document Button */}
        <button
          onClick={() => setShowNew(true)}
          className="w-full mb-6 py-4 border-2 border-dashed border-forest-300 rounded-2xl text-forest hover:border-forest-400 hover:bg-forest-50 transition-all font-medium flex items-center justify-center gap-2"
        >
          <span className="text-xl">+</span> New Document
        </button>

        {/* New Document Form */}
        {showNew && (
          <div className="bg-white rounded-2xl p-4 shadow-card mb-6">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Document title..."
              className="input mb-3"
              autoFocus
            />
            <div className="flex gap-2">
              <button onClick={() => setShowNew(false)} className="btn-ghost flex-1">Cancel</button>
              <button onClick={handleCreate} className="btn-primary flex-1">Create</button>
            </div>
          </div>
        )}

        {/* Documents */}
        {documents.length > 0 ? (
          <div className="space-y-3">
            {documents.map(doc => (
              <button
                key={doc.id}
                onClick={() => openDocument(doc)}
                className="w-full bg-white rounded-xl p-4 text-left shadow-soft hover:shadow-card transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-forest">{doc.title}</p>
                    <p className="text-body-sm text-ink-400">
                      Updated {new Date(doc.updated_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-2xl">📄</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">📁</span>
            <p className="text-body text-ink-400">No documents yet</p>
            <p className="text-body-sm text-ink-300">Create your first one!</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// DOCUMENT VIEW - Real-time collaborative editor
// ============================================

function DocumentView({ doc, user, theirName, onUpdate }) {
  const [content, setContent] = useState(doc?.content || '')
  const [title, setTitle] = useState(doc?.title || '')
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState(null)
  const saveTimeoutRef = useRef(null)

  // Auto-save with debounce
  const saveContent = useCallback(async (newContent, newTitle) => {
    if (!doc) return
    setSaving(true)
    
    try {
      const { data, error } = await supabase
        .from('idea_documents')
        .update({ 
          content: newContent, 
          title: newTitle,
          updated_at: new Date().toISOString(),
          last_edited_by: user.role
        })
        .eq('id', doc.id)
        .select()
        .single()
      
      if (error) throw error
      onUpdate(data)
      setLastSaved(new Date())
    } catch (err) {
      console.error(err)
    }
    setSaving(false)
  }, [doc, user, onUpdate])

  const handleContentChange = (newContent) => {
    setContent(newContent)
    
    // Broadcast typing indicator
    supabase.channel('ideas-realtime').send({
      type: 'broadcast',
      event: 'typing',
      payload: { user: user.role, docId: doc?.id }
    })
    
    // Debounced save
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => saveContent(newContent, title), 1000)
  }

  const handleTitleChange = (newTitle) => {
    setTitle(newTitle)
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => saveContent(content, newTitle), 1000)
  }

  const handleDelete = async () => {
    if (!confirm('Delete this document?')) return
    try {
      await supabase.from('idea_documents').delete().eq('id', doc.id)
      window.history.back()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="px-6 py-4">
      <div className="max-w-lg mx-auto">
        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full text-2xl font-serif text-forest bg-transparent border-none outline-none mb-4 placeholder:text-ink-300"
          placeholder="Document title..."
        />

        {/* Status Bar */}
        <div className="flex items-center justify-between mb-4 text-body-sm text-ink-400">
          <span>
            {saving ? 'Saving...' : lastSaved ? `Saved ${lastSaved.toLocaleTimeString()}` : ''}
          </span>
          <button onClick={handleDelete} className="text-rose-500 hover:text-rose-600">
            Delete
          </button>
        </div>

        {/* Editor */}
        <div className="bg-white rounded-2xl shadow-card min-h-[400px]">
          <textarea
            value={content}
            onChange={(e) => handleContentChange(e.target.value)}
            className="w-full h-full min-h-[400px] p-6 rounded-2xl resize-none border-none outline-none text-body text-ink-600 leading-relaxed"
            placeholder="Start writing your ideas..."
            style={{ fontFamily: 'inherit' }}
          />
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-body-sm text-ink-400">
          <p>Both you and {theirName} can edit this document</p>
        </div>
      </div>
    </div>
  )
}

// ============================================
// QUICK NOTES VIEW
// ============================================

function QuickNotesView({ notes, user, onBack }) {
  const [newNote, setNewNote] = useState('')
  const [adding, setAdding] = useState(false)

  const addNote = async () => {
    if (!newNote.trim()) return
    setAdding(true)
    
    try {
      await supabase.from('quick_notes').insert({
        content: newNote.trim(),
        added_by: user.role
      })
      setNewNote('')
    } catch (err) {
      console.error(err)
      alert('Could not add note')
    }
    setAdding(false)
  }

  const deleteNote = async (id) => {
    try {
      await supabase.from('quick_notes').delete().eq('id', id)
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="px-6 py-6">
      <div className="max-w-lg mx-auto">
        {/* Add Note */}
        <div className="bg-yellow-100 rounded-2xl p-4 mb-6 shadow-soft" style={{ transform: 'rotate(-1deg)' }}>
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Quick thought..."
            className="w-full bg-transparent border-none outline-none resize-none text-forest min-h-[80px]"
          />
          <div className="flex justify-end">
            <button 
              onClick={addNote} 
              disabled={adding || !newNote.trim()}
              className="px-4 py-2 bg-forest text-cream-100 rounded-xl text-body-sm font-medium disabled:opacity-50"
            >
              {adding ? 'Adding...' : '+ Add'}
            </button>
          </div>
        </div>

        {/* Notes List */}
        <div className="space-y-3">
          {notes.map((note, i) => {
            const colors = ['bg-yellow-100', 'bg-pink-100', 'bg-blue-100', 'bg-green-100', 'bg-purple-100']
            const rotations = ['-1deg', '1deg', '-0.5deg', '0.5deg', '0deg']
            return (
              <div
                key={note.id}
                className={`${colors[i % colors.length]} rounded-xl p-4 shadow-soft relative group`}
                style={{ transform: `rotate(${rotations[i % rotations.length]})` }}
              >
                <button
                  onClick={() => deleteNote(note.id)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-sm flex items-center justify-center text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
                <p className="text-body text-forest whitespace-pre-wrap">{note.content}</p>
                <p className="text-caption text-forest-600 mt-2">
                  — {note.added_by === user?.role ? 'You' : note.added_by === 'shah' ? 'Shahjahan' : 'Dane'}
                </p>
              </div>
            )
          })}
        </div>

        {notes.length === 0 && (
          <div className="text-center py-12">
            <span className="text-5xl mb-4 block">📝</span>
            <p className="text-body text-ink-400">No quick notes yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// DRAW VIEW - Simple canvas for sketching
// ============================================

function DrawView({ onBack, user }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#2D5A47')
  const [brushSize, setBrushSize] = useState(4)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FFFDF8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const startDrawing = (e) => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.touches?.[0]?.clientX || e.clientX) - rect.left
    const y = (e.touches?.[0]?.clientY || e.clientY) - rect.top
    
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.strokeStyle = color
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    setIsDrawing(true)
  }

  const draw = (e) => {
    if (!isDrawing) return
    e.preventDefault()
    
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    const x = (e.touches?.[0]?.clientX || e.clientX) - rect.left
    const y = (e.touches?.[0]?.clientY || e.clientY) - rect.top
    
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#FFFDF8'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const colors = ['#2D5A47', '#000000', '#E11D48', '#2563EB', '#7C3AED', '#D97706']

  return (
    <div className="px-6 py-4">
      <div className="max-w-lg mx-auto">
        {/* Tools */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {colors.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-forest' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
          <button onClick={clearCanvas} className="text-body-sm text-ink-400 hover:text-rose-500">
            Clear
          </button>
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-body-sm text-ink-400">Size:</span>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="flex-1"
          />
        </div>

        {/* Canvas */}
        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
          <canvas
            ref={canvasRef}
            width={350}
            height={450}
            className="w-full touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </div>

        <p className="text-center text-body-sm text-ink-400 mt-4">
          Sketch out your ideas ✏️
        </p>
      </div>
    </div>
  )
}
