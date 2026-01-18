import { useState } from 'react'
import { getRandomMoodMessage } from '../lib/supabase'

const moods = [
  {
    id: 'sad',
    label: 'Feeling Sad',
    emoji: '😢',
    color: 'bg-blush-200 hover:bg-blush-300 border-blush-400',
    textColor: 'text-heart-600',
    shadowColor: 'shadow-glow-pink',
  },
  {
    id: 'unmotivated',
    label: 'Unmotivated',
    emoji: '😮‍💨',
    color: 'bg-ivory-300 hover:bg-ivory-400 border-evergreen-200',
    textColor: 'text-evergreen-700',
    shadowColor: 'shadow-soft',
  },
  {
    id: 'working_hard',
    label: 'Working Hard',
    emoji: '💪',
    color: 'bg-evergreen-100 hover:bg-evergreen-200 border-evergreen-400',
    textColor: 'text-evergreen-800',
    shadowColor: 'shadow-glow-green',
  },
  {
    id: 'missing_you',
    label: 'Missing You',
    emoji: '🥺',
    color: 'bg-heart-100 hover:bg-heart-200 border-heart-400',
    textColor: 'text-heart-600',
    shadowColor: 'shadow-glow-pink',
  },
]

export default function MoodDashboard() {
  const [selectedMood, setSelectedMood] = useState(null)
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleMoodClick = async (mood) => {
    setLoading(true)
    setSelectedMood(mood.id)
    
    try {
      const data = await getRandomMoodMessage(mood.id)
      setMessage(data)
    } catch (error) {
      console.error('Error fetching message:', error)
      setMessage({
        content: "Couldn't load message, but know that I love you always. 💚",
        title: "Error"
      })
    }
    
    setLoading(false)
  }

  const closeMessage = () => {
    setSelectedMood(null)
    setMessage(null)
  }

  return (
    <div className="space-y-6">
      {/* Intro Text */}
      <div className="text-center mb-8">
        <p className="text-evergreen-600 text-lg">How are you feeling, love?</p>
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-2 gap-4">
        {moods.map((mood, index) => (
          <button
            key={mood.id}
            onClick={() => handleMoodClick(mood)}
            className={`
              ${mood.color} ${mood.textColor} ${mood.shadowColor}
              relative overflow-hidden
              p-6 rounded-2xl border-2
              transition-all duration-300 ease-out
              transform hover:scale-[1.02] active:scale-[0.98]
              animate-slide-up
            `}
            style={{ animationDelay: `${index * 100}ms` }}
            disabled={loading}
          >
            <div className="text-4xl mb-3">{mood.emoji}</div>
            <div className="font-display text-lg leading-tight">{mood.label}</div>
            
            {/* Decorative gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
          </button>
        ))}
      </div>

      {/* Message Modal */}
      {message && (
        <div 
          className="fixed inset-0 bg-evergreen-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fade-in"
          onClick={closeMessage}
        >
          <div 
            className="bg-ivory rounded-3xl p-8 max-w-sm w-full shadow-card animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-6">
              <div className="text-4xl mb-2">
                {moods.find(m => m.id === selectedMood)?.emoji}
              </div>
              {message.title && (
                <h3 className="font-display text-xl text-evergreen-800">
                  {message.title}
                </h3>
              )}
            </div>

            {/* Message Content */}
            <div className="text-center">
              {message.message_type === 'text' ? (
                <p className="text-evergreen-700 text-lg leading-relaxed">
                  {message.content}
                </p>
              ) : message.message_type === 'audio' && message.storage_url ? (
                <div className="space-y-4">
                  <p className="text-evergreen-600 text-sm">A voice note from Shah:</p>
                  <audio 
                    controls 
                    src={message.storage_url} 
                    className="w-full"
                  />
                </div>
              ) : message.message_type === 'video' && message.storage_url ? (
                <video 
                  controls 
                  src={message.storage_url}
                  className="w-full rounded-xl"
                />
              ) : (
                <p className="text-evergreen-700">{message.content}</p>
              )}
            </div>

            {/* Close Button */}
            <button
              onClick={closeMessage}
              className="mt-8 w-full py-3 bg-evergreen text-ivory rounded-xl font-medium transition-colors hover:bg-evergreen-700"
            >
              Thank you 💚
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="fixed inset-0 bg-ivory/80 z-50 flex items-center justify-center">
          <div className="text-evergreen text-xl animate-pulse-soft">
            Loading something special...
          </div>
        </div>
      )}
    </div>
  )
}
