import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

// ============================================
// COMPREHENSIVE WORD LIBRARIES
// ============================================

const urduLibrary = {
  love: [
    { native: 'میں تم سے پیار کرتا ہوں', roman: 'Main tum se pyar karta hoon', english: 'I love you (male)' },
    { native: 'میں تم سے پیار کرتی ہوں', roman: 'Main tum se pyar karti hoon', english: 'I love you (female)' },
    { native: 'تم میری زندگی کی روشنی ہو', roman: 'Tum meri zindagi ki roshni ho', english: 'You are the light of my life' },
    { native: 'تم میرے لئے سب کچھ ہو', roman: 'Tum mere liye sab kuch ho', english: 'You are everything to me' },
    { native: 'میرا دل تمہارے لئے دھڑکتا ہے', roman: 'Mera dil tumhare liye dharkta hai', english: 'My heart beats for you' },
    { native: 'تم بہت خاص ہو', roman: 'Tum bohat khaas ho', english: 'You are very special' },
    { native: 'تمہارے بغیر میں ادھورا ہوں', roman: 'Tumhare baghair main adhoora hoon', english: 'I am incomplete without you' },
    { native: 'مجھے تم سے محبت ہے', roman: 'Mujhe tum se mohabbat hai', english: 'I have love for you' },
  ],
  endearment: [
    { native: 'میری جان', roman: 'Meri Jaan', english: 'My life / My soul' },
    { native: 'جانی', roman: 'Jaani', english: 'Darling / Beloved' },
    { native: 'جانو', roman: 'Jaanu', english: 'Sweetheart' },
    { native: 'میری جانم', roman: 'Meri Jaanam', english: 'My dear life' },
    { native: 'میرا بچہ', roman: 'Mera Bacha', english: 'My baby (affectionate)' },
    { native: 'میری گڑیا', roman: 'Meri Gudiya', english: 'My doll (for girls)' },
    { native: 'شہزادی', roman: 'Shehzadi', english: 'Princess' },
    { native: 'سونا', roman: 'Sona', english: 'Gold (term of endearment)' },
  ],
  greetings: [
    { native: 'السلام علیکم', roman: 'Assalamu Alaikum', english: 'Peace be upon you' },
    { native: 'وعلیکم السلام', roman: 'Walaikum Assalam', english: 'And upon you peace' },
    { native: 'کیا حال ہے؟', roman: 'Kya haal hai?', english: 'How are you?' },
    { native: 'ٹھیک ہوں', roman: 'Theek hoon', english: 'I am fine' },
    { native: 'صبح بخیر', roman: 'Subah bakhair', english: 'Good morning' },
    { native: 'شب بخیر', roman: 'Shab bakhair', english: 'Good night' },
    { native: 'خدا حافظ', roman: 'Khuda Hafiz', english: 'Goodbye (God protect you)' },
    { native: 'اللہ حافظ', roman: 'Allah Hafiz', english: 'Goodbye (Allah protect you)' },
    { native: 'پھر ملیں گے', roman: 'Phir milenge', english: 'We will meet again' },
  ],
  compliments: [
    { native: 'آپ بہت پیاری ہو', roman: 'Aap bohat pyaari ho', english: 'You are very lovely' },
    { native: 'آپ بہت خوبصورت ہو', roman: 'Aap bohat khubsurat ho', english: 'You are very beautiful' },
    { native: 'کمال کر دیا!', roman: 'Kamaal kar diya!', english: 'You did amazing!' },
    { native: 'بہت اچھا', roman: 'Bohat acha', english: 'Very good' },
    { native: 'شاباش', roman: 'Shabaash', english: 'Well done / Bravo' },
    { native: 'تم بہت ہوشیار ہو', roman: 'Tum bohat hoshiyaar ho', english: 'You are very smart' },
    { native: 'مزہ آگیا', roman: 'Maza aa gaya', english: 'That was fun / enjoyed it' },
  ],
  food: [
    { native: 'کھانا', roman: 'Khana', english: 'Food' },
    { native: 'پانی', roman: 'Paani', english: 'Water' },
    { native: 'چائے', roman: 'Chai', english: 'Tea' },
    { native: 'روٹی', roman: 'Roti', english: 'Bread' },
    { native: 'چاول', roman: 'Chawal', english: 'Rice' },
    { native: 'گوشت', roman: 'Gosht', english: 'Meat' },
    { native: 'سبزی', roman: 'Sabzi', english: 'Vegetables' },
    { native: 'مزیدار', roman: 'Mazedaar', english: 'Delicious' },
    { native: 'بھوک لگی ہے', roman: 'Bhook lagi hai', english: 'I am hungry' },
    { native: 'پیاس لگی ہے', roman: 'Pyaas lagi hai', english: 'I am thirsty' },
    { native: 'پیٹ بھر گیا', roman: 'Pait bhar gaya', english: 'I am full' },
    { native: 'بریانی', roman: 'Biryani', english: 'Biryani' },
    { native: 'نہاری', roman: 'Nihari', english: 'Nihari (slow-cooked stew)' },
  ],
  family: [
    { native: 'اماں / امی', roman: 'Amaan / Ami', english: 'Mother' },
    { native: 'ابا / ابو', roman: 'Abba / Abu', english: 'Father' },
    { native: 'بھائی', roman: 'Bhai', english: 'Brother' },
    { native: 'بہن', roman: 'Behn', english: 'Sister' },
    { native: 'دادا', roman: 'Dada', english: 'Paternal grandfather' },
    { native: 'دادی', roman: 'Dadi', english: 'Paternal grandmother' },
    { native: 'نانا', roman: 'Nana', english: 'Maternal grandfather' },
    { native: 'نانی', roman: 'Nani', english: 'Maternal grandmother' },
    { native: 'بیوی', roman: 'Biwi', english: 'Wife' },
    { native: 'شوہر', roman: 'Shohar', english: 'Husband' },
    { native: 'خاندان', roman: 'Khandaan', english: 'Family' },
  ],
  daily: [
    { native: 'ہاں', roman: 'Haan', english: 'Yes' },
    { native: 'نہیں', roman: 'Nahi', english: 'No' },
    { native: 'شکریہ', roman: 'Shukriya', english: 'Thank you' },
    { native: 'معاف کیجیے', roman: 'Maaf kijiye', english: 'Excuse me / Sorry' },
    { native: 'کیا؟', roman: 'Kya?', english: 'What?' },
    { native: 'کیوں؟', roman: 'Kyun?', english: 'Why?' },
    { native: 'کب؟', roman: 'Kab?', english: 'When?' },
    { native: 'کہاں؟', roman: 'Kahan?', english: 'Where?' },
    { native: 'کون؟', roman: 'Kaun?', english: 'Who?' },
    { native: 'کیسے؟', roman: 'Kaise?', english: 'How?' },
    { native: 'آج', roman: 'Aaj', english: 'Today' },
    { native: 'کل', roman: 'Kal', english: 'Yesterday / Tomorrow' },
    { native: 'ابھی', roman: 'Abhi', english: 'Now' },
    { native: 'بعد میں', roman: 'Baad mein', english: 'Later' },
  ],
  badwords: [
    { native: 'پاگل', roman: 'Pagal', english: 'Crazy / Idiot' },
    { native: 'الو کا پٹھا', roman: 'Ullu ka patha', english: 'Son of an owl (Fool)' },
    { native: 'بے وقوف', roman: 'Bewakoof', english: 'Stupid' },
    { native: 'کمینا', roman: 'Kameena', english: 'Jerk / Lowlife' },
    { native: 'گدھا', roman: 'Gadha', english: 'Donkey (calling someone dumb)' },
    { native: 'چپ کر', roman: 'Chup kar', english: 'Shut up' },
    { native: 'دفع ہو', roman: 'Dafa ho', english: 'Get lost' },
  ],
}

