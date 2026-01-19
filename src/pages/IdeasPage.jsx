import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function IdeasPage() {
  const { user } = useAuth()
  const [view, setView] = useState('home')
  const [folders, setFolders] = useState([])
  const [documents, setDocuments] = useState([])
  const [quickNotes, setQuickNotes] = useState([])
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [newFolderName, setNewFolderName] = useState('')
  const [showAddFolder, setShowAddFolder] = useState(false)

  useEffect(() => {
    fetchFolders()
    fetchQuickNotes()
  }, [])

  const fetchFolders = async () => {
    const { data } = await supabase.from('idea_folders').select('*').order('created_at')
    setFolders(data || [])
  }

  const fetchQuickNotes = async () => {
    const { data } = await supabase.from('quick_notes').select('*').order('created_at', { ascending: false })
    setQuickNotes(data || [])
  }

  const fetchDocuments = async (folderId) => {
    const { data } = await supabase.from('idea_documents').select('*').eq('folder_id', folderId).order('updated_at', { ascending: false })
    setDocuments(data || [])
  }

  const addFolder = async () => {
    if (!newFolderName.trim()) return
    await supabase.from('idea_folders').insert({ name: newFolderName.trim(), created_by: user.role })
    setNewFolderName('')
    setShowAddFolder(false)
    fetchFolders()
  }

  const openFolder = (folder) => {
    setSelectedFolder(folder)
    fetchDocuments(folder.id)
    setView('folder')
  }

  const createDocument = async () => {
    const { data } = await supabase.from('idea_documents').insert({
      folder_id: selectedFolder.id,
      title: 'Untitled',
      content: '',
      created_by: user.role,
      last_edited_by: user.role
    }).select().single()
    if (data) {
      setSelectedDoc(data)
      setView('editor')
    }
  }

  const openDocument = (doc) => {
    setSelectedDoc(doc)
    setView('editor')
  }

  if (view === 'editor' && selectedDoc) {
    return <DocumentEditor doc={selectedDoc} user={user} onBack={() => { setView('folder'); fetchDocuments(selectedFolder.id) }} />
  }

  if (view === 'folder' && selectedFolder) {
    return (
      <div className="min-h-screen pb-28">
        <div className="bg-forest px-6 pt-14 pb-12">
          <div className="max-w-lg mx-auto">
            <button onClick={() => setView('home')} className="text-cream-300 text-body-sm mb-4">← Back</button>
            <h1 className="font-serif text-display-sm text-cream-50">{selectedFolder.name}</h1>
          </div>
        </div>
        <div className="bg-cream px-6 py-8 min-h-[60vh]">
          <div className="max-w-lg mx-auto">
            <button onClick={createDocument} className="w-full bg-forest text-cream-100 rounded-xl p-4 mb-6 font-medium">New Document</button>
            {documents.length === 0 ? (
              <p className="text-center text-ink-400 py-12">No documents yet</p>
            ) : (
              <div className="space-y-3">
                {documents.map(doc => (
                  <button key={doc.id} onClick={() => openDocument(doc)} className="w-full bg-white rounded-xl p-4 shadow-soft text-left">
                    <p className="font-medium text-forest">{doc.title || 'Untitled'}</p>
                    <p className="text-body-sm text-ink-400">{new Date(doc.updated_at).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-28">
      <div className="bg-forest px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-display-sm text-cream-50 mb-2">Ideas</h1>
          <p className="text-body text-cream-300">Our shared space</p>
        </div>
      </div>

      <div className="bg-cream px-6 py-8 min-h-[60vh]">
        <div className="max-w-lg mx-auto">
          {/* Folders */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-serif text-title text-forest">Folders</h2>
              <button onClick={() => setShowAddFolder(true)} className="text-body-sm text-forest font-medium">+ Add Folder</button>
            </div>

            {showAddFolder && (
              <div className="bg-white rounded-xl p-4 shadow-soft mb-4">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  placeholder="Folder name..."
                  className="w-full px-3 py-2 border border-cream-300 rounded-lg mb-3"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button onClick={addFolder} className="flex-1 bg-forest text-cream-100 rounded-lg py-2 text-body-sm">Create</button>
                  <button onClick={() => { setShowAddFolder(false); setNewFolderName('') }} className="flex-1 bg-cream-200 text-ink-500 rounded-lg py-2 text-body-sm">Cancel</button>
                </div>
              </div>
            )}

            {folders.length === 0 ? (
              <p className="text-ink-400 text-center py-8">No folders yet. Create one to get started.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {folders.map(folder => (
                  <button key={folder.id} onClick={() => openFolder(folder)} className="bg-white rounded-xl p-4 shadow-soft text-left">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 mb-2">F</div>
                    <p className="font-medium text-forest">{folder.name}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Notes */}
          <div>
            <h2 className="font-serif text-title text-forest mb-4">Quick Notes</h2>
            <QuickNotesSection notes={quickNotes} user={user} onRefresh={fetchQuickNotes} />
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickNotesSection({ notes, user, onRefresh }) {
  const [newNote, setNewNote] = useState('')

  const addNote = async () => {
    if (!newNote.trim()) return
    await supabase.from('quick_notes').insert({ content: newNote.trim(), added_by: user.role })
    setNewNote('')
    onRefresh()
  }

  const deleteNote = async (id) => {
    await supabase.from('quick_notes').delete().eq('id', id)
    onRefresh()
  }

  return (
    <div>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newNote}
          onChange={e => setNewNote(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addNote()}
          placeholder="Add a quick note..."
          className="flex-1 px-4 py-3 bg-white border border-cream-300 rounded-xl"
        />
        <button onClick={addNote} className="px-4 bg-forest text-cream-100 rounded-xl">Add</button>
      </div>
      <div className="space-y-2">
        {notes.map(note => (
          <div key={note.id} className="bg-white rounded-xl p-4 shadow-soft flex justify-between items-start">
            <div>
              <p className="text-body text-ink-600">{note.content}</p>
              <p className="text-caption text-ink-300 mt-1">by {note.added_by === 'shah' ? 'Shahjahan' : 'Dane'}</p>
            </div>
            <button onClick={() => deleteNote(note.id)} className="text-ink-300 hover:text-rose-500 p-1">x</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function DocumentEditor({ doc, user, onBack }) {
  const [title, setTitle] = useState(doc.title || '')
  const [content, setContent] = useState(doc.content || '')
  const [saving, setSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showSketch, setShowSketch] = useState(false)
  const [sketches, setSketches] = useState(doc.sketches || [])
  const saveTimeoutRef = useRef(null)

  const theirName = user?.role === 'shah' ? 'Dane' : 'Shahjahan'

  useEffect(() => {
    const channel = supabase.channel(`doc-${doc.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'idea_documents', filter: `id=eq.${doc.id}` }, (payload) => {
        if (payload.new.last_edited_by !== user.role) {
          setTitle(payload.new.title || '')
          setContent(payload.new.content || '')
          setSketches(payload.new.sketches || [])
        }
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [doc.id, user.role])

  const saveDocument = async (newTitle, newContent, newSketches) => {
    setSaving(true)
    await supabase.from('idea_documents').update({
      title: newTitle,
      content: newContent,
      sketches: newSketches,
      last_edited_by: user.role,
      updated_at: new Date().toISOString()
    }).eq('id', doc.id)
    setSaving(false)
  }

  const handleTitleChange = (val) => {
    setTitle(val)
    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => saveDocument(val, content, sketches), 500)
  }

  const handleContentChange = (val) => {
    setContent(val)
    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => saveDocument(title, val, sketches), 500)
  }

  const deleteDocument = async () => {
    await supabase.from('idea_documents').delete().eq('id', doc.id)
    onBack()
  }

  const saveSketch = (dataUrl) => {
    const newSketches = [...sketches, { id: Date.now(), dataUrl, createdBy: user.role }]
    setSketches(newSketches)
    setShowSketch(false)
    saveDocument(title, content, newSketches)
  }

  const deleteSketch = (id) => {
    const newSketches = sketches.filter(s => s.id !== id)
    setSketches(newSketches)
    saveDocument(title, content, newSketches)
  }

  return (
    <div className="min-h-screen pb-28">
      <div className="bg-forest px-6 pt-14 pb-6">
        <div className="max-w-lg mx-auto flex justify-between items-center">
          <button onClick={onBack} className="text-cream-300 text-body-sm">← Back</button>
          <div className="flex items-center gap-3">
            {saving && <span className="text-cream-400 text-body-sm">Saving...</span>}
            <button onClick={() => setShowSketch(true)} className="text-cream-300 text-body-sm">Sketch</button>
            <button onClick={() => setShowDelete(true)} className="text-cream-300 text-body-sm">Delete</button>
          </div>
        </div>
      </div>

      <div className="bg-cream px-6 py-6 min-h-[70vh]">
        <div className="max-w-lg mx-auto">
          <input
            type="text"
            value={title}
            onChange={e => handleTitleChange(e.target.value)}
            placeholder="Untitled"
            className="w-full bg-transparent font-serif text-display-sm text-forest border-none outline-none mb-4"
          />
          <textarea
            value={content}
            onChange={e => handleContentChange(e.target.value)}
            placeholder="Start writing..."
            className="w-full h-64 bg-transparent text-body text-ink-600 border-none outline-none resize-none"
          />

          {/* Sketches */}
          {sketches.length > 0 && (
            <div className="mt-6 pt-6 border-t border-cream-300">
              <h3 className="font-medium text-forest mb-3">Sketches</h3>
              <div className="space-y-3">
                {sketches.map(sketch => (
                  <div key={sketch.id} className="relative">
                    <img src={sketch.dataUrl} alt="Sketch" className="w-full rounded-xl border border-cream-300" />
                    <button onClick={() => deleteSketch(sketch.id)} className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full shadow text-ink-400">x</button>
                    <p className="text-caption text-ink-300 mt-1">by {sketch.createdBy === 'shah' ? 'Shahjahan' : 'Dane'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-2">Delete Document?</h3>
            <p className="text-body text-ink-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={deleteDocument} className="flex-1 py-3 bg-rose-500 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Sketch Modal */}
      {showSketch && <SketchCanvas onSave={saveSketch} onClose={() => setShowSketch(false)} />}
    </div>
  )
}

function SketchCanvas({ onSave, onClose }) {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState('#1a3a2f')
  const [brushSize, setBrushSize] = useState(4)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    }
  }

  const startDrawing = (e) => {
    e.preventDefault()
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const { x, y } = getPos(e)
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
    const ctx = canvasRef.current.getContext('2d')
    const { x, y } = getPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  const stopDrawing = () => setIsDrawing(false)

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }

  const save = () => {
    const dataUrl = canvasRef.current.toDataURL('image/png')
    onSave(dataUrl)
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      <div className="bg-white px-4 py-3 flex justify-between items-center">
        <button onClick={onClose} className="text-ink-500">Cancel</button>
        <div className="flex gap-2">
          {['#1a3a2f', '#000', '#3b82f6', '#ef4444', '#f59e0b'].map(c => (
            <button key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-forest' : ''}`} style={{ backgroundColor: c }} />
          ))}
        </div>
        <button onClick={save} className="text-forest font-medium">Save</button>
      </div>
      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="bg-white rounded-xl shadow-lg max-w-full max-h-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      <div className="bg-white px-4 py-3 flex justify-center gap-4">
        <button onClick={clear} className="px-4 py-2 bg-cream-200 rounded-lg text-ink-600">Clear</button>
        <input type="range" min="2" max="20" value={brushSize} onChange={e => setBrushSize(Number(e.target.value))} className="w-32" />
      </div>
    </div>
  )
}
