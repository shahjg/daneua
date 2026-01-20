import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// ============================================
// VOCABULARY LIBRARIES (same content)
// ============================================
const arabicLibrary = {
  greetings: [
    { arabic: 'السلام عليكم', roman: 'As-salamu alaykum', english: 'Peace be upon you', usage: 'Standard Islamic greeting' },
    { arabic: 'وعليكم السلام', roman: 'Wa alaykum as-salam', english: 'And peace be upon you', usage: 'Response to greeting' },
    { arabic: 'صباح الخير', roman: 'Sabah al-khayr', english: 'Good morning', usage: 'Morning greeting' },
    { arabic: 'مساء الخير', roman: 'Masa al-khayr', english: 'Good evening', usage: 'Evening greeting' },
    { arabic: 'مرحباً', roman: 'Marhaba', english: 'Hello', usage: 'Casual greeting' },
    { arabic: 'كيف حالك؟', roman: 'Kayf haluk?', english: 'How are you?', usage: 'Asking about wellbeing' },
    { arabic: 'الحمد لله', roman: 'Alhamdulillah', english: 'Praise be to God', usage: 'Response: I am well' },
    { arabic: 'مع السلامة', roman: "Ma'a salama", english: 'Goodbye', usage: 'Farewell' },
  ],
  love: [
    { arabic: 'أحبك', roman: 'Uhibbuk', english: 'I love you', usage: 'Expressing love' },
    { arabic: 'حبيبي', roman: 'Habibi', english: 'My love (m)', usage: 'Term of endearment' },
    { arabic: 'حبيبتي', roman: 'Habibti', english: 'My love (f)', usage: 'Term of endearment' },
    { arabic: 'قلبي', roman: 'Qalbi', english: 'My heart', usage: 'Affectionate term' },
    { arabic: 'عمري', roman: 'Omri', english: 'My life', usage: 'Deep affection' },
    { arabic: 'روحي', roman: 'Ruhi', english: 'My soul', usage: 'Deep love' },
    { arabic: 'نور عيني', roman: 'Noor ayni', english: 'Light of my eyes', usage: 'Precious one' },
    { arabic: 'أشتاق إليك', roman: 'Ashtaq ilayk', english: 'I miss you', usage: 'Expressing longing' },
  ],
  family: [
    { arabic: 'عائلة', roman: "Aa'ila", english: 'Family', usage: 'The family unit' },
    { arabic: 'أب', roman: 'Ab', english: 'Father', usage: 'Parent' },
    { arabic: 'أم', roman: 'Umm', english: 'Mother', usage: 'Parent' },
    { arabic: 'ابن', roman: 'Ibn', english: 'Son', usage: 'Child' },
    { arabic: 'بنت', roman: 'Bint', english: 'Daughter', usage: 'Child' },
    { arabic: 'أخ', roman: 'Akh', english: 'Brother', usage: 'Sibling' },
    { arabic: 'أخت', roman: 'Ukht', english: 'Sister', usage: 'Sibling' },
    { arabic: 'زوج', roman: 'Zawj', english: 'Husband', usage: 'Spouse' },
    { arabic: 'زوجة', roman: 'Zawja', english: 'Wife', usage: 'Spouse' },
  ],
  daily: [
    { arabic: 'نعم', roman: "Na'am", english: 'Yes', usage: 'Affirmation' },
    { arabic: 'لا', roman: 'La', english: 'No', usage: 'Negation' },
    { arabic: 'شكراً', roman: 'Shukran', english: 'Thank you', usage: 'Gratitude' },
    { arabic: 'عفواً', roman: 'Afwan', english: "You're welcome", usage: 'Response to thanks' },
    { arabic: 'من فضلك', roman: 'Min fadlak', english: 'Please', usage: 'Polite request' },
    { arabic: 'آسف', roman: 'Asif', english: 'Sorry', usage: 'Apology' },
  ],
  islamic: [
    { arabic: 'الله', roman: 'Allah', english: 'God', usage: 'The one God' },
    { arabic: 'إنشاء الله', roman: "Insha'Allah", english: 'God willing', usage: 'Future plans' },
    { arabic: 'ما شاء الله', roman: "Masha'Allah", english: 'God has willed', usage: 'Expressing amazement' },
    { arabic: 'سبحان الله', roman: "Subhan'Allah", english: 'Glory to God', usage: 'Praise' },
    { arabic: 'أستغفر الله', roman: 'Astaghfirullah', english: 'I seek forgiveness', usage: 'Repentance' },
    { arabic: 'الحمد لله', roman: 'Alhamdulillah', english: 'Praise be to God', usage: 'Gratitude' },
  ]
}

