import { useState, useEffect } from 'react'
import { getDailyWord, getDailyDeen } from '../lib/supabase'

export default function GrowthModule() {
  const [activeTab, setActiveTab] = useState('urdu')
  const [urduWord, setUrduWord] = useState(null)
  const [tagalogWord, setTagalogWord] = useState(null)
  const [deen, setDeen] = useState(null)
  const [showRoman, setShowRoman] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [urdu, tagalog, dailyDeen] = await Promise.all([
          getDailyWord('urdu'),
          getDailyWord('tagalog'),
          getDailyDeen()
        ])
        setUrduWord(urdu)
        setTagalogWord(tagalog)
        setDeen(dailyDeen)
      } catch (error) {
        console.error('Error fetching growth data:', error)
      }
      setLoading(false)
    }

    fetchData()
  }, [])

  const currentWord = activeTab === 'urdu' ? urduWord : tagalogWord

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-evergreen animate-pulse-soft">Loading your lessons...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Language Toggle */}
      <div className="flex bg-evergreen-100 rounded-xl p-1">
        <button
          onClick={() => setActiveTab('urdu')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'urdu'
              ? 'bg-evergreen text-ivory shadow-soft'
              : 'text-evergreen-600 hover:text-evergreen-800'
          }`}
        >
          🇵🇰 Urdu
        </button>
        <button
          onClick={() => setActiveTab('tagalog')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'tagalog'
              ? 'bg-evergreen text-ivory shadow-soft'
              : 'text-evergreen-600 hover:text-evergreen-800'
          }`}
        >
          🇵🇭 Tagalog
        </button>
      </div>

      {/* Word of the Day Card */}
      {currentWord && (
        <div className="bg-white rounded-3xl p-6 shadow-card border border-evergreen-100 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-evergreen-400 uppercase tracking-wider">
              Word of the Day
            </span>
            {currentWord.category && (
              <span className="text-xs bg-blush-100 text-heart-500 px-3 py-1 rounded-full">
                {currentWord.category}
              </span>
            )}
          </div>

          {/* Main Word Display */}
          <div className="text-center py-6">
            {/* Native Script (for Urdu) */}
            {activeTab === 'urdu' && !showRoman && currentWord.word_native && (
              <h2 className="font-display text-4xl text-evergreen-800 mb-2" dir="rtl">
                {currentWord.word_native}
              </h2>
            )}
            
            {/* Romanized */}
            <h2 className={`font-display text-evergreen-800 ${
              showRoman || activeTab === 'tagalog' ? 'text-3xl' : 'text-xl text-evergreen-500'
            }`}>
              {currentWord.word_romanized}
            </h2>

            {/* English Meaning */}
            <p className="text-evergreen-600 text-lg mt-3">
              {currentWord.meaning_english}
            </p>
          </div>

          {/* Roman Toggle (Urdu only) */}
          {activeTab === 'urdu' && (
            <div className="flex justify-center mb-4">
              <button
                onClick={() => setShowRoman(!showRoman)}
                className="text-sm text-evergreen-500 underline hover:text-evergreen-700"
              >
                {showRoman ? 'Show Urdu Script' : 'Show Roman Urdu'}
              </button>
            </div>
          )}

          {/* Example Sentence */}
          {currentWord.example_sentence && (
            <div className="bg-ivory-200 rounded-xl p-4 mt-4">
              <p className="text-sm text-evergreen-500 mb-1">Example:</p>
              <p className="text-evergreen-700 italic">"{currentWord.example_sentence}"</p>
              {currentWord.example_translation && (
                <p className="text-evergreen-500 text-sm mt-1">
                  {currentWord.example_translation}
                </p>
              )}
            </div>
          )}

          {/* Audio Player */}
          {currentWord.audio_url && (
            <div className="mt-4">
              <p className="text-sm text-evergreen-500 mb-2 text-center">
                🎧 Hear Shah say it:
              </p>
              <audio 
                controls 
                src={currentWord.audio_url}
                className="w-full h-10"
              />
            </div>
          )}
        </div>
      )}

      {/* Daily Deen Card */}
      {deen && (
        <div className="bg-gradient-to-br from-evergreen-50 to-evergreen-100 rounded-3xl p-6 shadow-card border border-evergreen-200 animate-slide-up">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🌙</span>
            <span className="text-xs font-medium text-evergreen-500 uppercase tracking-wider">
              Daily Deen
            </span>
            {deen.content_type && (
              <span className="ml-auto text-xs bg-evergreen-200 text-evergreen-700 px-3 py-1 rounded-full capitalize">
                {deen.content_type}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-display text-xl text-evergreen-800 mb-3">
            {deen.title}
          </h3>

          {/* Arabic Text (if available) */}
          {deen.arabic_text && (
            <p className="text-2xl text-evergreen-700 text-center py-4 font-arabic" dir="rtl">
              {deen.arabic_text}
            </p>
          )}

          {/* Main Content */}
          <p className="text-evergreen-700 leading-relaxed">
            {deen.content}
          </p>

          {/* Source */}
          {deen.source && (
            <p className="text-sm text-evergreen-500 mt-3 italic">
              — {deen.source}
            </p>
          )}

          {/* Shah's Reflection */}
          {deen.reflection && (
            <div className="mt-4 pt-4 border-t border-evergreen-200">
              <p className="text-sm text-evergreen-500 mb-1">💭 Shah's Note:</p>
              <p className="text-evergreen-600 italic text-sm">
                "{deen.reflection}"
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!currentWord && !deen && (
        <div className="text-center py-12 text-evergreen-400">
          <p>No lessons loaded yet. Check back soon!</p>
        </div>
      )}
    </div>
  )
}