const tagalogLibrary = {
  love: [
    { roman: 'Mahal kita', english: 'I love you' },
    { roman: 'Ikaw ang tanging mahal ko', english: 'You are my only love' },
    { roman: 'Mahal na mahal kita', english: 'I love you so much' },
    { roman: 'Ikaw ang buhay ko', english: 'You are my life' },
    { roman: 'Laging nasa isip kita', english: 'You are always on my mind' },
    { roman: 'Hindi ako mabubuhay ng wala ka', english: "I can't live without you" },
    { roman: 'Ikaw lang ang gusto ko', english: 'You are the only one I want' },
  ],
  endearment: [
    { roman: 'Sinta', english: 'Sweetheart / Beloved' },
    { roman: 'Mahal', english: 'Love / Dear' },
    { roman: 'Mahal ko', english: 'My love' },
    { roman: 'Buhay ko', english: 'My life' },
    { roman: 'Baby ko', english: 'My baby' },
    { roman: 'Pangga', english: 'Dear (Visayan term)' },
  ],
  greetings: [
    { roman: 'Kumusta?', english: 'How are you? / Hello' },
    { roman: 'Kumusta ka?', english: 'How are you?' },
    { roman: 'Mabuti naman', english: "I'm fine" },
    { roman: 'Magandang umaga', english: 'Good morning' },
    { roman: 'Magandang hapon', english: 'Good afternoon' },
    { roman: 'Magandang gabi', english: 'Good evening' },
    { roman: 'Paalam', english: 'Goodbye' },
    { roman: 'Ingat!', english: 'Take care!' },
  ],
  compliments: [
    { roman: 'Ang ganda mo', english: 'You are beautiful' },
    { roman: 'Ang gwapo mo', english: 'You are handsome' },
    { roman: 'Ang galing mo!', english: "You're so good/awesome!" },
    { roman: 'Napakatalino mo', english: 'You are very smart' },
    { roman: 'Ang bait mo', english: 'You are so kind' },
    { roman: 'Ang cute mo', english: 'You are cute' },
  ],
  food: [
    { roman: 'Pagkain', english: 'Food' },
    { roman: 'Tubig', english: 'Water' },
    { roman: 'Kape', english: 'Coffee' },
    { roman: 'Kanin', english: 'Rice' },
    { roman: 'Ulam', english: 'Main dish / Viand' },
    { roman: 'Masarap', english: 'Delicious' },
    { roman: 'Gutom ako', english: 'I am hungry' },
    { roman: 'Uhaw ako', english: 'I am thirsty' },
    { roman: 'Busog na ako', english: 'I am full' },
    { roman: 'Adobo', english: 'Adobo (iconic Filipino dish)' },
    { roman: 'Sinigang', english: 'Sinigang (sour soup)' },
    { roman: 'Kain tayo', english: "Let's eat" },
  ],
  family: [
    { roman: 'Nanay / Inay / Mama', english: 'Mother' },
    { roman: 'Tatay / Itay / Papa', english: 'Father' },
    { roman: 'Kuya', english: 'Older brother' },
    { roman: 'Ate', english: 'Older sister' },
    { roman: 'Bunso', english: 'Youngest sibling' },
    { roman: 'Lolo', english: 'Grandfather' },
    { roman: 'Lola', english: 'Grandmother' },
    { roman: 'Asawa', english: 'Spouse' },
    { roman: 'Pamilya', english: 'Family' },
  ],
  daily: [
    { roman: 'Oo', english: 'Yes' },
    { roman: 'Hindi', english: 'No' },
    { roman: 'Salamat', english: 'Thank you' },
    { roman: 'Walang anuman', english: "You're welcome" },
    { roman: 'Paumanhin', english: 'Sorry / Excuse me' },
    { roman: 'Ano?', english: 'What?' },
    { roman: 'Bakit?', english: 'Why?' },
    { roman: 'Kailan?', english: 'When?' },
    { roman: 'Saan?', english: 'Where?' },
    { roman: 'Sino?', english: 'Who?' },
    { roman: 'Paano?', english: 'How?' },
    { roman: 'Ngayon', english: 'Now / Today' },
    { roman: 'Po / Opo', english: 'Polite particle (respect)' },
  ],
  badwords: [
    { roman: 'Gago / Gaga', english: 'Stupid / Jerk' },
    { roman: 'Tanga', english: 'Foolish / Clueless' },
    { roman: 'Bobo', english: 'Dumb' },
    { roman: 'Ulol', english: 'Crazy / Insane' },
    { roman: 'Leche', english: 'Damn (mild)' },
    { roman: 'Tumahimik ka', english: 'Shut up' },
  ],
}

