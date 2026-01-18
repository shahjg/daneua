import { useState, useEffect } from 'react'
import { getDailyWord, getDailyDeen, getAllWords } from '../lib/supabase'

const tabs = [
  { id: 'urdu', label: 'Urdu' },
  { id: 'tagalog', label: 'Tagalog' },
  { id: 'deen', label: 'Deen' },
]

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState('urdu')
  const [urduWord, setUrduWord] = useState(null)
  const [tagalogWord, setTagalogWord] = useState(null)
  const [deen, setDeen] = useState(null)
  const [pastWords, setPastWords] = useState([])
  const [showPastWords, setShowPastWords] = useState(false)
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
        console.error('Error fetching data:', error)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    if (showPastWords && (activeTab === 'urdu' || activeTab === 'tagalog')) {
      getAllWords(activeTab).then(setPastWords).catch(console.error)
    }
  }, [showPastWords, activeTab])

  const currentWord = activeTab === 'urdu' ? urduWord : tagalogWord

  if (loading) {
    return (
      <div className="px-6 pt-12 pb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-cream-200 rounded w-1/3" />
          <div className="h-48 bg-cream-200 rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 pt-12 pb-8">
      {/* Header */}
      <header className="mb-8 animate-fade-up">
        <h1 className="font-serif text-3xl text-forest">Learn</h1>
        <p className="text-small text-ink-400 mt-1">A little something new each day</p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setShowPastWords(false); }}
            className={`
              px-5 py-2.5 rounded-full text-small font-medium transition-all duration-200
              ${activeTab === tab.id 
                ? 'bg-forest text-cream-100' 
                : 'bg-cream-200 text-ink-500 hover:bg-cream-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab !== 'deen' ? (
        <div className="space-y-6">
          {/* Word of the Day */}
          {currentWord && !showPastWords && (
            <div className="card-elevated animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center justify-between mb-6">
                <span className="tag tag-forest">Word of the Day</span>
                {currentWord.category && (
                  <span className="text-tiny text-ink-300 capitalize">{currentWord.category}</span>
                )}
              </div>

              {/* Main Word */}
              <div className="text-center py-6 border-b border-cream-200 mb-6">
                {activeTab === 'urdu' && currentWord.word_native && (
                  <p className="text-3xl text-forest-600 mb-3 font-medium" dir="rtl">
                    {currentWord.word_native}
                  </p>
                )}
                <h2 className="font-serif text-2xl text-forest mb-2">
                  {currentWord.word_romanized}
                </h2>
                <p className="text-body text-ink-500">{currentWord.meaning}</p>
              </div>

              {/* Example */}
              {currentWord.example_sentence && (
                <div className="bg-cream-100 rounded-xl p-4 mb-4">
                  <p className="text-tiny text-ink-400 mb-2 font-medium uppercase tracking-wider">Example</p>
                  <p className="text-body text-ink-600 italic mb-1">{currentWord.example_sentence}</p>
                  {currentWord.example_translation && (
                    <p className="text-small text-ink-400">{currentWord.example_translation}</p>
                  )}
                </div>
              )}

              {/* Audio */}
              {currentWord.audio_url && (
                <div className="mt-4">
                  <p className="text-tiny text-ink-400 mb-2 font-medium">Listen to Shah</p>
                  <audio controls src={currentWord.audio_url} className="w-full" />
                </div>
              )}
            </div>
          )}

          {/* Past Words Toggle */}
          <button 
            onClick={() => setShowPastWords(!showPastWords)}
            className="w-full text-center py-3 text-small text-forest font-medium hover:text-forest-700 transition-colors"
          >
            {showPastWords ? '← Back to today' : 'View past words →'}
          </button>

          {/* Past Words List */}
          {showPastWords && (
            <div className="space-y-3 animate-fade-up">
              {pastWords.map((word, index) => (
                <div 
                  key={word.id} 
                  className="card"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-serif text-lg text-forest">{word.word_romanized}</h4>
                      <p className="text-small text-ink-400">{word.meaning}</p>
                    </div>
                    {word.shown_on && (
                      <span className="text-tiny text-ink-300">
                        {new Date(word.shown_on).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              {pastWords.length === 0 && (
                <p className="text-center text-ink-400 py-8">No past words yet</p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Deen Content */
        deen && (
          <div className="card-elevated animate-fade-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-6">
              <span className="tag tag-gold capitalize">{deen.content_type}</span>
              {deen.category && (
                <span className="text-tiny text-ink-300 capitalize">{deen.category}</span>
              )}
            </div>

            <h2 className="font-serif text-xl text-forest mb-4">{deen.title}</h2>

            {deen.arabic_text && (
              <p className="text-2xl text-forest-600 text-center py-6 font-medium leading-relaxed" dir="rtl">
                {deen.arabic_text}
              </p>
            )}

            <p className="text-body text-ink-600 leading-relaxed mb-4">
              {deen.content}
            </p>

            {deen.source && (
              <p className="text-small text-ink-400 italic mb-6">— {deen.source}</p>
            )}

            {deen.reflection && (
              <div className="bg-cream-100 rounded-xl p-4 border-l-4 border-gold">
                <p className="text-tiny text-gold-600 mb-2 font-medium uppercase tracking-wider">Shah's Reflection</p>
                <p className="text-body text-ink-500 italic">{deen.reflection}</p>
              </div>
            )}
          </div>
        )
      )}
    </div>
  )
}
