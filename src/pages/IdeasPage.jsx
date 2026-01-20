import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

const FONT_SIZES = ['12', '14', '16', '18', '20', '24', '28', '32', '40', '48']
const COLORS = ['#1f2937', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777']
const HIGHLIGHT_COLORS = ['transparent', '#fef08a', '#bbf7d0', '#bfdbfe', '#f5d0fe', '#fed7aa']

export default function IdeasPage() {
  const { user, supabase } = useAuth()
  const [view, setView] = useState('folders') // folders, folder, document
  const [folders, setFolders] = useState([])
  const [currentFolder, setCurrentFolder] = useState(null)
  const [documents, setDocuments] = useState([])
  const [currentDoc, setCurrentDoc] = useState(null)
  const [toast, setToast] = useState(null)
  
  // Folder modals
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [editingFolder, setEditingFolder] = useState(null)
  const [showDeleteFolder, setShowDeleteFolder] = useState(null)
  
  // Document modals
  const [showNewDoc, setShowNewDoc] = useState(false)
  const [newDocTitle, setNewDocTitle] = useState('')
  const [editingDocTitle, setEditingDocTitle] = useState(null)
  const [showDeleteDoc, setShowDeleteDoc] = useState(null)
  
  // Editor state
  const [docTitle, setDocTitle] = useState('')
  const [docContent, setDocContent] = useState('')
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showToolbar, setShowToolbar] = useState(true)
  const [showFontSize, setShowFontSize] = useState(false)
  const [showTextColor, setShowTextColor] = useState(false)
  const [showHighlight, setShowHighlight] = useState(false)
  const editorRef = useRef(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    loadFolders()
  }, [])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadFolders = async () => {
    if (!supabase) return
    const { data } = await supabase.from('idea_folders').select('*').order('created_at', { ascending: false })
    if (data) setFolders(data)
  }

  const loadDocuments = async (folderId) => {
    if (!supabase) return
    const { data } = await supabase.from('idea_documents').select('*').eq('folder_id', folderId).order('updated_at', { ascending: false })
    if (data) setDocuments(data)
  }

  // Folder functions
  const createFolder = async () => {
    if (!newFolderName.trim() || !supabase) return
    await supabase.from('idea_folders').insert({
      name: newFolderName.trim(),
      created_by: user.id
    })
    setNewFolderName('')
    setShowNewFolder(false)
    loadFolders()
    showToast('Folder created!', 'success')
  }

  const updateFolder = async () => {
    if (!editingFolder || !supabase) return
    await supabase.from('idea_folders').update({ name: editingFolder.name }).eq('id', editingFolder.id)
    setEditingFolder(null)
    loadFolders()
    showToast('Folder renamed!', 'success')
  }

  const deleteFolder = async (id) => {
    if (!supabase) return
    // Delete all documents in folder first
    await supabase.from('idea_documents').delete().eq('folder_id', id)
    await supabase.from('idea_folders').delete().eq('id', id)
    setShowDeleteFolder(null)
    loadFolders()
    showToast('Folder deleted', 'success')
  }

  const openFolder = (folder) => {
    setCurrentFolder(folder)
    loadDocuments(folder.id)
    setView('folder')
  }

  // Document functions
  const createDocument = async () => {
    if (!newDocTitle.trim() || !supabase || !currentFolder) return
    const { data } = await supabase.from('idea_documents').insert({
      folder_id: currentFolder.id,
      title: newDocTitle.trim(),
      content: '',
      created_by: user.id
    }).select().single()
    
    setNewDocTitle('')
    setShowNewDoc(false)
    if (data) {
      openDocument(data)
    }
    loadDocuments(currentFolder.id)
    showToast('Document created!', 'success')
  }

  const openDocument = (doc) => {
    setCurrentDoc(doc)
    setDocTitle(doc.title)
    setDocContent(doc.content || '')
    setHasUnsavedChanges(false)
    setView('document')
    
    // Set editor content after a brief delay
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = doc.content || ''
      }
    }, 100)
  }

  const saveDocument = async () => {
    if (!currentDoc || !supabase) return
    
    const content = editorRef.current?.innerHTML || ''
    
    await supabase.from('idea_documents').update({
      title: docTitle,
      content: content,
      updated_at: new Date().toISOString()
    }).eq('id', currentDoc.id)
    
    setHasUnsavedChanges(false)
    showToast('Saved!', 'success')
  }

  const deleteDocument = async (id) => {
    if (!supabase) return
    await supabase.from('idea_documents').delete().eq('id', id)
    setShowDeleteDoc(null)
    if (currentDoc?.id === id) {
      setView('folder')
      setCurrentDoc(null)
    }
    loadDocuments(currentFolder.id)
    showToast('Document deleted', 'success')
  }

  // Editor functions
  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value)
    editorRef.current?.focus()
    setHasUnsavedChanges(true)
  }

  const handleEditorChange = () => {
    setHasUnsavedChanges(true)
  }

  const insertImage = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !supabase) return
    
    try {
      const fileName = `idea_${user.id}_${Date.now()}.jpg`
      const { error } = await supabase.storage.from('photos').upload(fileName, file)
      
      if (error) {
        showToast('Image upload failed', 'error')
        return
      }
      
      const { data: { publicUrl } } = supabase.storage.from('photos').getPublicUrl(fileName)
      execCommand('insertImage', publicUrl)
      showToast('Image added!', 'success')
    } catch (err) {
      showToast('Image upload failed', 'error')
    }
  }

  const BackButton = ({ onClick, label = 'Back' }) => (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl shadow-soft text-forest font-medium mb-4"
    >
      <span className="text-xl">←</span>
      <span>{label}</span>
    </button>
  )

  // FOLDERS VIEW
  if (view === 'folders') {
    return (
      <div className="min-h-screen bg-cream-100 p-6">
        {toast && (
          <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-card ${toast.type === 'success' ? 'bg-forest text-cream-100' : 'bg-rose-500 text-white'}`}>
            {toast.message}
          </div>
        )}

        <h1 className="font-serif text-display-sm text-forest mb-2">Ideas</h1>
        <p className="text-body text-ink-500 mb-6">Your creative space</p>

        <button
          onClick={() => setShowNewFolder(true)}
          className="w-full bg-forest text-cream-100 py-4 rounded-xl font-medium mb-6"
        >
          + New Folder
        </button>

        <div className="grid grid-cols-2 gap-4 pb-24">
          {folders.map(folder => (
            <div key={folder.id} className="bg-white rounded-2xl p-5 shadow-soft">
              <button onClick={() => openFolder(folder)} className="w-full text-left">
                <div className="text-4xl mb-3">📁</div>
                <h3 className="font-serif text-title-sm text-forest truncate">{folder.name}</h3>
              </button>
              <button 
                onClick={() => setEditingFolder(folder)}
                className="text-ink-400 text-body-sm mt-2"
              >
                ✏️ Edit
              </button>
            </div>
          ))}
          
          {folders.length === 0 && (
            <div className="col-span-2 text-center py-12">
              <p className="text-4xl mb-4">📁</p>
              <p className="text-body text-ink-500">No folders yet. Create one to get started!</p>
            </div>
          )}
        </div>

        {/* New Folder Modal */}
        {showNewFolder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="font-serif text-title text-forest mb-4">New Folder</h3>
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full p-4 bg-cream-50 rounded-xl text-body mb-4 focus:outline-none focus:ring-2 focus:ring-forest/20"
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={() => setShowNewFolder(false)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
                <button onClick={createFolder} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Create</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Folder Modal */}
        {editingFolder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="font-serif text-title text-forest mb-4">Edit Folder</h3>
              <input
                value={editingFolder.name}
                onChange={(e) => setEditingFolder({ ...editingFolder, name: e.target.value })}
                className="w-full p-4 bg-cream-50 rounded-xl text-body mb-4 focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteFolder(editingFolder.id)} className="py-3 px-4 bg-rose-100 text-rose-600 rounded-xl">Delete</button>
                <button onClick={() => setEditingFolder(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
                <button onClick={updateFolder} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Folder Modal */}
        {showDeleteFolder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="font-serif text-title text-forest mb-2">Delete Folder?</h3>
              <p className="text-body text-ink-500 mb-6">All documents inside will be deleted too.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteFolder(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
                <button onClick={() => { deleteFolder(showDeleteFolder); setEditingFolder(null) }} className="flex-1 py-3 bg-rose-500 text-white rounded-xl">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // FOLDER VIEW (documents list)
  if (view === 'folder') {
    return (
      <div className="min-h-screen bg-cream-100 p-6">
        {toast && (
          <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-card ${toast.type === 'success' ? 'bg-forest text-cream-100' : 'bg-rose-500 text-white'}`}>
            {toast.message}
          </div>
        )}

        <BackButton onClick={() => setView('folders')} label="All Folders" />
        
        <h1 className="font-serif text-title text-forest mb-2">{currentFolder?.name}</h1>
        <p className="text-body-sm text-ink-400 mb-6">{documents.length} documents</p>

        <button
          onClick={() => setShowNewDoc(true)}
          className="w-full bg-forest text-cream-100 py-4 rounded-xl font-medium mb-6"
        >
          + New Document
        </button>

        <div className="space-y-3 pb-24">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white rounded-xl p-4 shadow-soft flex items-center justify-between">
              <button onClick={() => openDocument(doc)} className="flex-1 text-left">
                <h3 className="font-medium text-forest">{doc.title}</h3>
                <p className="text-caption text-ink-400">
                  {new Date(doc.updated_at).toLocaleDateString()}
                </p>
              </button>
              <button onClick={() => setShowDeleteDoc(doc.id)} className="text-ink-400 p-2">🗑</button>
            </div>
          ))}
          
          {documents.length === 0 && (
            <p className="text-center text-ink-400 py-8">No documents yet. Create one!</p>
          )}
        </div>

        {/* New Document Modal */}
        {showNewDoc && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="font-serif text-title text-forest mb-4">New Document</h3>
              <input
                value={newDocTitle}
                onChange={(e) => setNewDocTitle(e.target.value)}
                placeholder="Document title"
                className="w-full p-4 bg-cream-50 rounded-xl text-body mb-4 focus:outline-none focus:ring-2 focus:ring-forest/20"
                autoFocus
              />
              <div className="flex gap-3">
                <button onClick={() => setShowNewDoc(false)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
                <button onClick={createDocument} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Create</button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Document Modal */}
        {showDeleteDoc && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
              <h3 className="font-serif text-title text-forest mb-2">Delete Document?</h3>
              <p className="text-body text-ink-500 mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteDoc(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
                <button onClick={() => deleteDocument(showDeleteDoc)} className="flex-1 py-3 bg-rose-500 text-white rounded-xl">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  // DOCUMENT EDITOR VIEW
  if (view === 'document') {
    return (
      <div className="min-h-screen bg-cream-100 flex flex-col">
        {toast && (
          <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-card ${toast.type === 'success' ? 'bg-forest text-cream-100' : 'bg-rose-500 text-white'}`}>
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="bg-white border-b border-cream-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={() => {
                if (hasUnsavedChanges) {
                  if (confirm('You have unsaved changes. Save before leaving?')) {
                    saveDocument()
                  }
                }
                setView('folder')
                loadDocuments(currentFolder.id)
              }}
              className="flex items-center gap-2 text-forest"
            >
              <span className="text-xl">←</span>
              <span>Back</span>
            </button>
            
            <button
              onClick={saveDocument}
              className={`px-4 py-2 rounded-lg font-medium ${hasUnsavedChanges ? 'bg-forest text-cream-100' : 'bg-cream-200 text-ink-500'}`}
            >
              {hasUnsavedChanges ? 'Save' : 'Saved'}
            </button>
          </div>
          
          <input
            value={docTitle}
            onChange={(e) => { setDocTitle(e.target.value); setHasUnsavedChanges(true) }}
            className="w-full font-serif text-title text-forest bg-transparent focus:outline-none"
            placeholder="Document title"
          />
        </div>

        {/* Toolbar */}
        <div className="bg-white border-b border-cream-200 p-2 overflow-x-auto hide-scrollbar">
          <div className="flex gap-1 min-w-max">
            {/* Text Style */}
            <button onClick={() => execCommand('bold')} className="p-2 rounded hover:bg-cream-100 font-bold">B</button>
            <button onClick={() => execCommand('italic')} className="p-2 rounded hover:bg-cream-100 italic">I</button>
            <button onClick={() => execCommand('underline')} className="p-2 rounded hover:bg-cream-100 underline">U</button>
            <button onClick={() => execCommand('strikeThrough')} className="p-2 rounded hover:bg-cream-100 line-through">S</button>
            
            <div className="w-px bg-cream-200 mx-1" />
            
            {/* Headers */}
            <button onClick={() => execCommand('formatBlock', 'h1')} className="p-2 rounded hover:bg-cream-100 text-lg font-bold">H1</button>
            <button onClick={() => execCommand('formatBlock', 'h2')} className="p-2 rounded hover:bg-cream-100 font-bold">H2</button>
            <button onClick={() => execCommand('formatBlock', 'h3')} className="p-2 rounded hover:bg-cream-100 text-sm font-bold">H3</button>
            <button onClick={() => execCommand('formatBlock', 'p')} className="p-2 rounded hover:bg-cream-100">¶</button>
            
            <div className="w-px bg-cream-200 mx-1" />
            
            {/* Font Size */}
            <div className="relative">
              <button onClick={() => setShowFontSize(!showFontSize)} className="p-2 rounded hover:bg-cream-100">
                Size ▾
              </button>
              {showFontSize && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-card border border-cream-200 py-1 z-10">
                  {FONT_SIZES.map(size => (
                    <button
                      key={size}
                      onClick={() => { execCommand('fontSize', '7'); setShowFontSize(false) }}
                      className="block w-full px-4 py-1 text-left hover:bg-cream-100"
                      style={{ fontSize: `${size}px` }}
                    >
                      {size}px
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Text Color */}
            <div className="relative">
              <button onClick={() => setShowTextColor(!showTextColor)} className="p-2 rounded hover:bg-cream-100">
                <span className="border-b-2 border-forest">A</span> ▾
              </button>
              {showTextColor && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-card border border-cream-200 p-2 z-10">
                  <div className="grid grid-cols-5 gap-1">
                    {COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => { execCommand('foreColor', color); setShowTextColor(false) }}
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Highlight */}
            <div className="relative">
              <button onClick={() => setShowHighlight(!showHighlight)} className="p-2 rounded hover:bg-cream-100">
                <span className="bg-yellow-200 px-1">H</span> ▾
              </button>
              {showHighlight && (
                <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-card border border-cream-200 p-2 z-10">
                  <div className="grid grid-cols-3 gap-1">
                    {HIGHLIGHT_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => { execCommand('hiliteColor', color); setShowHighlight(false) }}
                        className="w-8 h-6 rounded border border-cream-200"
                        style={{ backgroundColor: color === 'transparent' ? 'white' : color }}
                      >
                        {color === 'transparent' && '✕'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="w-px bg-cream-200 mx-1" />
            
            {/* Lists */}
            <button onClick={() => execCommand('insertUnorderedList')} className="p-2 rounded hover:bg-cream-100">• List</button>
            <button onClick={() => execCommand('insertOrderedList')} className="p-2 rounded hover:bg-cream-100">1. List</button>
            
            <div className="w-px bg-cream-200 mx-1" />
            
            {/* Alignment */}
            <button onClick={() => execCommand('justifyLeft')} className="p-2 rounded hover:bg-cream-100">⬅</button>
            <button onClick={() => execCommand('justifyCenter')} className="p-2 rounded hover:bg-cream-100">⬌</button>
            <button onClick={() => execCommand('justifyRight')} className="p-2 rounded hover:bg-cream-100">➡</button>
            
            <div className="w-px bg-cream-200 mx-1" />
            
            {/* Image */}
            <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded hover:bg-cream-100">🖼️</button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={insertImage}
              className="hidden"
            />
            
            {/* Quote */}
            <button onClick={() => execCommand('formatBlock', 'blockquote')} className="p-2 rounded hover:bg-cream-100">"</button>
            
            {/* Horizontal Rule */}
            <button onClick={() => execCommand('insertHorizontalRule')} className="p-2 rounded hover:bg-cream-100">―</button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-y-auto pb-24">
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorChange}
            className="min-h-full p-6 bg-white focus:outline-none prose prose-forest max-w-none"
            style={{ 
              lineHeight: '1.6',
              minHeight: 'calc(100vh - 200px)'
            }}
            dangerouslySetInnerHTML={{ __html: docContent }}
          />
        </div>

        {/* Close dropdowns when clicking outside */}
        {(showFontSize || showTextColor || showHighlight) && (
          <div 
            className="fixed inset-0 z-0" 
            onClick={() => {
              setShowFontSize(false)
              setShowTextColor(false)
              setShowHighlight(false)
            }}
          />
        )}
      </div>
    )
  }

  return null
}