const urduLibrary = {
  greetings: [
    { native: 'السلام علیکم', roman: 'Assalamu alaikum', english: 'Peace be upon you' },
    { native: 'خوش آمدید', roman: 'Khush amdeed', english: 'Welcome' },
    { native: 'کیسے ہو؟', roman: 'Kaise ho?', english: 'How are you?' },
    { native: 'ٹھیک ہوں', roman: 'Theek hoon', english: 'I am fine' },
    { native: 'شکریہ', roman: 'Shukriya', english: 'Thank you' },
    { native: 'خدا حافظ', roman: 'Khuda hafiz', english: 'Goodbye' },
  ],
  love: [
    { native: 'میں تم سے پیار کرتا ہوں', roman: 'Main tum se pyar karta hoon', english: 'I love you (m)' },
    { native: 'میں تم سے پیار کرتی ہوں', roman: 'Main tum se pyar karti hoon', english: 'I love you (f)' },
    { native: 'جان', roman: 'Jaan', english: 'My life/dear' },
    { native: 'میری جان', roman: 'Meri jaan', english: 'My love' },
    { native: 'تم بہت خوبصورت ہو', roman: 'Tum bohat khoobsurat ho', english: 'You are very beautiful' },
    { native: 'مجھے تمہاری یاد آتی ہے', roman: 'Mujhe tumhari yaad aati hai', english: 'I miss you' },
  ],
  family: [
    { native: 'ابو/ابا', roman: 'Abu/Abba', english: 'Father' },
    { native: 'امی/اماں', roman: 'Ami/Amaan', english: 'Mother' },
    { native: 'بھائی', roman: 'Bhai', english: 'Brother' },
    { native: 'بہن', roman: 'Behan', english: 'Sister' },
    { native: 'بیٹا', roman: 'Beta', english: 'Son' },
    { native: 'بیٹی', roman: 'Beti', english: 'Daughter' },
  ],
  daily: [
    { native: 'ہاں', roman: 'Haan', english: 'Yes' },
    { native: 'نہیں', roman: 'Nahi', english: 'No' },
    { native: 'ٹھیک ہے', roman: 'Theek hai', english: 'Okay' },
    { native: 'معاف کیجیے', roman: 'Maaf kijiye', english: 'Excuse me/Sorry' },
  ]
}

const tagalogLibrary = {
  greetings: [
    { native: 'Kamusta', english: 'Hello/How are you' },
    { native: 'Magandang umaga', english: 'Good morning' },
    { native: 'Magandang hapon', english: 'Good afternoon' },
    { native: 'Magandang gabi', english: 'Good evening' },
    { native: 'Salamat', english: 'Thank you' },
    { native: 'Paalam', english: 'Goodbye' },
  ],
  love: [
    { native: 'Mahal kita', english: 'I love you' },
    { native: 'Mahal ko', english: 'My love' },
    { native: 'Miss na kita', english: 'I miss you' },
    { native: 'Ikaw ang buhay ko', english: 'You are my life' },
    { native: 'Maganda ka', english: 'You are beautiful' },
    { native: 'Gwapo ka', english: 'You are handsome' },
  ],
  family: [
    { native: 'Tatay/Papa', english: 'Father' },
    { native: 'Nanay/Mama', english: 'Mother' },
    { native: 'Kuya', english: 'Older brother' },
    { native: 'Ate', english: 'Older sister' },
    { native: 'Anak', english: 'Child' },
    { native: 'Lolo', english: 'Grandfather' },
    { native: 'Lola', english: 'Grandmother' },
  ],
  daily: [
    { native: 'Oo', english: 'Yes' },
    { native: 'Hindi', english: 'No' },
    { native: 'Sige', english: 'Okay/Go ahead' },
    { native: 'Teka', english: 'Wait' },
  ]
}

// Get all words as flat array for Word of Day
const getAllWords = () => {
  const words = []
  Object.entries(arabicLibrary).forEach(([cat, items]) => {
    items.forEach(w => words.push({ ...w, language: 'arabic', category: cat }))
  })
  Object.entries(urduLibrary).forEach(([cat, items]) => {
    items.forEach(w => words.push({ ...w, language: 'urdu', category: cat }))
  })
  Object.entries(tagalogLibrary).forEach(([cat, items]) => {
    items.forEach(w => words.push({ ...w, language: 'tagalog', category: cat }))
  })
  return words
}

// Get word of the day based on date
const getWordOfDay = () => {
  const words = getAllWords()
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
  return words[dayOfYear % words.length]
}