// ============================================
// ISLAMIC MODULE - 4 LEVELS
// ============================================

const islamicLessons = {
  level1: {
    title: 'Social Phrases',
    description: 'Essential Islamic greetings',
    words: [
      { arabic: 'السَّلَامُ عَلَيْكُمْ', roman: 'Assalamu Alaikum', english: 'Peace be upon you', usage: 'Greeting any Muslim' },
      { arabic: 'وَعَلَيْكُمُ السَّلَامُ', roman: 'Wa Alaikum Assalam', english: 'And upon you peace', usage: 'Response to Salam' },
      { arabic: 'إِنْ شَاءَ اللَّهُ', roman: 'Inshallah', english: 'God willing', usage: 'When speaking about future plans' },
      { arabic: 'مَا شَاءَ اللَّهُ', roman: 'Mashallah', english: 'What God has willed', usage: 'Expressing appreciation/awe' },
      { arabic: 'أَسْتَغْفِرُ اللَّهُ', roman: 'Astaghfirullah', english: 'I seek forgiveness from Allah', usage: 'After making a mistake' },
    ]
  },
  level2: {
    title: 'Dhikr (Remembrance)',
    description: 'Phrases of divine remembrance',
    words: [
      { arabic: 'سُبْحَانَ اللَّهِ', roman: 'SubhanAllah', english: 'Glory be to Allah', usage: 'Praising Allah, expressing wonder' },
      { arabic: 'الْحَمْدُ لِلَّهِ', roman: 'Alhamdulillah', english: 'All praise is due to Allah', usage: 'Gratitude, after sneezing' },
      { arabic: 'اللَّهُ أَكْبَرُ', roman: 'Allahu Akbar', english: 'Allah is the Greatest', usage: 'Proclaiming God\'s greatness' },
      { arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ', roman: 'La ilaha illallah', english: 'There is no god but Allah', usage: 'Declaration of faith' },
    ]
  },
  level3: {
    title: 'Daily Duas',
    description: 'Supplications for everyday life',
    words: [
      { arabic: 'بِسْمِ اللَّهِ', roman: 'Bismillah', english: 'In the name of Allah', usage: 'Before eating, starting anything' },
      { arabic: 'جَزَاكَ اللَّهُ خَيْرًا', roman: 'JazakAllah Khair', english: 'May Allah reward you with good', usage: 'Thanking someone' },
      { arabic: 'بَارَكَ اللَّهُ فِيكَ', roman: 'Barakallahu Feek', english: 'May Allah bless you', usage: 'Blessing someone' },
      { arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ', roman: 'Allahumma salli ala Muhammad', english: 'O Allah, send blessings upon Muhammad', usage: 'When Prophet\'s name is mentioned' },
    ]
  },
  level4: {
    title: 'Spiritual Concepts',
    description: 'Deep Islamic values',
    words: [
      { arabic: 'صَبْر', roman: 'Sabr', english: 'Patience', usage: 'Staying calm through hardship. The Prophet said patience is light.' },
      { arabic: 'تَوَكُّل', roman: 'Tawakkul', english: 'Trust in Allah', usage: 'Relying on Allah after doing your best.' },
      { arabic: 'شُكْر', roman: 'Shukr', english: 'Gratitude', usage: 'Being thankful. If you are grateful, I will increase you.' },
      { arabic: 'تَوْبَة', roman: 'Tawbah', english: 'Repentance', usage: 'Sincerely turning back to Allah.' },
      { arabic: 'أَدَب', roman: 'Adab', english: 'Etiquette / Manners', usage: 'Proper conduct and respect.' },
    ]
  }
}

// ============================================
// GRAMMAR LESSONS
// ============================================

const grammarLessons = {
  urdu: {
    title: 'Urdu Sentence Structure',
    subtitle: 'SOV - Subject Object Verb',
    explanation: 'In Urdu, the verb comes at the END of the sentence.',
    examples: [
      { english: 'I drink water', local: 'Main paani peeta hoon', breakdown: 'I (Main) + water (paani) + drink (peeta hoon)' },
      { english: 'She eats food', local: 'Woh khana khati hai', breakdown: 'She (Woh) + food (khana) + eats (khati hai)' },
      { english: 'I love you', local: 'Main tum se pyar karta hoon', breakdown: 'I (Main) + you (tum se) + love (pyar karta hoon)' },
    ],
    tips: ['Always put the verb at the end', 'Male/female forms change the verb ending (-a/-i)', 'Use "hai" (is) and "hoon" (am) as helpers']
  },
  tagalog: {
    title: 'Tagalog Sentence Structure',
    subtitle: 'VSO - Verb Subject Object',
    explanation: 'In Tagalog, the verb or description comes FIRST.',
    examples: [
      { english: 'I am beautiful', local: 'Maganda ako', breakdown: 'Beautiful (Maganda) + I (ako)' },
      { english: 'He eats rice', local: 'Kumakain siya ng kanin', breakdown: 'Eating (Kumakain) + he (siya) + rice (ng kanin)' },
      { english: 'I love you', local: 'Mahal kita', breakdown: 'Love (Mahal) + I-you (kita)' },
    ],
    tips: ['"Ang" marks the subject', '"Ng" marks the object', '"Po" and "Opo" add respect']
  }
}

// ============================================
// URDU ALPHABET
// ============================================

const urduAlphabet = [
  { letter: 'ا', name: 'Alif', sound: 'a' },
  { letter: 'ب', name: 'Bay', sound: 'b' },
  { letter: 'پ', name: 'Pay', sound: 'p' },
  { letter: 'ت', name: 'Tay', sound: 't' },
  { letter: 'ٹ', name: 'Ttay', sound: 'ṭ' },
  { letter: 'ث', name: 'Say', sound: 's' },
  { letter: 'ج', name: 'Jeem', sound: 'j' },
  { letter: 'چ', name: 'Chay', sound: 'ch' },
  { letter: 'ح', name: 'Hay', sound: 'h' },
  { letter: 'خ', name: 'Khay', sound: 'kh' },
  { letter: 'د', name: 'Daal', sound: 'd' },
  { letter: 'ڈ', name: 'Ddaal', sound: 'ḍ' },
  { letter: 'ذ', name: 'Zaal', sound: 'z' },
  { letter: 'ر', name: 'Ray', sound: 'r' },
  { letter: 'ڑ', name: 'Rray', sound: 'ṛ' },
  { letter: 'ز', name: 'Zay', sound: 'z' },
  { letter: 'س', name: 'Seen', sound: 's' },
  { letter: 'ش', name: 'Sheen', sound: 'sh' },
  { letter: 'ص', name: 'Swad', sound: 's' },
  { letter: 'ض', name: 'Zwad', sound: 'z' },
  { letter: 'ط', name: 'Toy', sound: 't' },
  { letter: 'ظ', name: 'Zoy', sound: 'z' },
  { letter: 'ع', name: 'Ain', sound: 'a' },
  { letter: 'غ', name: 'Ghain', sound: 'gh' },
  { letter: 'ف', name: 'Fay', sound: 'f' },
  { letter: 'ق', name: 'Qaaf', sound: 'q' },
  { letter: 'ک', name: 'Kaaf', sound: 'k' },
  { letter: 'گ', name: 'Gaaf', sound: 'g' },
  { letter: 'ل', name: 'Laam', sound: 'l' },
  { letter: 'م', name: 'Meem', sound: 'm' },
  { letter: 'ن', name: 'Noon', sound: 'n' },
  { letter: 'و', name: 'Wao', sound: 'w/o' },
  { letter: 'ہ', name: 'Hay', sound: 'h' },
  { letter: 'ی', name: 'Yay', sound: 'y' },
  { letter: 'ے', name: 'Bari Yay', sound: 'ay' },
]

const categoryConfig = {
  love: { emoji: '💕', label: 'Love', gradient: 'from-rose-100 to-rose-200' },
  endearment: { emoji: '🥰', label: 'Sweet Names', gradient: 'from-pink-100 to-rose-100' },
  greetings: { emoji: '👋', label: 'Greetings', gradient: 'from-gold-100 to-gold-200' },
  compliments: { emoji: '✨', label: 'Compliments', gradient: 'from-purple-100 to-purple-200' },
  food: { emoji: '🍽️', label: 'Food & Dining', gradient: 'from-orange-100 to-yellow-100' },
  family: { emoji: '👨‍👩‍👧', label: 'Family', gradient: 'from-blue-100 to-blue-200' },
  daily: { emoji: '☀️', label: 'Daily Essentials', gradient: 'from-cream-200 to-cream-300' },
  badwords: { emoji: '🤬', label: 'Bad Words', gradient: 'from-red-100 to-red-200' },
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function LearnPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('urdu')
  const [view, setView] = useState('daily')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)

  const handleTabChange = (newTab) => {
    if (newTab !== activeTab) {
      setView('daily')
      setSelectedCategory(null)
      setSelectedLevel(null)
      setActiveTab(newTab)
    }
  }

  const getWordOfDay = () => {
    const library = activeTab === 'urdu' ? urduLibrary : tagalogLibrary
    const allWords = Object.values(library).flat()
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
    const offset = activeTab === 'urdu' ? 0 : 100
    return allWords[(dayOfYear + offset) % allWords.length]
  }

  const wordOfDay = activeTab !== 'islam' ? getWordOfDay() : null

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="bg-forest px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-display-sm text-cream-50 mb-2">Learn</h1>
          <p className="text-body text-cream-300">Growing together 🌱</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-cream px-6 py-4 sticky top-0 z-20 border-b border-cream-300">
        <div className="max-w-lg mx-auto flex justify-center gap-2">
          {[
            { id: 'urdu', label: 'Urdu', flag: '🇵🇰' },
            { id: 'tagalog', label: 'Tagalog', flag: '🇵🇭' },
            { id: 'islam', label: 'Islam', flag: '🕌' },
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => handleTabChange(lang.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-full text-body-sm font-medium transition-all ${
                activeTab === lang.id ? 'bg-forest text-cream-100' : 'bg-cream-200 text-ink-500'
              }`}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-cream min-h-[60vh]">
        {activeTab === 'islam' ? (
          <IslamicView selectedLevel={selectedLevel} setSelectedLevel={setSelectedLevel} />
        ) : view === 'daily' ? (
          <DailyView word={wordOfDay} language={activeTab} setView={setView} />
        ) : view === 'library' ? (
          <LibraryView 
            library={activeTab === 'urdu' ? urduLibrary : tagalogLibrary}
            language={activeTab}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            setView={setView}
          />
        ) : view === 'grammar' ? (
          <GrammarView grammar={grammarLessons[activeTab]} setView={setView} />
        ) : view === 'alphabet' ? (
          <AlphabetView setView={setView} />
        ) : null}
      </div>
    </div>
  )
}

function DailyView({ word, language, setView }) {
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])

  const startRecord = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRef.current = new MediaRecorder(stream)
      chunksRef.current = []
      mediaRef.current.ondataavailable = e => e.data.size > 0 && chunksRef.current.push(e.data)
      mediaRef.current.onstop = () => {
        setAudioUrl(URL.createObjectURL(new Blob(chunksRef.current, { type: 'audio/webm' })))
        stream.getTracks().forEach(t => t.stop())
      }
      mediaRef.current.start()
      setRecording(true)
    } catch { alert('Microphone access needed') }
  }

  const stopRecord = () => {
    mediaRef.current?.stop()
    setRecording(false)
  }

  if (!word) return null

  return (
    <div className="px-6 py-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-card mb-6">
          <div className="text-center mb-6">
            <span className="tag tag-forest">Word of the Day</span>
          </div>

          <div className="text-center py-6 border-b border-cream-200 mb-6">
            {word.native && <p className="text-4xl text-forest mb-4" dir="rtl">{word.native}</p>}
            <h2 className="font-serif text-display-sm text-forest mb-3">{word.roman}</h2>
            <p className="text-body-lg text-ink-500">{word.english}</p>
          </div>

          {/* Voice Practice */}
          <div className="text-center">
            <p className="text-body-sm text-ink-400 mb-4">Practice saying it:</p>
            {!audioUrl ? (
              <button
                onClick={recording ? stopRecord : startRecord}
                className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto shadow-lg ${recording ? 'bg-rose-500 animate-pulse' : 'bg-forest'}`}
              >
                <span className="text-white text-2xl">{recording ? '⏹' : '🎤'}</span>
              </button>
            ) : (
              <div className="space-y-3">
                <audio controls src={audioUrl} className="w-full" />
                <button onClick={() => setAudioUrl(null)} className="text-body-sm text-forest font-medium">Try again</button>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button onClick={() => setView('library')} className="bg-gradient-to-br from-rose-100 to-rose-200 rounded-2xl p-5 text-left">
            <span className="text-3xl mb-2 block">📚</span>
            <p className="font-serif text-title-sm text-forest">Word Library</p>
            <p className="text-body-sm text-forest-600">All words & phrases</p>
          </button>
          <button onClick={() => setView('grammar')} className="bg-gradient-to-br from-gold-100 to-gold-200 rounded-2xl p-5 text-left">
            <span className="text-3xl mb-2 block">📝</span>
            <p className="font-serif text-title-sm text-forest">Grammar</p>
            <p className="text-body-sm text-forest-600">Sentence structure</p>
          </button>
          {language === 'urdu' && (
            <button onClick={() => setView('alphabet')} className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl p-5 text-left col-span-2">
              <span className="text-3xl mb-2 block">ا ب پ</span>
              <p className="font-serif text-title-sm text-forest">Urdu Alphabet</p>
              <p className="text-body-sm text-forest-600">Learn the 35 letters</p>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function LibraryView({ library, language, selectedCategory, setSelectedCategory, setView }) {
  return (
    <div className="px-6 py-8">
      <div className="max-w-lg mx-auto">
        <button onClick={() => selectedCategory ? setSelectedCategory(null) : setView('daily')} className="flex items-center gap-2 text-body-sm text-ink-400 hover:text-forest mb-6">
          ← Back
        </button>

        {!selectedCategory ? (
          <>
            <h2 className="font-serif text-display-sm text-forest text-center mb-2">
              {language === 'urdu' ? '🇵🇰 Urdu' : '🇵🇭 Tagalog'} Library
            </h2>
            <p className="text-body text-ink-500 text-center mb-8">{Object.values(library).flat().length} words</p>

            <div className="space-y-3">
              {Object.keys(library).map(cat => {
                const cfg = categoryConfig[cat]
                return (
                  <button key={cat} onClick={() => setSelectedCategory(cat)} className={`w-full bg-gradient-to-r ${cfg?.gradient || 'from-cream-200 to-cream-300'} rounded-2xl p-5 text-left`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <span className="text-3xl">{cfg?.emoji || '📖'}</span>
                        <div>
                          <p className="font-serif text-title-sm text-forest">{cfg?.label || cat}</p>
                          <p className="text-body-sm text-forest-600">{library[cat].length} words</p>
                        </div>
                      </div>
                      <span className="text-forest-400">→</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <h3 className="font-serif text-title text-forest mb-4">{categoryConfig[selectedCategory]?.emoji} {categoryConfig[selectedCategory]?.label}</h3>
            <div className="space-y-3">
              {library[selectedCategory].map((word, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-soft">
                  {word.native && <p className="text-2xl text-forest mb-2 text-right" dir="rtl">{word.native}</p>}
                  <p className="font-serif text-title-sm text-forest">{word.roman}</p>
                  <p className="text-body text-ink-500">{word.english}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function GrammarView({ grammar, setView }) {
  return (
    <div className="px-6 py-8">
      <div className="max-w-lg mx-auto">
        <button onClick={() => setView('daily')} className="flex items-center gap-2 text-body-sm text-ink-400 hover:text-forest mb-6">← Back</button>

        <div className="bg-white rounded-3xl p-6 shadow-card mb-6">
          <h2 className="font-serif text-title text-forest mb-2">{grammar.title}</h2>
          <p className="text-body-lg text-gold-600 font-medium mb-4">{grammar.subtitle}</p>
          <p className="text-body text-ink-600">{grammar.explanation}</p>
        </div>

        <h3 className="font-serif text-title-sm text-forest mb-4">Examples</h3>
        <div className="space-y-4 mb-6">
          {grammar.examples.map((ex, i) => (
            <div key={i} className="bg-gold-50 rounded-2xl p-5">
              <p className="text-body text-ink-600 mb-2">"{ex.english}"</p>
              <p className="font-serif text-title-sm text-forest mb-2">→ {ex.local}</p>
              <p className="text-body-sm text-gold-700">{ex.breakdown}</p>
            </div>
          ))}
        </div>

        <h3 className="font-serif text-title-sm text-forest mb-4">Tips</h3>
        <div className="bg-forest-50 rounded-2xl p-5">
          <ul className="space-y-2">
            {grammar.tips.map((tip, i) => <li key={i} className="text-body text-forest">• {tip}</li>)}
          </ul>
        </div>
      </div>
    </div>
  )
}

function AlphabetView({ setView }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="px-6 py-8">
      <div className="max-w-lg mx-auto">
        <button onClick={() => selected ? setSelected(null) : setView('daily')} className="flex items-center gap-2 text-body-sm text-ink-400 hover:text-forest mb-6">← Back</button>

        <h2 className="font-serif text-display-sm text-forest text-center mb-2">Urdu Alphabet</h2>
        <p className="text-body text-ink-500 text-center mb-6">35 letters • Right to Left ←</p>

        {!selected ? (
          <div className="grid grid-cols-7 gap-2">
            {urduAlphabet.map((item, i) => (
              <button key={i} onClick={() => setSelected(item)} className="aspect-square bg-white rounded-xl flex items-center justify-center text-2xl text-forest shadow-soft hover:shadow-card">
                {item.letter}
              </button>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-6 shadow-card text-center">
            <p className="text-8xl text-forest mb-4">{selected.letter}</p>
            <p className="font-serif text-title text-forest mb-2">{selected.name}</p>
            <p className="text-body-lg text-ink-500">Sound: "{selected.sound}"</p>
          </div>
        )}
      </div>
    </div>
  )
}

function IslamicView({ selectedLevel, setSelectedLevel }) {
  const levels = Object.entries(islamicLessons)

  return (
    <div className="px-6 py-8">
      <div className="max-w-lg mx-auto">
        {!selectedLevel ? (
          <>
            <h2 className="font-serif text-display-sm text-forest text-center mb-2">Islamic Learning</h2>
            <p className="text-body text-ink-500 text-center mb-8">4 Levels of Growth</p>

            <div className="space-y-4">
              {levels.map(([key, level], i) => (
                <button key={key} onClick={() => setSelectedLevel(key)} className="w-full bg-white rounded-2xl p-5 shadow-soft text-left hover:shadow-card">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-forest rounded-full flex items-center justify-center text-cream-100 font-serif text-title">{i + 1}</div>
                    <div>
                      <p className="font-serif text-title-sm text-forest">{level.title}</p>
                      <p className="text-body-sm text-ink-400">{level.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <button onClick={() => setSelectedLevel(null)} className="flex items-center gap-2 text-body-sm text-ink-400 hover:text-forest mb-6">← All levels</button>

            <h2 className="font-serif text-title text-forest mb-2">{islamicLessons[selectedLevel].title}</h2>
            <p className="text-body text-ink-500 mb-6">{islamicLessons[selectedLevel].description}</p>

            <div className="space-y-4">
              {islamicLessons[selectedLevel].words.map((word, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 shadow-soft">
                  <p className="text-3xl text-forest mb-2 text-center" dir="rtl">{word.arabic}</p>
                  <p className="font-serif text-title-sm text-forest text-center">{word.roman}</p>
                  <p className="text-body text-ink-500 text-center mb-3">{word.english}</p>
                  <div className="bg-gold-50 rounded-xl p-3">
                    <p className="text-body-sm text-gold-700 text-center">{word.usage}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
