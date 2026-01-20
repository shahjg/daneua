import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getFolders,
  createFolder,
  deleteFolder,
  getDocuments,
  createDocument,
  updateDocument,
  deleteDocument
} from '../lib/supabase'

export default function IdeasPage() {
  const { user } = useAuth()
  const [folders, setFolders] = useState([])
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [documents, setDocuments] = useState([])
  const [selectedDoc, setSelectedDoc] = useState(null)
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFolders()
  }, [])

  useEffect(() => {
    if (selectedFolder) {
      fetchDocuments(selectedFolder.id)
    }
  }, [selectedFolder])

  const fetchFolders = async () => {
    try {
      const data = await getFolders()
      setFolders(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  const fetchDocuments = async (folderId) => {
    try {
      const data = await getDocuments(folderId)
      setDocuments(data || [])
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return
    try {
      const folder = await createFolder(newFolderName, user.role)
      setFolders(prev => [...prev, folder])
      setNewFolderName('')
      setShowNewFolder(false)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteFolder = async (id) => {
    if (!confirm('Delete this folder and all documents?')) return
    try {
      await deleteFolder(id)
      setFolders(prev => prev.filter(f => f.id !== id))
      if (selectedFolder?.id === id) {
        setSelectedFolder(null)
        setDocuments([])
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleCreateDocument = async () => {
    try {
      const doc = await createDocument(selectedFolder.id, 'Untitled', '', user.role)
      setDocuments(prev => [doc, ...prev])
      setSelectedDoc(doc)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSaveDocument = async (title, content) => {
    try {
      await updateDocument(selectedDoc.id, title, content)
      setDocuments(prev => prev.map(d => 
        d.id === selectedDoc.id ? { ...d, title, content } : d
      ))
      setSelectedDoc(prev => ({ ...prev, title, content }))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteDocument = async (id) => {
    if (!confirm('Delete this document?')) return
    try {
      await deleteDocument(id)
      setDocuments(prev => prev.filter(d => d.id !== id))
      if (selectedDoc?.id === id) setSelectedDoc(null)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  // Document Editor View
  if (selectedDoc) {
    return (
      <DocumentEditor
        doc={selectedDoc}
        onSave={handleSaveDocument}
        onBack={() => setSelectedDoc(null)}
        onDelete={() => handleDeleteDocument(selectedDoc.id)}
      />
    )
  }

  // Documents List View
  if (selectedFolder) {
    return (
      <div className="min-h-screen pb-28">
        <div className="bg-rose-100 px-6 pt-14 pb-10">
          <div className="max-w-lg mx-auto">
            <button 
              onClick={() => { setSelectedFolder(null); setDocuments([]) }}
              className="flex items-center gap-3 text-forest mb-4"
            >
              <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center">
                <svg className="w-5 h-5 text-cream-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="text-body font-medium">Back</span>
            </button>
            <h1 className="font-serif text-display-sm text-forest">{selectedFolder.name}</h1>
          </div>
        </div>

        <div className="bg-cream min-h-[60vh] px-6 py-8">
          <div className="max-w-lg mx-auto">
            <button
              onClick={handleCreateDocument}
              className="w-full mb-6 py-5 border-2 border-dashed border-rose-300 rounded-2xl text-rose-500 hover:border-rose-400 hover:bg-rose-50 transition-all font-medium"
            >
              + New Document
            </button>

            {documents.length > 0 ? (
              <div className="space-y-3">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="bg-white rounded-2xl p-5 shadow-soft group relative cursor-pointer hover:shadow-card transition-shadow"
                    onClick={() => setSelectedDoc(doc)}
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDeleteDocument(doc.id) }}
                      className="absolute top-4 right-4 w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:bg-rose-200"
                    >
                      ×
                    </button>
                    <h3 className="font-serif text-title-sm text-forest">{doc.title || 'Untitled'}</h3>
                    <p className="text-body-sm text-ink-400 mt-1">
                      {doc.content ? doc.content.replace(/<[^>]*>/g, '').substring(0, 100) + '...' : 'Empty document'}
                    </p>
                    <p className="text-caption text-ink-300 mt-2">
                      {new Date(doc.updated_at || doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <span className="text-5xl block mb-4">📝</span>
                <p className="text-body text-ink-400">No documents yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Folders View
  return (
    <div className="min-h-screen pb-28">
      <div className="bg-rose-100 px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-display-sm text-forest mb-2">Ideas</h1>
          <p className="text-body text-forest-600">Your shared thoughts & plans</p>
        </div>
      </div>

      <div className="bg-cream min-h-[60vh] px-6 py-8">
        <div className="max-w-lg mx-auto">
          {/* New Folder */}
          {showNewFolder ? (
            <div className="bg-white rounded-2xl p-5 shadow-card mb-6">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name..."
                className="input mb-3"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={handleCreateFolder} className="btn-primary flex-1 py-2">Create</button>
                <button onClick={() => { setShowNewFolder(false); setNewFolderName('') }} className="btn-ghost py-2">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowNewFolder(true)}
              className="w-full mb-6 py-5 border-2 border-dashed border-rose-300 rounded-2xl text-rose-500 hover:border-rose-400 hover:bg-rose-50 transition-all font-medium"
            >
              + New Folder
            </button>
          )}

          {/* Folders Grid */}
          {loading ? (
            <p className="text-center py-12 text-ink-400">Loading...</p>
          ) : folders.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  className="bg-white rounded-2xl p-6 shadow-soft group relative cursor-pointer hover:shadow-card transition-shadow"
                  onClick={() => setSelectedFolder(folder)}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id) }}
                    className="absolute top-3 right-3 w-7 h-7 bg-rose-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:bg-rose-200"
                  >
                    ×
                  </button>
                  <span className="text-4xl block mb-3">📁</span>
                  <h3 className="font-serif text-title-sm text-forest">{folder.name}</h3>
                  <p className="text-caption text-ink-400 mt-1">
                    {folder.document_count || 0} docs
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">📁</span>
              <p className="text-body text-ink-400">No folders yet</p>
              <p className="text-body-sm text-ink-300 mt-2">Create a folder to organize your ideas</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Rich Text Document Editor with Google Docs-like features
function DocumentEditor({ doc, onSave, onBack, onDelete }) {
  const [title, setTitle] = useState(doc.title || 'Untitled')
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showColorPicker, setShowColorPicker] = useState(null)
  const editorRef = useRef(null)

  useEffect(() => {
    if (editorRef.current && doc.content) {
      editorRef.current.innerHTML = doc.content
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    await onSave(title, editorRef.current?.innerHTML || '')
    setHasChanges(false)
    setSaving(false)
  }

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    setHasChanges(true)
  }

  const insertImage = () => {
    const url = prompt('Enter image URL:')
    if (url) {
      execCommand('insertImage', url)
    }
  }

  const setFontSize = (size) => {
    execCommand('fontSize', size)
  }

  const setFontName = (font) => {
    execCommand('fontName', font)
  }

  const colors = ['#000000', '#374151', '#6b7280', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']
  const highlightColors = ['#fef3c7', '#fecaca', '#d1fae5', '#dbeafe', '#f3e8ff', '#fce7f3', '#ffffff']

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-forest px-4 pt-12 pb-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="flex items-center gap-2 text-cream-200 hover:text-cream-100">
              <div className="w-10 h-10 rounded-full bg-forest-600 flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </div>
              <span className="font-medium">Back</span>
            </button>
            <div className="flex items-center gap-2">
              {hasChanges && <span className="text-gold text-sm">Unsaved changes</span>}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-gold text-forest rounded-full font-semibold hover:bg-gold-400 transition-colors"
              >
                {saving ? 'Saving...' : '💾 Save'}
              </button>
            </div>
          </div>
          <input
            type="text"
            value={title}
            onChange={(e) => { setTitle(e.target.value); setHasChanges(true) }}
            className="w-full bg-transparent text-cream-50 font-serif text-2xl border-none outline-none placeholder-cream-400"
            placeholder="Document title..."
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-cream-200 border-b border-cream-300 px-4 py-2 sticky top-0 z-20 overflow-x-auto">
        <div className="max-w-4xl mx-auto flex items-center gap-1 flex-wrap">
          {/* Font */}
          <select 
            onChange={(e) => setFontName(e.target.value)}
            className="px-2 py-1 rounded bg-white border border-cream-300 text-sm"
          >
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times</option>
            <option value="Courier New">Courier</option>
            <option value="Verdana">Verdana</option>
          </select>

          {/* Font Size */}
          <select 
            onChange={(e) => setFontSize(e.target.value)}
            className="px-2 py-1 rounded bg-white border border-cream-300 text-sm"
          >
            <option value="2">Small</option>
            <option value="3">Normal</option>
            <option value="4">Large</option>
            <option value="5">X-Large</option>
            <option value="6">Huge</option>
          </select>

          <div className="w-px h-6 bg-cream-400 mx-1" />

          {/* Basic Formatting */}
          <button onClick={() => execCommand('bold')} className="toolbar-btn font-bold">B</button>
          <button onClick={() => execCommand('italic')} className="toolbar-btn italic">I</button>
          <button onClick={() => execCommand('underline')} className="toolbar-btn underline">U</button>
          <button onClick={() => execCommand('strikeThrough')} className="toolbar-btn line-through">S</button>

          <div className="w-px h-6 bg-cream-400 mx-1" />

          {/* Text Color */}
          <div className="relative">
            <button 
              onClick={() => setShowColorPicker(showColorPicker === 'text' ? null : 'text')}
              className="toolbar-btn flex items-center gap-1"
            >
              <span className="text-red-500">A</span>
              <span className="text-xs">▼</span>
            </button>
            {showColorPicker === 'text' && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg z-30 flex gap-1 flex-wrap w-32">
                {colors.map(c => (
                  <button
                    key={c}
                    onClick={() => { execCommand('foreColor', c); setShowColorPicker(null) }}
                    className="w-6 h-6 rounded border border-cream-300"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Highlight Color */}
          <div className="relative">
            <button 
              onClick={() => setShowColorPicker(showColorPicker === 'highlight' ? null : 'highlight')}
              className="toolbar-btn flex items-center gap-1"
            >
              <span className="bg-yellow-200 px-1">H</span>
              <span className="text-xs">▼</span>
            </button>
            {showColorPicker === 'highlight' && (
              <div className="absolute top-full left-0 mt-1 p-2 bg-white rounded-lg shadow-lg z-30 flex gap-1 flex-wrap w-32">
                {highlightColors.map(c => (
                  <button
                    key={c}
                    onClick={() => { execCommand('hiliteColor', c); setShowColorPicker(null) }}
                    className="w-6 h-6 rounded border border-cream-300"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="w-px h-6 bg-cream-400 mx-1" />

          {/* Headers */}
          <button onClick={() => execCommand('formatBlock', '<h1>')} className="toolbar-btn text-lg font-bold">H1</button>
          <button onClick={() => execCommand('formatBlock', '<h2>')} className="toolbar-btn text-base font-bold">H2</button>
          <button onClick={() => execCommand('formatBlock', '<h3>')} className="toolbar-btn text-sm font-bold">H3</button>
          <button onClick={() => execCommand('formatBlock', '<p>')} className="toolbar-btn text-sm">¶</button>

          <div className="w-px h-6 bg-cream-400 mx-1" />

          {/* Lists */}
          <button onClick={() => execCommand('insertUnorderedList')} className="toolbar-btn">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <button onClick={() => execCommand('insertOrderedList')} className="toolbar-btn">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>

          <div className="w-px h-6 bg-cream-400 mx-1" />

          {/* Alignment */}
          <button onClick={() => execCommand('justifyLeft')} className="toolbar-btn">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 12h10M3 18h14" />
            </svg>
          </button>
          <button onClick={() => execCommand('justifyCenter')} className="toolbar-btn">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M7 12h10M5 18h14" />
            </svg>
          </button>
          <button onClick={() => execCommand('justifyRight')} className="toolbar-btn">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M11 12h10M7 18h14" />
            </svg>
          </button>

          <div className="w-px h-6 bg-cream-400 mx-1" />

          {/* Image */}
          <button onClick={insertImage} className="toolbar-btn">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          {/* Link */}
          <button onClick={() => {
            const url = prompt('Enter URL:')
            if (url) execCommand('createLink', url)
          }} className="toolbar-btn">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </button>

          <div className="w-px h-6 bg-cream-400 mx-1" />

          {/* Undo/Redo */}
          <button onClick={() => execCommand('undo')} className="toolbar-btn">↶</button>
          <button onClick={() => execCommand('redo')} className="toolbar-btn">↷</button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 bg-white">
        <div className="max-w-4xl mx-auto p-6">
          <div
            ref={editorRef}
            contentEditable
            onInput={() => setHasChanges(true)}
            className="min-h-[60vh] outline-none prose prose-lg max-w-none"
            style={{ 
              lineHeight: 1.8,
              fontSize: '16px'
            }}
            placeholder="Start writing..."
          />
        </div>
      </div>

      <style>{`
        .toolbar-btn {
          padding: 6px 10px;
          border-radius: 6px;
          background: white;
          border: 1px solid #e5e0d8;
          cursor: pointer;
          transition: all 0.15s;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 32px;
          height: 32px;
        }
        .toolbar-btn:hover {
          background: #f5f2ed;
          border-color: #d4cfc5;
        }
        .toolbar-btn:active {
          background: #ebe7e0;
        }
        [contenteditable]:empty:before {
          content: attr(placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px 0;
        }
        [contenteditable] h1 {
          font-size: 2em;
          font-weight: bold;
          margin: 1em 0 0.5em;
          font-family: serif;
        }
        [contenteditable] h2 {
          font-size: 1.5em;
          font-weight: bold;
          margin: 1em 0 0.5em;
          font-family: serif;
        }
        [contenteditable] h3 {
          font-size: 1.25em;
          font-weight: bold;
          margin: 1em 0 0.5em;
        }
        [contenteditable] ul, [contenteditable] ol {
          margin: 1em 0;
          padding-left: 2em;
        }
        [contenteditable] a {
          color: #2563eb;
          text-decoration: underline;
        }
      `}</style>
    </div>
  )
}
