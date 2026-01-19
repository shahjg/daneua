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
  getLearningStreak,
  uploadAudio
} from '../lib/supabase'

const languages = [
  { id: 'urdu', label: 'Urdu', flag: '🇵🇰' },
  { id: 'tagalog', label: 'Tagalog', flag: '🇵🇭' },
  { id: 'islam', label: 'Islam', flag: '🕌' },
]

export default function LearnPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('urdu')
  const [dailyLesson, setDailyLesson] = useState(null)
  const [deen, setDeen] = useState(null)
  const [streak, setStreak] = useState(null)
  const [view, setView] = useState('daily') // 'daily' | 'browse' | 'alphabet'
  const [categories, setCategories] = useState([])
  const [lessons, setLessons] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [responses, setResponses] = useState([])
  const [comment, setComment] = useState('')
  const [lessonComplete, setLessonComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  
  // Recording state
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])

  const theirName = user?.role === 'shah' ? 'Dane' : 'Shahjahan'

  useEffect(() => {
    fetchData()
  }, [activeTab])

  const fetchData = async () => {
    setLoading(true)
    setView('daily')
    try {
      if (activeTab === 'islam') {
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

  // Recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorderRef.current = new MediaRecorder(stream)
      chunksRef.current = []

      mediaRecorderRef.current.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const submitRecording = async () => {
    if (!audioBlob || !dailyLesson) return
    try {
      const fileName = `${user.role}-${dailyLesson.id}-${Date.now()}.webm`
      const url = await uploadAudio(audioBlob, fileName)
      await addLessonResponse(dailyLesson.id, user.role, 'recording', url, null)
      setResponses(prev => [{ user_role: user.role, response_type: 'recording', audio_url: url, created_at: new Date() }, ...prev])
      setAudioBlob(null)
      setAudioUrl(null)
    } catch (error) {
      console.error('Error uploading recording:', error)
      alert('Could not upload recording')
    }
  }

  const cancelRecording = () => {
    setAudioBlob(null)
    setAudioUrl(null)
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="bg-forest px-6 pt-14 pb-10">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-display-sm text-cream-50 mb-2">Learn</h1>
          <p className="text-body text-cream-300">A little something new each day</p>
          
          {/* Streak */}
          {streak && activeTab !== 'islam' && (
            <div className="mt-6 flex items-center justify-center gap-8">
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
        <div className="max-w-lg mx-auto flex justify-center gap-2">
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => { setActiveTab(lang.id); setView('daily'); }}
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
        ) : activeTab === 'islam' ? (
          /* Islam Content */
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              {deen && (
                <div className="bg-white rounded-3xl p-8 shadow-card">
                  <div className="text-center mb-6">
                    <span className="tag tag-gold capitalize">{deen.content_type}</span>
                  </div>

                  <h2 className="font-serif text-title text-forest text-center mb-6">{deen.title}</h2>

                  {deen.arabic_text && (
                    <p className="text-3xl text-forest text-center py-6 leading-relaxed font-medium" dir="rtl">
                      {deen.arabic_text}
                    </p>
                  )}

                  <p className="text-body-lg text-ink-500 leading-relaxed text-center mb-6">
                    {deen.content}
                  </p>

                  {deen.source && (
                    <p className="text-body-sm text-ink-400 italic text-center mb-6">— {deen.source}</p>
                  )}

                  {deen.reflection && (
                    <div className="bg-gold-50 rounded-2xl p-6 border-l-4 border-gold">
                      <p className="text-caption text-gold-700 mb-2">Shahjahan's Reflection</p>
                      <p className="text-body text-ink-600 italic">{deen.reflection}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : view === 'daily' ? (
          /* Daily Lesson */
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              {dailyLesson && (
                <>
                  {/* Main Word Card */}
                  <div className="bg-white rounded-3xl p-8 shadow-card mb-6">
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <span className="tag tag-forest">Today's Word</span>
                      {dailyLesson.is_couples_vocab && (
                        <span className="tag tag-rose">For Us</span>
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
                      <div className="bg-gold-50 rounded-2xl p-5 mb-6 text-center">
                        <p className="text-caption text-gold-700 mb-2">When to use this</p>
                        <p className="text-body text-ink-600">{dailyLesson.usage_context}</p>
                      </div>
                    )}

                    {/* Example */}
                    {dailyLesson.example_sentence && (
                      <div className="bg-cream-100 rounded-2xl p-5 mb-6 text-center">
                        <p className="text-caption text-ink-400 mb-2">Example</p>
                        <p className="text-body text-ink-600 italic mb-1">{dailyLesson.example_sentence}</p>
                        {dailyLesson.example_translation && (
                          <p className="text-body-sm text-ink-400">{dailyLesson.example_translation}</p>
                        )}
                      </div>
                    )}

                    {/* Shahjahan's Audio */}
                    {dailyLesson.audio_url && (
                      <div className="mb-6">
                        <p className="text-caption text-ink-400 mb-3 text-center">Listen to Shahjahan</p>
                        <audio controls src={dailyLesson.audio_url} className="w-full" />
                      </div>
                    )}

                    {/* Complete Button */}
                    {!lessonComplete ? (
                      <button onClick={handleComplete} className="btn-primary w-full">
                        Mark as Learned ✓
                      </button>
                    ) : (
                      <div className="bg-forest-50 rounded-2xl p-5 text-center">
                        <span className="text-2xl mb-2 block">✓</span>
                        <p className="text-body font-medium text-forest">Word learned!</p>
                      </div>
                    )}
                  </div>

                  {/* Recording Section */}
                  <div className="bg-white rounded-3xl p-6 shadow-card mb-6">
                    <h3 className="font-serif text-title-sm text-forest text-center mb-4">Practice Saying It</h3>
                    
                    {!audioUrl ? (
                      <div className="text-center">
                        <button
                          onClick={isRecording ? stopRecording : startRecording}
                          className={`
                            w-20 h-20 rounded-full flex items-center justify-center mx-auto transition-all
                            ${isRecording 
                              ? 'bg-rose-500 animate-pulse' 
                              : 'bg-forest hover:bg-forest-700'
                            }
                          `}
                        >
                          {isRecording ? (
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <rect x="6" y="6" width="12" height="12" rx="2" />
                            </svg>
                          ) : (
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                            </svg>
                          )}
                        </button>
                        <p className="text-body-sm text-ink-400 mt-3">
                          {isRecording ? 'Recording... Tap to stop' : 'Tap to record yourself'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <audio controls src={audioUrl} className="w-full" />
                        <div className="flex gap-3">
                          <button onClick={submitRecording} className="btn-primary flex-1">
                            Send to {theirName}
                          </button>
                          <button onClick={cancelRecording} className="btn-ghost">
                            Redo
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Comments Section */}
                  <div className="bg-white rounded-3xl p-6 shadow-card mb-6">
                    <h3 className="font-serif text-title-sm text-forest text-center mb-4">Comments</h3>
                    
                    <div className="flex gap-3 mb-4">
                      <input
                        type="text"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add a note..."
                        className="input flex-1"
                      />
                      <button onClick={handleAddComment} className="btn-secondary px-5">
                        Send
                      </button>
                    </div>

                    {responses.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {responses.map((resp, i) => (
                          <div 
                            key={i} 
                            className={`rounded-xl p-4 ${
                              resp.user_role === user?.role ? 'bg-forest-50' : 'bg-cream-100'
                            }`}
                          >
                            <p className="text-caption text-ink-400 mb-1">
                              {resp.user_role === user?.role ? 'You' : resp.user_role === 'shah' ? 'Shahjahan' : 'Dane'}
                            </p>
                            {resp.comment && <p className="text-body text-ink-600">{resp.comment}</p>}
                            {resp.audio_url && <audio controls src={resp.audio_url} className="w-full mt-2" />}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Browse More */}
                  <div className="bg-gradient-to-br from-gold-100 via-rose-50 to-cream rounded-3xl p-6 shadow-soft">
                    <p className="text-center text-caption text-gold-700 mb-3">Want to learn more?</p>
                    <h3 className="font-serif text-title text-forest text-center mb-4">
                      ✨ Explore {activeTab === 'urdu' ? 'Urdu' : 'Tagalog'}
                    </h3>
                    <p className="text-body-sm text-ink-500 text-center mb-5">
                      Discover words for love, food, family & more
                    </p>
                    <button 
                      onClick={() => setView('browse')}
                      className="w-full py-4 bg-forest text-cream-100 rounded-2xl font-medium flex items-center justify-center gap-2"
                    >
                      <span>📚</span> Start Exploring
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          /* Browse Mode */
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <button 
                onClick={() => { setView('daily'); setSelectedCategory(null); }}
                className="flex items-center gap-2 text-body-sm text-ink-400 hover:text-forest mb-6"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to today's lesson
              </button>

              <div className="text-center mb-8">
                <h2 className="font-serif text-display-sm text-forest mb-2">
                  {activeTab === 'urdu' ? '🇵🇰 Urdu' : '🇵🇭 Tagalog'} Library
                </h2>
                <p className="text-body text-ink-500">Learn words that matter</p>
              </div>

              {!selectedCategory ? (
                <div className="space-y-4">
                  {/* Vibe Categories */}
                  {[
                    { id: 'love', label: 'Love & Endearment', emoji: '💕', desc: 'Sweet words for your Jaan', gradient: 'from-rose-100 to-rose-200' },
                    { id: 'food', label: 'Food & Dining', emoji: '🍽️', desc: 'Talk about delicious food', gradient: 'from-gold-100 to-gold-200' },
                    { id: 'family', label: 'Family & Respect', emoji: '👨‍👩‍👧', desc: 'Words for loved ones', gradient: 'from-forest-50 to-forest-100' },
                    { id: 'daily', label: 'Daily Essentials', emoji: '☀️', desc: 'Common everyday phrases', gradient: 'from-cream-200 to-cream-300' },
                    { id: 'emotions', label: 'Feelings & Emotions', emoji: '🥰', desc: 'Express how you feel', gradient: 'from-purple-100 to-purple-200' },
                    { id: 'culture', label: 'Culture & Customs', emoji: '🎊', desc: 'Traditions & etiquette', gradient: 'from-blue-100 to-blue-200' },
                  ].filter(c => categories.includes(c.id) || categories.length === 0).map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={`w-full bg-gradient-to-r ${cat.gradient} rounded-2xl p-5 text-left hover:scale-[1.02] transition-transform active:scale-[0.98]`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-4xl">{cat.emoji}</span>
                        <div>
                          <p className="font-serif text-title-sm text-forest">{cat.label}</p>
                          <p className="text-body-sm text-forest-600">{cat.desc}</p>
                        </div>
                      </div>
                    </button>
                  ))}

                  {/* Show original categories that don't match our presets */}
                  {categories.filter(c => !['love', 'food', 'family', 'daily', 'emotions', 'culture'].includes(c)).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorySelect(cat)}
                      className="w-full bg-white rounded-2xl p-5 text-left shadow-soft hover:shadow-card transition-shadow capitalize"
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
                      <div key={lesson.id} className="bg-white rounded-2xl p-5 shadow-soft">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-serif text-title-sm text-forest">{lesson.word_romanized}</h3>
                          {lesson.is_couples_vocab && (
                            <span className="tag tag-rose text-tiny">For Us</span>
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
    </div>
  )
}
