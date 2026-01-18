import { useState, useEffect } from 'react'
import { getMediaVault, incrementViewCount } from '../lib/supabase'

const categories = [
  { id: null, label: 'All', emoji: '🎬' },
  { id: 'love', label: 'Love', emoji: '💕' },
  { id: 'motivation', label: 'Motivation', emoji: '💪' },
  { id: 'special_occasion', label: 'Special', emoji: '⭐' },
]

export default function MediaVault() {
  const [media, setMedia] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedMedia, setSelectedMedia] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMedia = async () => {
      setLoading(true)
      try {
        const data = await getMediaVault(selectedCategory)
        setMedia(data || [])
      } catch (error) {
        console.error('Error fetching media:', error)
      }
      setLoading(false)
    }

    fetchMedia()
  }, [selectedCategory])

  const handleMediaClick = async (item) => {
    // Check if locked
    if (item.unlock_date) {
      const unlockDate = new Date(item.unlock_date)
      if (unlockDate > new Date()) {
        alert(`This message unlocks on ${unlockDate.toLocaleDateString()}! 🎁`)
        return
      }
    }

    setSelectedMedia(item)
    
    // Increment view count
    try {
      await incrementViewCount(item.id)
    } catch (error) {
      console.error('Error updating view count:', error)
    }
  }

  const closeMedia = () => {
    setSelectedMedia(null)
  }

  const getMediaIcon = (type) => {
    switch (type) {
      case 'video': return '🎬'
      case 'audio': return '🎧'
      case 'image': return '🖼️'
      default: return '📁'
    }
  }

  const formatDuration = (seconds) => {
    if (!seconds) return ''
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isLocked = (item) => {
    if (!item.unlock_date) return false
    return new Date(item.unlock_date) > new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-evergreen animate-pulse-soft">Loading vault...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="font-display text-2xl text-evergreen-800">
          🔐 Media Vault
        </h2>
        <p className="text-evergreen-500 text-sm mt-1">
          Messages from Shah, just for you
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
        {categories.map((cat) => (
          <button
            key={cat.id || 'all'}
            onClick={() => setSelectedCategory(cat.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap
              transition-all duration-200 text-sm font-medium
              ${selectedCategory === cat.id
                ? 'bg-evergreen text-ivory shadow-soft'
                : 'bg-white border border-evergreen-200 text-evergreen-600 hover:bg-evergreen-50'
              }
            `}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Media Grid */}
      {media.length === 0 ? (
        <div className="text-center py-12 text-evergreen-400">
          <p className="text-4xl mb-4">📦</p>
          <p>No messages in this category yet.</p>
          <p className="text-sm mt-2">Shah will add some soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {media.map((item, index) => (
            <button
              key={item.id}
              onClick={() => handleMediaClick(item)}
              className={`
                relative bg-white rounded-2xl overflow-hidden shadow-card
                transition-all duration-200 transform hover:scale-[1.02]
                animate-slide-up text-left
                ${isLocked(item) ? 'opacity-70' : ''}
              `}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Thumbnail */}
              <div className="aspect-square bg-gradient-to-br from-evergreen-100 to-blush-100 flex items-center justify-center relative">
                {item.thumbnail_url ? (
                  <img 
                    src={item.thumbnail_url} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl opacity-50">
                    {getMediaIcon(item.media_type)}
                  </span>
                )}

                {/* Locked Overlay */}
                {isLocked(item) && (
                  <div className="absolute inset-0 bg-evergreen-900/60 flex items-center justify-center">
                    <div className="text-center text-ivory">
                      <span className="text-3xl">🔒</span>
                      <p className="text-xs mt-1">
                        {new Date(item.unlock_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* Duration Badge */}
                {item.duration_seconds && !isLocked(item) && (
                  <span className="absolute bottom-2 right-2 bg-evergreen-900/80 text-ivory text-xs px-2 py-1 rounded-full">
                    {formatDuration(item.duration_seconds)}
                  </span>
                )}

                {/* Favorite Badge */}
                {item.is_favorite && (
                  <span className="absolute top-2 right-2">❤️</span>
                )}
              </div>

              {/* Info */}
              <div className="p-3">
                <h3 className="font-medium text-evergreen-800 text-sm truncate">
                  {item.title}
                </h3>
                {item.view_count > 0 && (
                  <p className="text-xs text-evergreen-400 mt-1">
                    Watched {item.view_count}x
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Media Player Modal */}
      {selectedMedia && (
        <div 
          className="fixed inset-0 bg-evergreen-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={closeMedia}
        >
          <div 
            className="bg-ivory rounded-3xl p-6 max-w-lg w-full max-h-[90vh] overflow-auto shadow-card animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-xl text-evergreen-800">
                  {selectedMedia.title}
                </h3>
                {selectedMedia.description && (
                  <p className="text-evergreen-500 text-sm mt-1">
                    {selectedMedia.description}
                  </p>
                )}
              </div>
              <button
                onClick={closeMedia}
                className="text-evergreen-400 hover:text-evergreen-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Media Player */}
            <div className="rounded-xl overflow-hidden bg-evergreen-100">
              {selectedMedia.media_type === 'video' && (
                <video
                  controls
                  autoPlay
                  src={selectedMedia.storage_url}
                  className="w-full"
                  poster={selectedMedia.thumbnail_url}
                />
              )}
              {selectedMedia.media_type === 'audio' && (
                <div className="p-8 text-center">
                  <div className="text-6xl mb-4 animate-pulse-soft">🎧</div>
                  <audio
                    controls
                    autoPlay
                    src={selectedMedia.storage_url}
                    className="w-full"
                  />
                </div>
              )}
              {selectedMedia.media_type === 'image' && (
                <img
                  src={selectedMedia.storage_url}
                  alt={selectedMedia.title}
                  className="w-full"
                />
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 flex items-center justify-between text-sm text-evergreen-500">
              <span>
                {selectedMedia.category && `${selectedMedia.category}`}
              </span>
              <span>
                {selectedMedia.view_count} views
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
