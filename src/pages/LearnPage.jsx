import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getDailyLesson,
  getDailyDeen,
  getLessonsByCategory,
  getLessonCategories,
  getLessonResponses,
  addLessonResponse,
  markLessonComplete,
  getLearningStreak
} from '../lib/supabase'

const languages = [
  { id: 'urdu', label: 'Urdu', flag: '🇵🇰' },
  { id: 'tagalog', label: 'Tagalog', flag: '🇵🇭' },
  { id: 'deen', label: 'Deen', flag: '🌙' },
]

export default function LearnPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('urdu')
  const [dailyLesson, setDailyLesson] = useState(null)
  const [deen, setDeen] = useState(null)
  const [streak, setStreak] = useState(null)
  const [showBrowse, setShowBrowse] = useState(false)
  const [categories, setCategories] = useState([])
  const [lessons, setLessons] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [responses, setResponses] = useState([])
  const [comment, setComment] = useState('')
  const [lessonComplete, setLessonComplete] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    try {
      if (activeTab === 'deen') {
        const deenData = await getDailyDeen()
        setDeen(deenData)
      } else {
        const [lessonData, streakData, cats] = await Promise.all([
          getDailyLesson(activeTab),
          user ? getLearningStreak(user.role) : null,
          getLessonCategories(activeTab)
        ])
        setDailyLesson(lessonData)
        setStreak(streakData)
        setCategories(cats || [])
        
        if (lessonData?.id) {
          const resp = await getLessonResponses(lessonData.id)
          setResponses(resp || [])
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
    setLoading(false)
  }

  const handleCategorySelect = async (cat) => {
    setSelectedCategory(cat)
    try {
      const data = await getLessonsByCategory(activeTab, cat)
      setLessons(data || [])
    } catch (error) {
      console.error('Error fetching lessons:', error)
    }
  }

  const handleAddComment = async () => {
    if (!comment.trim() || !dailyLesson) return
    try {
      await addLessonResponse(dailyLesson.id, user.role, 'comment', null, comment)
      setResponses(prev => [{ user_role: user.role, response_type: 'comment', comment, created_at: new Date() }, ...prev])
      setComment('')
    } catch (error) {
      console.error('Error adding comment:', error)
    }
  }

  const handleComplete = async () => {
    if (!dailyLesson) return
    try {
      await markLessonComplete(user.role, dailyLesson.id)
      setLessonComplete(true)
      if (streak) {
        setStreak(prev => ({
          ...prev,
          current_streak: prev.current_streak + 1,
          total_words_learned: prev.total_words_learned + 1
        }))
      }
    } catch (error) {
      console.error('Error completing lesson:', error)
    }
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-forest px-6 pt-16 pb-10">
        <div className="stagger">
          <h1 className="font-serif text-display-sm text-cream-50 mb-2">Learn</h1>
          <p className="text-body text-cream-300">A little something new each day</p>
          
          {/* Streak */}
          {streak && (
            <div className="mt-6 flex items-center gap-6">
              <div className="text-center">
                <p className="font-serif text-title text-gold">{streak.current_streak}</p>
                <p className="text-caption text-cream-400">Day streak</p>
              </div>
              <div className="w-px h-10 bg-forest-500" />
              <div className="text-center">
                <p className="font-serif text-title text-cream-100">{streak.total_words_learned}</p>
                <p className="text-caption text-cream-400">Words learned</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-cream px-6 py-4 sticky top-0 z-20 border-b border-cream-300">
        <div className="flex gap-2">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => { setActiveTab(lang.id); setShowBrowse(false); }}
              className={`
                flex items-center gap-2 px-5 py-3 rounded-full text-body-sm font-medium transition-all
                ${activeTab === lang.id 
                  ? 'bg-forest text-cream-100' 
                  : 'bg-cream-200 text-ink-500 hover:bg-cream-300'
                }
              `}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-cream min-h-[60vh]">
        {loading ? (
          <div className="px-6 py-20 text-center">
            <p className="text-ink-400 animate-pulse-soft">Loading...</p>
          </div>
        ) : activeTab === 'deen' ? (
          /* Deen Content */
          deen && (
            <div className="px-6 py-8">
              <div className="card-elevated stagger">
                <div className="flex items-center gap-3 mb-6">
                  <span className="tag tag-gold capitalize">{deen.content_type}</span>
                  {deen.category && <span className="text-caption text-ink-400">{deen.category}</span>}
                </div>

                <h2 className="font-serif text-title text-forest mb-6">{deen.title}</h2>

                {deen.arabic_text && (
                  <p className="text-2xl text-forest text-center py-6 leading-relaxed" dir="rtl">
                    {deen.arabic_text}
                  </p>
                )}

                <p className="text-body-lg text-ink-500 leading-relaxed mb-6">
                  {deen.content}
                </p>

                {deen.source && (
                  <p className="text-body-sm text-ink-400 italic mb-6">— {deen.source}</p>
                )}

                {deen.reflection && (
                  <div className="bg-gold-50 rounded-2xl p-6 border-l-4 border-gold">
                    <p className="text-caption text-gold-700 mb-2">Shah's Reflection</p>
                    <p className="text-body text-ink-600 italic">{deen.reflection}</p>
                  </div>
                )}
              </div>
            </div>
          )
        ) : !showBrowse ? (
          /* Daily Lesson */
          dailyLesson && (
            <div className="px-6 py-8">
              <div className="stagger">
                {/* Main Word Card */}
                <div className="card-elevated mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <span className="tag tag-forest">Today's Word</span>
                    {dailyLesson.is_couples_vocab && (
                      <span className="tag tag-rose">Couples Vocab</span>
                    )}
                  </div>

                  {/* Word Display */}
                  <div className="text-center py-8 border-b border-cream-200 mb-6">
                    {activeTab === 'urdu' && dailyLesson.word_native && (
                      <p className="text-4xl text-forest mb-4 font-medium" dir="rtl">
                        {dailyLesson.word_native}
                      </p>
                    )}
                    <h2 className="font-serif text-display-sm text-forest mb-3">
                      {dailyLesson.word_romanized}
                    </h2>
                    <p className="text-body-lg text-ink-500">{dailyLesson.meaning}</p>
                  </div>

                  {/* Usage Context */}
                  {dailyLesson.usage_context && (
                    <div className="bg-gold-50 rounded-2xl p-5 mb-6">
                      <p className="text-caption text-gold-700 mb-2">When to use this</p>
                      <p className="text-body text-ink-600">{dailyLesson.usage_context}</p>
                    </div>
                  )}

                  {/* Example */}
                  {dailyLesson.example_sentence && (
                    <div className="bg-cream-100 rounded-2xl p-5 mb-6">
                      <p className="text-caption text-ink-400 mb-2">Example</p>
                      <p className="text-body text-ink-600 italic mb-1">{dailyLesson.example_sentence}</p>
                      {dailyLesson.example_translation && (
                        <p className="text-body-sm text-ink-400">{dailyLesson.example_translation}</p>
                      )}
                    </div>
                  )}

                  {/* Audio */}
                  {dailyLesson.audio_url && (
                    <div className="mb-6">
                      <p className="text-caption text-ink-400 mb-3">Listen to Shah say it</p>
                      <audio controls src={dailyLesson.audio_url} className="w-full" />
                    </div>
                  )}

                  {/* Complete Button */}
                  {!lessonComplete ? (
                    <button onClick={handleComplete} className="btn-primary w-full">
                      Mark as Learned
                    </button>
                  ) : (
                    <div className="bg-forest-50 rounded-2xl p-5 text-center">
                      <span className="text-2xl mb-2 block">✓</span>
                      <p className="text-body font-medium text-forest">Word learned!</p>
                    </div>
                  )}
                </div>

                {/* Practice Section */}
                <div className="card mb-6">
                  <h3 className="font-serif text-title-sm text-forest mb-4">Practice & Comments</h3>
                  
                  {/* Add Comment */}
                  <div className="flex gap-3 mb-4">
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment or question..."
                      className="input flex-1"
                    />
                    <button onClick={handleAddComment} className="btn-secondary px-6">
                      Send
                    </button>
                  </div>

                  {/* Responses */}
                  {responses.length > 0 && (
                    <div className="space-y-3 mt-6">
                      {responses.map((resp, i) => (
                        <div 
                          key={i} 
                          className={`rounded-xl p-4 ${
                            resp.user_role === user?.role ? 'bg-forest-50' : 'bg-cream-100'
                          }`}
                        >
                          <p className="text-caption text-ink-400 mb-1">
                            {resp.user_role === user?.role ? 'You' : resp.user_role === 'shah' ? 'Shah' : 'Dane'}
                          </p>
                          {resp.comment && <p className="text-body text-ink-600">{resp.comment}</p>}
                          {resp.audio_url && <audio controls src={resp.audio_url} className="w-full mt-2" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Browse More */}
                <button 
                  onClick={() => setShowBrowse(true)}
                  className="w-full py-4 text-center text-body text-forest font-medium hover:text-forest-700"
                >
                  Browse more words →
                </button>
              </div>
            </div>
          )
        ) : (
          /* Browse Mode */
          <div className="px-6 py-8">
            <div className="stagger">
              <button 
                onClick={() => { setShowBrowse(false); setSelectedCategory(null); }}
                className="flex items-center gap-2 text-body-sm text-ink-400 hover:text-forest mb-6"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to today's lesson
              </button>

              <h2 className="font-serif text-title text-forest mb-6">Browse by Category</h2>

              {/* Categories */}
              {!selectedCategory ? (
                <div className="grid grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className="card text-left hover:shadow-card transition-shadow capitalize"
                    >
                      <p className="font-serif text-title-sm text-forest">{cat}</p>
                    </button>
                  ))}
                </div>
              ) : (
                <>
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className="text-body-sm text-ink-400 hover:text-forest mb-4"
                  >
                    ← All categories
                  </button>
                  
                  <div className="space-y-4">
                    {lessons.map((lesson) => (
                      <div key={lesson.id} className="card">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-serif text-title-sm text-forest">{lesson.word_romanized}</h3>
                          {lesson.is_couples_vocab && (
                            <span className="tag tag-rose text-tiny">Couples</span>
                          )}
                        </div>
                        <p className="text-body text-ink-500">{lesson.meaning}</p>
                        {lesson.usage_context && (
                          <p className="text-body-sm text-ink-400 mt-2 italic">{lesson.usage_context}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Spacer */}
      <div className="h-24 bg-cream" />
    </div>
  )
}