export default function LearnPage() {
  const { user } = useAuth()
  const [view, setView] = useState('main')
  const [selectedLanguage, setSelectedLanguage] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [recordings, setRecordings] = useState({})
  const [recording, setRecording] = useState(false)
  const [currentRecordingWord, setCurrentRecordingWord] = useState(null)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])

  const wordOfDay = getWordOfDay()

  useEffect(() => {
    loadRecordings()
  }, [])

  const loadRecordings = async () => {
    const { data } = await supabase
      .from('word_recordings')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (data) {
      const grouped = {}
      data.forEach(r => {
        if (!grouped[r.word_key]) grouped[r.word_key] = {}
        grouped[r.word_key][r.user_role] = r.audio_url
      })
      setRecordings(grouped)
    }
  }

  const startRecording = async (wordKey) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : {}
      mediaRecorder.current = new MediaRecorder(stream, options)
      audioChunks.current = []
      
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data)
      }
      
      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' })
        stream.getTracks().forEach(track => track.stop())
        
        // Upload to Supabase
        const fileName = `${user.role}_${wordKey}_${Date.now()}.webm`
        const { error: uploadError } = await supabase.storage
          .from('audio')
          .upload(fileName, blob)
        
        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('audio').getPublicUrl(fileName)
          
          // Save to database
          await supabase.from('word_recordings').insert({
            word_key: wordKey,
            user_role: user.role,
            audio_url: urlData.publicUrl
          })
          
          loadRecordings()
        }
      }
      
      mediaRecorder.current.start()
      setRecording(true)
      setCurrentRecordingWord(wordKey)
    } catch (err) {
      console.error('Recording error:', err)
      alert('Could not access microphone')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop()
      setRecording(false)
      setCurrentRecordingWord(null)
    }
  }

  const BackButton = ({ onClick }) => (
    <button onClick={onClick} className="flex items-center gap-3 mb-6 text-forest">
      <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center">
        <svg className="w-5 h-5 text-cream-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </div>
      <span className="text-body font-medium">Back</span>
    </button>
  )

  const RecordingSection = ({ wordKey }) => {
    const shahRecording = recordings[wordKey]?.shah
    const daneRecording = recordings[wordKey]?.dane
    const isRecordingThis = currentRecordingWord === wordKey

    return (
      <div className="mt-4 pt-4 border-t border-cream-200">
        <p className="text-caption text-ink-400 mb-3 text-center">Voice Practice</p>
        
        <div className="grid grid-cols-2 gap-3">
          {/* Shahjahan's Recording */}
          <div className="text-center">
            <p className="text-body-sm font-medium text-forest mb-2">Shahjahan</p>
            {shahRecording ? (
              <audio controls src={shahRecording} className="w-full h-10" />
            ) : user?.role === 'shah' ? (
              <button
                onClick={() => isRecordingThis ? stopRecording() : startRecording(wordKey)}
                className={`w-full py-2 rounded-lg text-body-sm ${
                  isRecordingThis 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'bg-forest text-cream-100'
                }`}
              >
                {isRecordingThis ? 'Stop' : 'Record'}
              </button>
            ) : (
              <p className="text-caption text-ink-300">Not recorded yet</p>
            )}
          </div>

          {/* Dane's Recording */}
          <div className="text-center">
            <p className="text-body-sm font-medium text-forest mb-2">Dane</p>
            {daneRecording ? (
              <audio controls src={daneRecording} className="w-full h-10" />
            ) : user?.role === 'dane' ? (
              <button
                onClick={() => isRecordingThis ? stopRecording() : startRecording(wordKey)}
                className={`w-full py-2 rounded-lg text-body-sm ${
                  isRecordingThis 
                    ? 'bg-rose-500 text-white animate-pulse' 
                    : 'bg-forest text-cream-100'
                }`}
              >
                {isRecordingThis ? 'Stop' : 'Record'}
              </button>
            ) : (
              <p className="text-caption text-ink-300">Not recorded yet</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Main Menu
  if (view === 'main') {
    return (
      <div className="min-h-screen bg-cream pb-28">
        <div className="bg-forest px-6 pt-14 pb-10">
          <div className="max-w-lg mx-auto text-center">
            <h1 className="font-serif text-display-sm text-cream-50 mb-2">Learn</h1>
            <p className="text-body text-cream-300">Languages & Islam</p>
          </div>
        </div>
        
        <div className="px-6 py-8 max-w-lg mx-auto">
          {/* Word of the Day */}
          <div className="bg-gradient-to-br from-gold-100 to-rose-100 rounded-3xl p-6 mb-6 shadow-card">
            <p className="section-label text-center mb-3">Word of the Day</p>
            <p className="text-3xl text-forest mb-2 text-center" dir={wordOfDay.language === 'arabic' || wordOfDay.language === 'urdu' ? 'rtl' : 'ltr'}>
              {wordOfDay.arabic || wordOfDay.native}
            </p>
            {wordOfDay.roman && <p className="font-serif text-title-sm text-forest text-center">{wordOfDay.roman}</p>}
            <p className="text-body text-ink-500 text-center mb-3">{wordOfDay.english}</p>
            <div className="bg-white/50 rounded-xl p-3">
              <p className="text-body-sm text-forest text-center">{wordOfDay.usage || `Category: ${wordOfDay.category}`}</p>
            </div>
            <RecordingSection wordKey={`wod_${wordOfDay.english.toLowerCase().replace(/\s/g, '_')}`} />
          </div>

          {/* Language Selection */}
          <div className="space-y-4">
            <button onClick={() => { setSelectedLanguage('arabic'); setView('language') }} className="w-full bg-white rounded-2xl p-6 shadow-soft text-left hover:shadow-card transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-forest rounded-xl flex items-center justify-center text-cream-100 font-serif text-title">ع</div>
                <div>
                  <h3 className="font-serif text-title-sm text-forest">Arabic</h3>
                  <p className="text-body-sm text-ink-400">Essential words & Islamic phrases</p>
                </div>
              </div>
            </button>
            
            <button onClick={() => { setSelectedLanguage('urdu'); setView('language') }} className="w-full bg-white rounded-2xl p-6 shadow-soft text-left hover:shadow-card transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-forest rounded-xl flex items-center justify-center text-cream-100 font-serif text-title">ا</div>
                <div>
                  <h3 className="font-serif text-title-sm text-forest">Urdu</h3>
                  <p className="text-body-sm text-ink-400">Essential phrases & vocabulary</p>
                </div>
              </div>
            </button>
            
            <button onClick={() => { setSelectedLanguage('tagalog'); setView('language') }} className="w-full bg-white rounded-2xl p-6 shadow-soft text-left hover:shadow-card transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-forest rounded-xl flex items-center justify-center text-cream-100 font-serif text-title">T</div>
                <div>
                  <h3 className="font-serif text-title-sm text-forest">Tagalog</h3>
                  <p className="text-body-sm text-ink-400">Filipino expressions & love words</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Language View - Category Selection
  if (view === 'language') {
    const library = selectedLanguage === 'arabic' ? arabicLibrary 
                  : selectedLanguage === 'urdu' ? urduLibrary 
                  : tagalogLibrary
    const languageName = selectedLanguage === 'arabic' ? 'Arabic' 
                       : selectedLanguage === 'urdu' ? 'Urdu' 
                       : 'Tagalog'

    if (!selectedCategory) {
      return (
        <div className="min-h-screen bg-cream pb-28">
          <div className="bg-forest px-6 pt-14 pb-10">
            <div className="max-w-lg mx-auto">
              <h1 className="font-serif text-display-sm text-cream-50 mb-2">{languageName}</h1>
            </div>
          </div>
          <div className="px-6 py-8 max-w-lg mx-auto">
            <BackButton onClick={() => setView('main')} />
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(library).map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className="bg-white rounded-xl p-4 shadow-soft text-left">
                  <p className="font-serif text-title-sm text-forest capitalize">{cat}</p>
                  <p className="text-caption text-ink-400">{library[cat].length} words</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )
    }

    // Show words in category
    const words = library[selectedCategory]
    const isRTL = selectedLanguage === 'arabic' || selectedLanguage === 'urdu'

    return (
      <div className="min-h-screen bg-cream pb-28">
        <div className="bg-forest px-6 pt-14 pb-10">
          <div className="max-w-lg mx-auto">
            <h1 className="font-serif text-display-sm text-cream-50 capitalize">{selectedCategory}</h1>
            <p className="text-body text-cream-300">{words.length} words</p>
          </div>
        </div>
        <div className="px-6 py-8 max-w-lg mx-auto">
          <BackButton onClick={() => setSelectedCategory(null)} />
          <div className="space-y-4">
            {words.map((word, i) => {
              const wordKey = `${selectedLanguage}_${selectedCategory}_${i}`
              return (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-soft">
                  <p className="text-3xl text-forest mb-2 text-center" dir={isRTL ? 'rtl' : 'ltr'}>
                    {word.arabic || word.native}
                  </p>
                  {word.roman && <p className="font-serif text-title-sm text-forest text-center">{word.roman}</p>}
                  <p className="text-body text-ink-500 text-center mb-2">{word.english}</p>
                  {word.usage && (
                    <div className="bg-gold-50 rounded-xl p-3">
                      <p className="text-body-sm text-gold-700 text-center">{word.usage}</p>
                    </div>
                  )}
                  <RecordingSection wordKey={wordKey} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  return null
}
