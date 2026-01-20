import { useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext'

// ============================================
// COMPREHENSIVE ARABIC LIBRARY (150+ words)
// ============================================
const arabicLibrary = {
  greetings: [
    { arabic: 'السلام عليكم', roman: 'As-salamu alaykum', english: 'Peace be upon you', usage: 'Standard Islamic greeting' },
    { arabic: 'وعليكم السلام', roman: 'Wa alaykum as-salam', english: 'And peace be upon you', usage: 'Response to greeting' },
    { arabic: 'صباح الخير', roman: 'Sabah al-khayr', english: 'Good morning', usage: 'Morning greeting' },
    { arabic: 'مساء الخير', roman: 'Masa al-khayr', english: 'Good evening', usage: 'Evening greeting' },
    { arabic: 'أهلاً وسهلاً', roman: 'Ahlan wa sahlan', english: 'Welcome', usage: 'Welcoming someone' },
    { arabic: 'مرحباً', roman: 'Marhaba', english: 'Hello', usage: 'Casual greeting' },
    { arabic: 'كيف حالك؟', roman: 'Kayf haluk?', english: 'How are you?', usage: 'Asking about wellbeing' },
    { arabic: 'الحمد لله', roman: 'Alhamdulillah', english: 'Praise be to God', usage: 'Response: I am well' },
    { arabic: 'مع السلامة', roman: "Ma'a salama", english: 'Goodbye', usage: 'Farewell' },
    { arabic: 'إلى اللقاء', roman: 'Ila al-liqa', english: 'See you later', usage: 'Casual goodbye' }
  ],
  love: [
    { arabic: 'أحبك', roman: 'Uhibbuk', english: 'I love you', usage: 'Expressing love' },
    { arabic: 'حبيبي', roman: 'Habibi', english: 'My love (m)', usage: 'Term of endearment' },
    { arabic: 'حبيبتي', roman: 'Habibti', english: 'My love (f)', usage: 'Term of endearment' },
    { arabic: 'قلبي', roman: 'Qalbi', english: 'My heart', usage: 'Affectionate term' },
    { arabic: 'عمري', roman: 'Omri', english: 'My life', usage: 'Deep affection' },
    { arabic: 'روحي', roman: 'Ruhi', english: 'My soul', usage: 'Deep love' },
    { arabic: 'نور عيني', roman: 'Noor ayni', english: 'Light of my eyes', usage: 'Precious one' },
    { arabic: 'أنتِ جميلة', roman: 'Anti jameela', english: 'You are beautiful', usage: 'Compliment (to female)' },
    { arabic: 'أنتَ وسيم', roman: 'Anta waseem', english: 'You are handsome', usage: 'Compliment (to male)' },
    { arabic: 'أشتاق إليك', roman: 'Ashtaq ilayk', english: 'I miss you', usage: 'Expressing longing' },
    { arabic: 'يا عيوني', roman: 'Ya oyouni', english: 'My eyes', usage: 'Term of endearment' },
    { arabic: 'حياتي', roman: 'Hayati', english: 'My life', usage: 'Term of endearment' }
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
    { arabic: 'جد', roman: 'Jadd', english: 'Grandfather', usage: 'Grandparent' },
    { arabic: 'جدة', roman: 'Jadda', english: 'Grandmother', usage: 'Grandparent' },
    { arabic: 'عم', roman: 'Amm', english: 'Uncle (paternal)', usage: 'Extended family' },
    { arabic: 'خال', roman: 'Khal', english: 'Uncle (maternal)', usage: 'Extended family' },
    { arabic: 'عمة', roman: 'Amma', english: 'Aunt (paternal)', usage: 'Extended family' },
    { arabic: 'خالة', roman: 'Khala', english: 'Aunt (maternal)', usage: 'Extended family' }
  ],
  daily: [
    { arabic: 'نعم', roman: "Na'am", english: 'Yes', usage: 'Affirmation' },
    { arabic: 'لا', roman: 'La', english: 'No', usage: 'Negation' },
    { arabic: 'شكراً', roman: 'Shukran', english: 'Thank you', usage: 'Gratitude' },
    { arabic: 'عفواً', roman: 'Afwan', english: "You're welcome", usage: 'Response to thanks' },
    { arabic: 'من فضلك', roman: 'Min fadlak', english: 'Please', usage: 'Polite request' },
    { arabic: 'آسف', roman: 'Asif', english: 'Sorry', usage: 'Apology' },
    { arabic: 'ماذا', roman: 'Matha', english: 'What', usage: 'Question word' },
    { arabic: 'أين', roman: 'Ayna', english: 'Where', usage: 'Question word' },
    { arabic: 'متى', roman: 'Mata', english: 'When', usage: 'Question word' },
    { arabic: 'لماذا', roman: 'Limatha', english: 'Why', usage: 'Question word' },
    { arabic: 'كيف', roman: 'Kayf', english: 'How', usage: 'Question word' },
    { arabic: 'من', roman: 'Man', english: 'Who', usage: 'Question word' },
    { arabic: 'هذا', roman: 'Hadha', english: 'This (m)', usage: 'Demonstrative' },
    { arabic: 'هذه', roman: 'Hadhihi', english: 'This (f)', usage: 'Demonstrative' }
  ],
  food: [
    { arabic: 'ماء', roman: "Ma'", english: 'Water', usage: 'Drink' },
    { arabic: 'خبز', roman: 'Khubz', english: 'Bread', usage: 'Food staple' },
    { arabic: 'أرز', roman: 'Aruz', english: 'Rice', usage: 'Grain' },
    { arabic: 'لحم', roman: 'Lahm', english: 'Meat', usage: 'Protein' },
    { arabic: 'دجاج', roman: 'Dajaj', english: 'Chicken', usage: 'Poultry' },
    { arabic: 'سمك', roman: 'Samak', english: 'Fish', usage: 'Seafood' },
    { arabic: 'فاكهة', roman: 'Fakiha', english: 'Fruit', usage: 'Produce' },
    { arabic: 'خضار', roman: 'Khudar', english: 'Vegetables', usage: 'Produce' },
    { arabic: 'حليب', roman: 'Haleeb', english: 'Milk', usage: 'Dairy' },
    { arabic: 'قهوة', roman: 'Qahwa', english: 'Coffee', usage: 'Hot drink' },
    { arabic: 'شاي', roman: 'Shay', english: 'Tea', usage: 'Hot drink' },
    { arabic: 'عسل', roman: 'Asal', english: 'Honey', usage: 'Sweetener' },
    { arabic: 'بيض', roman: 'Bayd', english: 'Eggs', usage: 'Protein' },
    { arabic: 'جبن', roman: 'Jubn', english: 'Cheese', usage: 'Dairy' }
  ],
  time: [
    { arabic: 'اليوم', roman: 'Al-yawm', english: 'Today', usage: 'Present day' },
    { arabic: 'غداً', roman: 'Ghadan', english: 'Tomorrow', usage: 'Next day' },
    { arabic: 'أمس', roman: 'Ams', english: 'Yesterday', usage: 'Previous day' },
    { arabic: 'صباح', roman: 'Sabah', english: 'Morning', usage: 'Time of day' },
    { arabic: 'مساء', roman: "Masa'", english: 'Evening', usage: 'Time of day' },
    { arabic: 'ليل', roman: 'Layl', english: 'Night', usage: 'Time of day' },
    { arabic: 'ساعة', roman: "Sa'a", english: 'Hour', usage: 'Time unit' },
    { arabic: 'دقيقة', roman: 'Daqiqa', english: 'Minute', usage: 'Time unit' },
    { arabic: 'أسبوع', roman: "Usbu'", english: 'Week', usage: 'Time period' },
    { arabic: 'شهر', roman: 'Shahr', english: 'Month', usage: 'Time period' },
    { arabic: 'سنة', roman: 'Sana', english: 'Year', usage: 'Time period' },
    { arabic: 'الآن', roman: 'Al-aan', english: 'Now', usage: 'Present moment' }
  ],
  places: [
    { arabic: 'بيت', roman: 'Bayt', english: 'House', usage: 'Dwelling' },
    { arabic: 'مسجد', roman: 'Masjid', english: 'Mosque', usage: 'Place of worship' },
    { arabic: 'مدرسة', roman: 'Madrasa', english: 'School', usage: 'Education' },
    { arabic: 'سوق', roman: 'Suq', english: 'Market', usage: 'Shopping' },
    { arabic: 'مطعم', roman: "Mat'am", english: 'Restaurant', usage: 'Dining' },
    { arabic: 'مستشفى', roman: 'Mustashfa', english: 'Hospital', usage: 'Medical' },
    { arabic: 'مطار', roman: 'Matar', english: 'Airport', usage: 'Travel' },
    { arabic: 'شارع', roman: "Shari'", english: 'Street', usage: 'Location' },
    { arabic: 'مدينة', roman: 'Madina', english: 'City', usage: 'Location' },
    { arabic: 'بلد', roman: 'Balad', english: 'Country', usage: 'Location' }
  ],
  islamic: [
    { arabic: 'الله', roman: 'Allah', english: 'God', usage: 'The one God' },
    { arabic: 'إسلام', roman: 'Islam', english: 'Islam', usage: 'The religion' },
    { arabic: 'مسلم', roman: 'Muslim', english: 'Muslim', usage: 'Follower of Islam' },
    { arabic: 'صلاة', roman: 'Salah', english: 'Prayer', usage: 'Worship' },
    { arabic: 'صيام', roman: 'Siyam', english: 'Fasting', usage: 'Ramadan practice' },
    { arabic: 'زكاة', roman: 'Zakat', english: 'Charity', usage: 'Pillar of Islam' },
    { arabic: 'حج', roman: 'Hajj', english: 'Pilgrimage', usage: 'To Mecca' },
    { arabic: 'قرآن', roman: 'Quran', english: 'Quran', usage: 'Holy book' },
    { arabic: 'حديث', roman: 'Hadith', english: 'Hadith', usage: "Prophet's sayings" },
    { arabic: 'سنة', roman: 'Sunnah', english: 'Sunnah', usage: "Prophet's way" },
    { arabic: 'دعاء', roman: "Du'a", english: 'Supplication', usage: 'Personal prayer' },
    { arabic: 'ذكر', roman: 'Dhikr', english: 'Remembrance', usage: 'Of Allah' },
    { arabic: 'إنشاء الله', roman: "Insha'Allah", english: 'God willing', usage: 'Future plans' },
    { arabic: 'ما شاء الله', roman: "Masha'Allah", english: 'God has willed', usage: 'Expressing amazement' },
    { arabic: 'سبحان الله', roman: "Subhan'Allah", english: 'Glory to God', usage: 'Praise' },
    { arabic: 'أستغفر الله', roman: 'Astaghfirullah', english: 'I seek forgiveness', usage: 'Repentance' }
  ]
}

const arabicNumbers = [
  { num: 0, arabic: '٠', word: 'صفر', roman: 'Sifr' },
  { num: 1, arabic: '١', word: 'واحد', roman: 'Wahid' },
  { num: 2, arabic: '٢', word: 'اثنان', roman: 'Ithnan' },
  { num: 3, arabic: '٣', word: 'ثلاثة', roman: 'Thalatha' },
  { num: 4, arabic: '٤', word: 'أربعة', roman: "Arba'a" },
  { num: 5, arabic: '٥', word: 'خمسة', roman: 'Khamsa' },
  { num: 6, arabic: '٦', word: 'ستة', roman: 'Sitta' },
  { num: 7, arabic: '٧', word: 'سبعة', roman: "Sab'a" },
  { num: 8, arabic: '٨', word: 'ثمانية', roman: 'Thamaniya' },
  { num: 9, arabic: '٩', word: 'تسعة', roman: "Tis'a" },
  { num: 10, arabic: '١٠', word: 'عشرة', roman: 'Ashara' },
  { num: 20, arabic: '٢٠', word: 'عشرون', roman: 'Ishrun' },
  { num: 30, arabic: '٣٠', word: 'ثلاثون', roman: 'Thalathun' },
  { num: 40, arabic: '٤٠', word: 'أربعون', roman: "Arba'un" },
  { num: 50, arabic: '٥٠', word: 'خمسون', roman: 'Khamsun' },
  { num: 100, arabic: '١٠٠', word: 'مائة', roman: "Mi'a" },
  { num: 1000, arabic: '١٠٠٠', word: 'ألف', roman: 'Alf' }
]

const arabicAlphabet = [
  { letter: 'ا', name: 'Alif', sound: 'a', position: 'ا ـا' },
  { letter: 'ب', name: 'Ba', sound: 'b', position: 'بـ ـبـ ـب' },
  { letter: 'ت', name: 'Ta', sound: 't', position: 'تـ ـتـ ـت' },
  { letter: 'ث', name: 'Tha', sound: 'th', position: 'ثـ ـثـ ـث' },
  { letter: 'ج', name: 'Jim', sound: 'j', position: 'جـ ـجـ ـج' },
  { letter: 'ح', name: 'Ha', sound: 'h (deep)', position: 'حـ ـحـ ـح' },
  { letter: 'خ', name: 'Kha', sound: 'kh', position: 'خـ ـخـ ـخ' },
  { letter: 'د', name: 'Dal', sound: 'd', position: 'د ـد' },
  { letter: 'ذ', name: 'Dhal', sound: 'dh', position: 'ذ ـذ' },
  { letter: 'ر', name: 'Ra', sound: 'r', position: 'ر ـر' },
  { letter: 'ز', name: 'Zay', sound: 'z', position: 'ز ـز' },
  { letter: 'س', name: 'Sin', sound: 's', position: 'سـ ـسـ ـس' },
  { letter: 'ش', name: 'Shin', sound: 'sh', position: 'شـ ـشـ ـش' },
  { letter: 'ص', name: 'Sad', sound: 's (emphatic)', position: 'صـ ـصـ ـص' },
  { letter: 'ض', name: 'Dad', sound: 'd (emphatic)', position: 'ضـ ـضـ ـض' },
  { letter: 'ط', name: 'Ta', sound: 't (emphatic)', position: 'طـ ـطـ ـط' },
  { letter: 'ظ', name: 'Dha', sound: 'dh (emphatic)', position: 'ظـ ـظـ ـظ' },
  { letter: 'ع', name: 'Ayn', sound: "'a (guttural)", position: 'عـ ـعـ ـع' },
  { letter: 'غ', name: 'Ghayn', sound: 'gh', position: 'غـ ـغـ ـغ' },
  { letter: 'ف', name: 'Fa', sound: 'f', position: 'فـ ـفـ ـف' },
  { letter: 'ق', name: 'Qaf', sound: 'q', position: 'قـ ـقـ ـق' },
  { letter: 'ك', name: 'Kaf', sound: 'k', position: 'كـ ـكـ ـك' },
  { letter: 'ل', name: 'Lam', sound: 'l', position: 'لـ ـلـ ـل' },
  { letter: 'م', name: 'Mim', sound: 'm', position: 'مـ ـمـ ـم' },
  { letter: 'ن', name: 'Nun', sound: 'n', position: 'نـ ـنـ ـن' },
  { letter: 'ه', name: 'Ha', sound: 'h', position: 'هـ ـهـ ـه' },
  { letter: 'و', name: 'Waw', sound: 'w/u', position: 'و ـو' },
  { letter: 'ي', name: 'Ya', sound: 'y/i', position: 'يـ ـيـ ـي' }
]

const arabicGrammar = {
  pronouns: {
    title: 'Personal Pronouns',
    content: [
      { arabic: 'أنا', roman: 'Ana', english: 'I' },
      { arabic: 'أنتَ', roman: 'Anta', english: 'You (m)' },
      { arabic: 'أنتِ', roman: 'Anti', english: 'You (f)' },
      { arabic: 'هو', roman: 'Huwa', english: 'He' },
      { arabic: 'هي', roman: 'Hiya', english: 'She' },
      { arabic: 'نحن', roman: 'Nahnu', english: 'We' },
      { arabic: 'أنتم', roman: 'Antum', english: 'You (pl m)' },
      { arabic: 'هم', roman: 'Hum', english: 'They (m)' },
      { arabic: 'هن', roman: 'Hunna', english: 'They (f)' }
    ]
  },
  articles: {
    title: 'The Definite Article',
    explanation: 'In Arabic, "the" is expressed by adding "ال" (al-) to the beginning of a word.',
    examples: [
      { without: 'كتاب (kitab) = book', with: 'الكتاب (al-kitab) = the book' },
      { without: 'بيت (bayt) = house', with: 'البيت (al-bayt) = the house' }
    ]
  },
  gender: {
    title: 'Masculine & Feminine',
    explanation: "Most feminine words end in ة (ta marbuta). Adjectives must match the noun's gender.",
    examples: [
      { masculine: 'كبير (kabir) = big', feminine: 'كبيرة (kabira) = big' },
      { masculine: 'جميل (jamil) = beautiful', feminine: 'جميلة (jamila) = beautiful' }
    ]
  },
  sentences: {
    title: 'Basic Sentence Structure',
    explanation: 'Arabic sentences can begin with a verb (Verbal) or a noun (Nominal).',
    examples: [
      { type: 'Nominal', arabic: 'أنا طالب', roman: 'Ana talib', english: 'I am a student' },
      { type: 'Nominal', arabic: 'هذا كتاب', roman: 'Hadha kitab', english: 'This is a book' }
    ]
  }
}

const islamicLessons = {
  level1: {
    title: 'Foundations of Faith',
    description: 'Understanding the core beliefs of Islam',
    lessons: [
      {
        title: 'The Six Pillars of Iman (Faith)',
        content: 'Belief in Allah, the Angels, the Revealed Books, the Prophets, the Day of Judgment, and Divine Decree (Qadr).',
        details: [
          { pillar: 'Allah', explanation: 'Belief in the oneness of God (Tawhid). Allah is the Creator, Sustainer, and Lord of all that exists.' },
          { pillar: 'Angels', explanation: "Angels are created from light and carry out Allah's commands. Jibreel brought revelation to prophets." },
          { pillar: 'Books', explanation: 'The Quran, Torah, Psalms, and Gospel. The Quran is the final, preserved revelation.' },
          { pillar: 'Prophets', explanation: 'From Adam to Muhammad (PBUH), prophets guided humanity. We honor all messengers equally.' },
          { pillar: 'Day of Judgment', explanation: 'All will be resurrected and held accountable for their deeds.' },
          { pillar: 'Qadr', explanation: "Everything happens by Allah's will and wisdom. We trust His plan while making effort." }
        ]
      },
      {
        title: 'The Five Pillars of Islam',
        content: 'The foundational acts of worship every Muslim should fulfill.',
        details: [
          { pillar: 'Shahada', explanation: 'The declaration of faith: "There is no god but Allah, and Muhammad is His messenger."' },
          { pillar: 'Salah', explanation: 'Five daily prayers at Fajr, Dhuhr, Asr, Maghrib, and Isha. Direct connection with Allah.' },
          { pillar: 'Zakat', explanation: '2.5% of savings given annually to those in need. Purifies wealth and helps community.' },
          { pillar: 'Sawm', explanation: 'Fasting during Ramadan from dawn to sunset. Develops self-discipline and empathy.' },
          { pillar: 'Hajj', explanation: 'Pilgrimage to Mecca once in lifetime if able. Unity of the Muslim ummah.' }
        ]
      }
    ]
  },
  level2: {
    title: 'Prayer & Worship',
    description: 'Learning to connect with Allah through prayer',
    lessons: [
      {
        title: 'How to Perform Wudu (Ablution)',
        content: 'Wudu is the ritual purification before prayer.',
        steps: [
          { step: 1, action: 'Make intention (niyyah) in your heart' },
          { step: 2, action: 'Say "Bismillah" and wash hands 3 times' },
          { step: 3, action: 'Rinse mouth 3 times' },
          { step: 4, action: 'Rinse nose 3 times' },
          { step: 5, action: 'Wash face 3 times' },
          { step: 6, action: 'Wash right arm to elbow 3 times, then left' },
          { step: 7, action: 'Wipe head once with wet hands' },
          { step: 8, action: 'Wipe ears once' },
          { step: 9, action: 'Wash right foot to ankle 3 times, then left' }
        ]
      },
      {
        title: 'The Structure of Salah',
        content: 'Understanding what we say and do in prayer.',
        components: [
          { part: 'Takbir', arabic: 'الله أكبر', meaning: 'Allah is the Greatest', when: 'Starting prayer and between positions' },
          { part: 'Al-Fatiha', arabic: 'الحمد لله رب العالمين', meaning: 'Praise be to Allah, Lord of the Worlds', when: "Recited in every raka'ah" },
          { part: 'Ruku', arabic: 'سبحان ربي العظيم', meaning: 'Glory to my Lord, the Magnificent', when: 'While bowing' },
          { part: 'Sujud', arabic: 'سبحان ربي الأعلى', meaning: 'Glory to my Lord, the Most High', when: 'While prostrating' },
          { part: 'Tashahhud', arabic: 'التحيات لله', meaning: 'All greetings are for Allah', when: "Sitting after 2nd and final raka'ah" },
          { part: 'Salam', arabic: 'السلام عليكم ورحمة الله', meaning: 'Peace and mercy of Allah be upon you', when: 'Ending prayer' }
        ]
      }
    ]
  },
  level3: {
    title: 'Prophetic Guidance',
    description: 'Learning from the Sunnah of Prophet Muhammad (PBUH)',
    lessons: [
      {
        title: 'Daily Duas from the Sunnah',
        content: 'Supplications the Prophet taught us for daily life.',
        duas: [
          { occasion: 'Waking up', arabic: 'الحمد لله الذي أحيانا بعد ما أماتنا وإليه النشور', meaning: 'Praise to Allah who gave us life after death, and to Him is the return' },
          { occasion: 'Before eating', arabic: 'بسم الله', meaning: 'In the name of Allah' },
          { occasion: 'After eating', arabic: 'الحمد لله الذي أطعمنا وسقانا وجعلنا مسلمين', meaning: 'Praise to Allah who fed us, gave us drink, and made us Muslims' },
          { occasion: 'Leaving home', arabic: 'بسم الله توكلت على الله لا حول ولا قوة إلا بالله', meaning: 'In the name of Allah, I trust in Allah, there is no power except with Allah' },
          { occasion: 'Before sleeping', arabic: 'باسمك اللهم أموت وأحيا', meaning: 'In Your name, O Allah, I die and I live' }
        ]
      }
    ]
  },
  level4: {
    title: 'Living Islam',
    description: 'Applying faith in relationships and society',
    lessons: [
      {
        title: 'Islamic Marriage & Family',
        content: 'Building a blessed household.',
        principles: [
          { topic: 'Foundation', teaching: 'Marriage is half of faith. Choose a spouse for their deen (religion) first.' },
          { topic: 'Rights of Spouse', teaching: 'Both have rights over each other. Kindness, respect, and consultation are essential.' },
          { topic: 'Parenting', teaching: 'Children are an amanah (trust). Raise them with love, teach them Islam by example.' },
          { topic: 'Extended Family', teaching: 'Maintaining ties of kinship is obligatory. Honor parents, be good to relatives.' }
        ]
      }
    ]
  }
}

// Urdu Library - EXPANDED
const urduLibrary = {
  greetings: [
    { native: 'السلام علیکم', roman: 'Assalamu alaikum', english: 'Peace be upon you' },
    { native: 'خوش آمدید', roman: 'Khush amdeed', english: 'Welcome' },
    { native: 'کیسے ہو؟', roman: 'Kaise ho?', english: 'How are you?' },
    { native: 'ٹھیک ہوں', roman: 'Theek hoon', english: 'I am fine' },
    { native: 'شکریہ', roman: 'Shukriya', english: 'Thank you' },
    { native: 'خدا حافظ', roman: 'Khuda hafiz', english: 'Goodbye' },
    { native: 'صبح بخیر', roman: 'Subah bakhair', english: 'Good morning' },
    { native: 'شب بخیر', roman: 'Shab bakhair', english: 'Good night' },
    { native: 'الوداع', roman: 'Alvida', english: 'Farewell' },
    { native: 'ملتے ہیں', roman: 'Milte hain', english: 'See you' }
  ],
  love: [
    { native: 'میں تم سے پیار کرتا ہوں', roman: 'Main tum se pyar karta hoon', english: 'I love you (m)' },
    { native: 'میں تم سے پیار کرتی ہوں', roman: 'Main tum se pyar karti hoon', english: 'I love you (f)' },
    { native: 'جان', roman: 'Jaan', english: 'My life/dear' },
    { native: 'میری جان', roman: 'Meri jaan', english: 'My love' },
    { native: 'تم بہت خوبصورت ہو', roman: 'Tum bohat khoobsurat ho', english: 'You are very beautiful' },
    { native: 'مجھے تمہاری یاد آتی ہے', roman: 'Mujhe tumhari yaad aati hai', english: 'I miss you' },
    { native: 'میرا دل', roman: 'Mera dil', english: 'My heart' },
    { native: 'جانم', roman: 'Janam', english: 'My dear' },
    { native: 'میری زندگی', roman: 'Meri zindagi', english: 'My life' },
    { native: 'تم میری دنیا ہو', roman: 'Tum meri duniya ho', english: 'You are my world' },
    { native: 'ہمیشہ کے لیے', roman: 'Hamesha ke liye', english: 'Forever' },
    { native: 'تم سب سے خاص ہو', roman: 'Tum sab se khaas ho', english: 'You are the most special' }
  ],
  family: [
    { native: 'ابو/ابا', roman: 'Abu/Abba', english: 'Father' },
    { native: 'امی/اماں', roman: 'Ami/Amaan', english: 'Mother' },
    { native: 'بھائی', roman: 'Bhai', english: 'Brother' },
    { native: 'بہن', roman: 'Behan', english: 'Sister' },
    { native: 'بیٹا', roman: 'Beta', english: 'Son' },
    { native: 'بیٹی', roman: 'Beti', english: 'Daughter' },
    { native: 'دادا', roman: 'Dada', english: 'Grandfather (paternal)' },
    { native: 'دادی', roman: 'Dadi', english: 'Grandmother (paternal)' },
    { native: 'نانا', roman: 'Nana', english: 'Grandfather (maternal)' },
    { native: 'نانی', roman: 'Nani', english: 'Grandmother (maternal)' },
    { native: 'چاچا', roman: 'Chacha', english: 'Uncle (paternal)' },
    { native: 'ماموں', roman: 'Mamoon', english: 'Uncle (maternal)' },
    { native: 'پھوپھی', roman: 'Phuphi', english: 'Aunt (paternal)' },
    { native: 'خالہ', roman: 'Khala', english: 'Aunt (maternal)' }
  ],
  daily: [
    { native: 'ہاں', roman: 'Haan', english: 'Yes' },
    { native: 'نہیں', roman: 'Nahi', english: 'No' },
    { native: 'کیا', roman: 'Kya', english: 'What' },
    { native: 'کیوں', roman: 'Kyun', english: 'Why' },
    { native: 'کہاں', roman: 'Kahan', english: 'Where' },
    { native: 'کب', roman: 'Kab', english: 'When' },
    { native: 'کیسے', roman: 'Kaise', english: 'How' },
    { native: 'کون', roman: 'Kaun', english: 'Who' },
    { native: 'ابھی', roman: 'Abhi', english: 'Now' },
    { native: 'بعد میں', roman: 'Baad mein', english: 'Later' },
    { native: 'ٹھیک ہے', roman: 'Theek hai', english: 'Okay' },
    { native: 'معاف کیجیے', roman: 'Maaf kijiye', english: 'Excuse me/Sorry' }
  ],
  food: [
    { native: 'پانی', roman: 'Paani', english: 'Water' },
    { native: 'روٹی', roman: 'Roti', english: 'Bread' },
    { native: 'چاول', roman: 'Chawal', english: 'Rice' },
    { native: 'گوشت', roman: 'Gosht', english: 'Meat' },
    { native: 'مرغی', roman: 'Murghi', english: 'Chicken' },
    { native: 'مچھلی', roman: 'Machhli', english: 'Fish' },
    { native: 'سبزی', roman: 'Sabzi', english: 'Vegetables' },
    { native: 'پھل', roman: 'Phal', english: 'Fruit' },
    { native: 'چائے', roman: 'Chai', english: 'Tea' },
    { native: 'دودھ', roman: 'Doodh', english: 'Milk' },
    { native: 'بریانی', roman: 'Biryani', english: 'Biryani' },
    { native: 'نہاری', roman: 'Nihari', english: 'Nihari' }
  ],
  numbers: [
    { native: 'ایک', roman: 'Aik', english: 'One' },
    { native: 'دو', roman: 'Do', english: 'Two' },
    { native: 'تین', roman: 'Teen', english: 'Three' },
    { native: 'چار', roman: 'Chaar', english: 'Four' },
    { native: 'پانچ', roman: 'Paanch', english: 'Five' },
    { native: 'چھ', roman: 'Chhe', english: 'Six' },
    { native: 'سات', roman: 'Saat', english: 'Seven' },
    { native: 'آٹھ', roman: 'Aath', english: 'Eight' },
    { native: 'نو', roman: 'Nau', english: 'Nine' },
    { native: 'دس', roman: 'Das', english: 'Ten' }
  ]
}

// Tagalog Library - EXPANDED
const tagalogLibrary = {
  greetings: [
    { native: 'Kamusta', roman: 'Kamusta', english: 'Hello/How are you' },
    { native: 'Magandang umaga', roman: 'Magandang umaga', english: 'Good morning' },
    { native: 'Magandang hapon', roman: 'Magandang hapon', english: 'Good afternoon' },
    { native: 'Magandang gabi', roman: 'Magandang gabi', english: 'Good evening' },
    { native: 'Salamat', roman: 'Salamat', english: 'Thank you' },
    { native: 'Walang anuman', roman: 'Walang anuman', english: "You're welcome" },
    { native: 'Paalam', roman: 'Paalam', english: 'Goodbye' },
    { native: 'Mabuhay', roman: 'Mabuhay', english: 'Welcome/Long live' },
    { native: 'Ingat', roman: 'Ingat', english: 'Take care' },
    { native: 'Kumain ka na ba?', roman: 'Kumain ka na ba?', english: 'Have you eaten?' }
  ],
  love: [
    { native: 'Mahal kita', roman: 'Mahal kita', english: 'I love you' },
    { native: 'Mahal ko', roman: 'Mahal ko', english: 'My love' },
    { native: 'Aking mahal', roman: 'Aking mahal', english: 'My dear' },
    { native: 'Miss na kita', roman: 'Miss na kita', english: 'I miss you' },
    { native: 'Ikaw ang buhay ko', roman: 'Ikaw ang buhay ko', english: 'You are my life' },
    { native: 'Maganda ka', roman: 'Maganda ka', english: 'You are beautiful' },
    { native: 'Gwapo ka', roman: 'Gwapo ka', english: 'You are handsome' },
    { native: 'Sinta', roman: 'Sinta', english: 'Beloved' },
    { native: 'Irog', roman: 'Irog', english: 'Sweetheart' },
    { native: 'Puso ko', roman: 'Puso ko', english: 'My heart' },
    { native: 'Ikaw lang', roman: 'Ikaw lang', english: 'Only you' },
    { native: "Para sa'yo", roman: "Para sa'yo", english: 'For you' },
    { native: 'Lagi kitang mamahalin', roman: 'Lagi kitang mamahalin', english: 'I will always love you' },
    { native: 'Kasama kita habambuhay', roman: 'Kasama kita habambuhay', english: 'With you forever' }
  ],
  family: [
    { native: 'Tatay/Papa', roman: 'Tatay/Papa', english: 'Father' },
    { native: 'Nanay/Mama', roman: 'Nanay/Mama', english: 'Mother' },
    { native: 'Kuya', roman: 'Kuya', english: 'Older brother' },
    { native: 'Ate', roman: 'Ate', english: 'Older sister' },
    { native: 'Asawa', roman: 'Asawa', english: 'Spouse' },
    { native: 'Anak', roman: 'Anak', english: 'Child' },
    { native: 'Lolo', roman: 'Lolo', english: 'Grandfather' },
    { native: 'Lola', roman: 'Lola', english: 'Grandmother' },
    { native: 'Tito', roman: 'Tito', english: 'Uncle' },
    { native: 'Tita', roman: 'Tita', english: 'Aunt' },
    { native: 'Pinsan', roman: 'Pinsan', english: 'Cousin' },
    { native: 'Pamangkin', roman: 'Pamangkin', english: 'Niece/Nephew' }
  ],
  daily: [
    { native: 'Oo', roman: 'Oo', english: 'Yes' },
    { native: 'Hindi', roman: 'Hindi', english: 'No' },
    { native: 'Ano', roman: 'Ano', english: 'What' },
    { native: 'Bakit', roman: 'Bakit', english: 'Why' },
    { native: 'Saan', roman: 'Saan', english: 'Where' },
    { native: 'Kailan', roman: 'Kailan', english: 'When' },
    { native: 'Paano', roman: 'Paano', english: 'How' },
    { native: 'Sino', roman: 'Sino', english: 'Who' },
    { native: 'Ngayon', roman: 'Ngayon', english: 'Now' },
    { native: 'Mamaya', roman: 'Mamaya', english: 'Later' },
    { native: 'Sige', roman: 'Sige', english: 'Okay/Go ahead' },
    { native: 'Teka', roman: 'Teka', english: 'Wait' }
  ],
  food: [
    { native: 'Tubig', roman: 'Tubig', english: 'Water' },
    { native: 'Kanin', roman: 'Kanin', english: 'Rice' },
    { native: 'Karne', roman: 'Karne', english: 'Meat' },
    { native: 'Manok', roman: 'Manok', english: 'Chicken' },
    { native: 'Isda', roman: 'Isda', english: 'Fish' },
    { native: 'Gulay', roman: 'Gulay', english: 'Vegetables' },
    { native: 'Prutas', roman: 'Prutas', english: 'Fruit' },
    { native: 'Adobo', roman: 'Adobo', english: 'Adobo (Filipino dish)' },
    { native: 'Sinigang', roman: 'Sinigang', english: 'Sinigang (sour soup)' },
    { native: 'Lumpia', roman: 'Lumpia', english: 'Spring rolls' },
    { native: 'Masarap', roman: 'Masarap', english: 'Delicious' },
    { native: 'Gutom na ako', roman: 'Gutom na ako', english: "I'm hungry" }
  ],
  numbers: [
    { native: 'Isa', roman: 'Isa', english: 'One' },
    { native: 'Dalawa', roman: 'Dalawa', english: 'Two' },
    { native: 'Tatlo', roman: 'Tatlo', english: 'Three' },
    { native: 'Apat', roman: 'Apat', english: 'Four' },
    { native: 'Lima', roman: 'Lima', english: 'Five' },
    { native: 'Anim', roman: 'Anim', english: 'Six' },
    { native: 'Pito', roman: 'Pito', english: 'Seven' },
    { native: 'Walo', roman: 'Walo', english: 'Eight' },
    { native: 'Siyam', roman: 'Siyam', english: 'Nine' },
    { native: 'Sampu', roman: 'Sampu', english: 'Ten' }
  ]
}

export default function LearnPage() {
  const { user } = useAuth()
  const [view, setView] = useState('main')
  const [subView, setSubView] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [alphabetIndex, setAlphabetIndex] = useState(0)
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])

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

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : {}
      mediaRecorder.current = new MediaRecorder(stream, options)
      audioChunks.current = []
      mediaRecorder.current.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.current.push(e.data) }
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' })
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }
      mediaRecorder.current.start()
      setRecording(true)
    } catch (err) { console.error('Recording error:', err) }
  }

  const stopRecording = () => { if (mediaRecorder.current && recording) { mediaRecorder.current.stop(); setRecording(false) } }

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
        <div className="px-6 py-8 max-w-lg mx-auto space-y-4">
          {[
            { id: 'arabic', title: 'Arabic & Islam', desc: '150+ words, grammar, alphabet, lessons', letter: 'ع' },
            { id: 'urdu', title: 'Urdu', desc: 'Essential phrases & vocabulary', letter: 'ا' },
            { id: 'tagalog', title: 'Tagalog', desc: 'Filipino expressions & love words', letter: 'T' }
          ].map(lang => (
            <button key={lang.id} onClick={() => setView(lang.id)} className="w-full bg-white rounded-2xl p-6 shadow-soft text-left hover:shadow-card transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-forest rounded-xl flex items-center justify-center text-cream-100 font-serif text-title">{lang.letter}</div>
                <div>
                  <h3 className="font-serif text-title-sm text-forest">{lang.title}</h3>
                  <p className="text-body-sm text-ink-400">{lang.desc}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Arabic Section
  if (view === 'arabic') {
    if (!subView) {
      return (
        <div className="min-h-screen bg-cream pb-28">
          <div className="bg-forest px-6 pt-14 pb-10"><div className="max-w-lg mx-auto"><h1 className="font-serif text-display-sm text-cream-50 mb-2">Arabic & Islam</h1><p className="text-body text-cream-300">العربية</p></div></div>
          <div className="px-6 py-8 max-w-lg mx-auto">
            <BackButton onClick={() => setView('main')} />
            <div className="space-y-4">
              {[{ id: 'vocabulary', title: 'Vocabulary', desc: '150+ words in 8 categories' }, { id: 'alphabet', title: 'Alphabet', desc: '28 letters with positions' }, { id: 'numbers', title: 'Numbers', desc: '0-1000 with Arabic numerals' }, { id: 'grammar', title: 'Grammar', desc: 'Pronouns, articles, gender' }, { id: 'islam', title: 'Islamic Studies', desc: 'Faith, prayer, prophetic guidance' }].map(item => (
                <button key={item.id} onClick={() => setSubView(item.id)} className="w-full bg-white rounded-2xl p-5 shadow-soft text-left"><h3 className="font-serif text-title-sm text-forest">{item.title}</h3><p className="text-body-sm text-ink-400">{item.desc}</p></button>
              ))}
            </div>
          </div>
        </div>
      )
    }
    if (subView === 'vocabulary') {
      if (!selectedCategory) {
        return (
          <div className="min-h-screen bg-cream pb-28">
            <div className="bg-forest px-6 pt-14 pb-10"><div className="max-w-lg mx-auto"><h1 className="font-serif text-display-sm text-cream-50">Arabic Vocabulary</h1></div></div>
            <div className="px-6 py-8 max-w-lg mx-auto"><BackButton onClick={() => setSubView(null)} /><div className="grid grid-cols-2 gap-3">{Object.keys(arabicLibrary).map(cat => (<button key={cat} onClick={() => setSelectedCategory(cat)} className="bg-white rounded-xl p-4 shadow-soft text-left"><p className="font-serif text-title-sm text-forest capitalize">{cat}</p><p className="text-caption text-ink-400">{arabicLibrary[cat].length} words</p></button>))}</div></div>
          </div>
        )
      }
      return (
        <div className="min-h-screen bg-cream pb-28">
          <div className="bg-forest px-6 pt-14 pb-10"><div className="max-w-lg mx-auto"><h1 className="font-serif text-display-sm text-cream-50 capitalize">{selectedCategory}</h1><p className="text-body text-cream-300">{arabicLibrary[selectedCategory].length} words</p></div></div>
          <div className="px-6 py-8 max-w-lg mx-auto"><BackButton onClick={() => setSelectedCategory(null)} /><div className="space-y-4">{arabicLibrary[selectedCategory].map((word, i) => (<div key={i} className="bg-white rounded-2xl p-5 shadow-soft"><p className="text-3xl text-forest mb-2 text-center" dir="rtl">{word.arabic}</p><p className="font-serif text-title-sm text-forest text-center">{word.roman}</p><p className="text-body text-ink-500 text-center mb-2">{word.english}</p><div className="bg-gold-50 rounded-xl p-3"><p className="text-body-sm text-gold-700 text-center">{word.usage}</p></div><div className="mt-4 pt-4 border-t border-cream-200"><p className="text-caption text-ink-400 mb-2 text-center">Practice pronunciation</p><div className="flex justify-center gap-3">{!recording ? (<button onClick={startRecording} className="px-4 py-2 bg-forest text-cream-100 rounded-lg text-body-sm">Record</button>) : (<button onClick={stopRecording} className="px-4 py-2 bg-rose-500 text-white rounded-lg text-body-sm animate-pulse">Stop</button>)}{audioUrl && <audio controls src={audioUrl} className="h-10" />}</div></div></div>))}</div></div>
        </div>
      )
    }
    if (subView === 'alphabet') {
      const letter = arabicAlphabet[alphabetIndex]
      return (
        <div className="min-h-screen bg-cream pb-28">
          <div className="bg-forest px-6 pt-14 pb-10"><div className="max-w-lg mx-auto"><h1 className="font-serif text-display-sm text-cream-50">Arabic Alphabet</h1></div></div>
          <div className="px-6 py-8 max-w-lg mx-auto"><BackButton onClick={() => setSubView(null)} /><div className="bg-white rounded-2xl p-8 shadow-soft mb-6"><p className="text-8xl text-forest text-center mb-4" dir="rtl">{letter.letter}</p><p className="font-serif text-display-sm text-forest text-center">{letter.name}</p><p className="text-body text-ink-500 text-center mb-4">Sound: {letter.sound}</p><div className="bg-cream-50 rounded-xl p-4"><p className="text-body-sm text-ink-400 text-center mb-1">Positions</p><p className="text-2xl text-forest text-center" dir="rtl">{letter.position}</p></div></div><div className="flex justify-between items-center"><button onClick={() => setAlphabetIndex(i => Math.max(0, i - 1))} disabled={alphabetIndex === 0} className="px-6 py-3 bg-white rounded-xl shadow-soft disabled:opacity-50">Previous</button><span className="text-body text-ink-500">{alphabetIndex + 1} / {arabicAlphabet.length}</span><button onClick={() => setAlphabetIndex(i => Math.min(arabicAlphabet.length - 1, i + 1))} disabled={alphabetIndex === arabicAlphabet.length - 1} className="px-6 py-3 bg-white rounded-xl shadow-soft disabled:opacity-50">Next</button></div></div>
        </div>
      )
    }
    if (subView === 'numbers') {
      return (
        <div className="min-h-screen bg-cream pb-28">
          <div className="bg-forest px-6 pt-14 pb-10"><div className="max-w-lg mx-auto"><h1 className="font-serif text-display-sm text-cream-50">Arabic Numbers</h1></div></div>
          <div className="px-6 py-8 max-w-lg mx-auto"><BackButton onClick={() => setSubView(null)} /><div className="space-y-3">{arabicNumbers.map((n, i) => (<div key={i} className="bg-white rounded-xl p-4 shadow-soft flex items-center justify-between"><div className="flex items-center gap-4"><span className="text-2xl font-bold text-ink-600 w-12">{n.num}</span><span className="text-3xl text-forest">{n.arabic}</span></div><div className="text-right"><p className="text-xl text-forest" dir="rtl">{n.word}</p><p className="text-body-sm text-ink-400">{n.roman}</p></div></div>))}</div></div>
        </div>
      )
    }
    if (subView === 'grammar') {
      if (!selectedCategory) {
        return (
          <div className="min-h-screen bg-cream pb-28">
            <div className="bg-forest px-6 pt-14 pb-10"><div className="max-w-lg mx-auto"><h1 className="font-serif text-display-sm text-cream-50">Arabic Grammar</h1></div></div>
            <div className="px-6 py-8 max-w-lg mx-auto"><BackButton onClick={() => setSubView(null)} /><div className="space-y-3">{Object.entries(arabicGrammar).map(([key, section]) => (<button key={key} onClick={() => setSelectedCategory(key)} className="w-full bg-white rounded-xl p-5 shadow-soft text-left"><h3 className="font-serif text-title-sm text-forest">{section.title}</h3></button>))}</div></div>
          </div>
        )
      }
      const section = arabicGrammar[selectedCategory]
      return (
        <div className="min-h-screen bg-cream pb-28">
          <div className="bg-forest px-6 pt-14 pb-10"><div className="max-w-lg mx-auto"><h1 className="font-serif text-display-sm text-cream-50">{section.title}</h1></div></div>
          <div className="px-6 py-8 max-w-lg mx-auto"><BackButton onClick={() => setSelectedCategory(null)} />{section.explanation && <p className="text-body text-ink-500 mb-6">{section.explanation}</p>}{section.content && <div className="space-y-3 mb-6">{section.content.map((item, i) => (<div key={i} className="bg-white rounded-xl p-4 shadow-soft"><p className="text-2xl text-forest text-center" dir="rtl">{item.arabic}</p><p className="font-medium text-forest text-center">{item.roman}</p><p className="text-body-sm text-ink-500 text-center">{item.english}</p></div>))}</div>}{section.examples && <div className="space-y-3">{section.examples.map((ex, i) => (<div key={i} className="bg-white rounded-xl p-4 shadow-soft">{ex.without && <p className="text-body text-ink-500">{ex.without}</p>}{ex.with && <p className="text-body text-forest font-medium">{ex.with}</p>}{ex.masculine && <p className="text-body text-ink-500">M: {ex.masculine}</p>}{ex.feminine && <p className="text-body text-forest">F: {ex.feminine}</p>}{ex.type && <p className="text-caption text-ink-400">{ex.type}</p>}{ex.arabic && <p className="text-xl text-forest" dir="rtl">{ex.arabic}</p>}{ex.roman && <p className="text-body text-ink-500">{ex.roman}</p>}{ex.english && <p className="text-body-sm text-ink-400">{ex.english}</p>}</div>))}</div>}</div>
        </div>
      )
    }
    if (subView === 'islam') {
      if (!selectedCategory) {
        return (
          <div className="min-h-screen bg-cream pb-28">
            <div className="bg-forest px-6 pt-14 pb-10"><div className="max-w-lg mx-auto"><h1 className="font-serif text-display-sm text-cream-50">Islamic Studies</h1><p className="text-body text-cream-300">4 Levels of Growth</p></div></div>
            <div className="px-6 py-8 max-w-lg mx-auto"><BackButton onClick={() => setSubView(null)} /><div className="space-y-4">{Object.entries(islamicLessons).map(([key, level], i) => (<button key={key} onClick={() => setSelectedCategory(key)} className="w-full bg-white rounded-2xl p-5 shadow-soft text-left hover:shadow-card transition-shadow"><div className="flex items-center gap-4"><div className="w-12 h-12 bg-forest rounded-full flex items-center justify-center text-cream-100 font-serif text-title">{i + 1}</div><div><p className="font-serif text-title-sm text-forest">{level.title}</p><p className="text-body-sm text-ink-400">{level.description}</p></div></div></button>))}</div></div>
          </div>
        )
      }
      const level = islamicLessons[selectedCategory]
      if (selectedLesson === null) {
        return (
          <div className="min-h-screen bg-cream pb-28">
            <div className="bg-forest px-6 pt-14 pb-10"><div className="max-w-lg mx-auto"><h1 className="font-serif text-display-sm text-cream-50">{level.title}</h1><p className="text-body text-cream-300">{level.description}</p></div></div>
            <div className="px-6 py-8 max-w-lg mx-auto"><BackButton onClick={() => setSelectedCategory(null)} /><div className="space-y-3">{level.lessons.map((lesson, i) => (<button key={i} onClick={() => setSelectedLesson(i)} className="w-full bg-white rounded-xl p-5 shadow-soft text-left"><h3 className="font-serif text-title-sm text-forest">{lesson.title}</h3><p className="text-body-sm text-ink-400 line-clamp-2">{lesson.content}</p></button>))}</div></div>
          </div>
        )
      }
      const lesson = level.lessons[selectedLesson]
      return (
        <div className="min-h-screen bg-cream pb-28">
          <div className="bg-forest px-6 pt-14 pb-10"><div className="max-w-lg mx-auto"><h1 className="font-serif text-display-sm text-cream-50">{lesson.title}</h1></div></div>
          <div className="px-6 py-8 max-w-lg mx-auto"><BackButton onClick={() => setSelectedLesson(null)} /><p className="text-body text-ink-500 mb-6">{lesson.content}</p>{lesson.details && <div className="space-y-4">{lesson.details.map((item, i) => (<div key={i} className="bg-white rounded-xl p-5 shadow-soft"><h4 className="font-serif text-title-sm text-forest mb-2">{item.pillar}</h4><p className="text-body text-ink-500">{item.explanation}</p></div>))}</div>}{lesson.steps && <div className="space-y-3">{lesson.steps.map((item, i) => (<div key={i} className="bg-white rounded-xl p-4 shadow-soft flex items-center gap-4"><div className="w-10 h-10 bg-forest rounded-full flex items-center justify-center text-cream-100 font-bold flex-shrink-0">{item.step}</div><p className="text-body text-ink-600">{item.action}</p></div>))}</div>}{lesson.components && <div className="space-y-4">{lesson.components.map((item, i) => (<div key={i} className="bg-white rounded-xl p-5 shadow-soft"><h4 className="font-serif text-title-sm text-forest">{item.part}</h4><p className="text-xl text-forest my-2" dir="rtl">{item.arabic}</p><p className="text-body text-ink-600 mb-1">{item.meaning}</p><p className="text-body-sm text-ink-400">{item.when}</p></div>))}</div>}{lesson.duas && <div className="space-y-4">{lesson.duas.map((dua, i) => (<div key={i} className="bg-white rounded-xl p-5 shadow-soft"><p className="text-caption text-gold-600 mb-2">{dua.occasion}</p><p className="text-xl text-forest mb-2 text-center" dir="rtl">{dua.arabic}</p><p className="text-body text-ink-500 text-center">{dua.meaning}</p></div>))}</div>}{lesson.principles && <div className="space-y-4">{lesson.principles.map((item, i) => (<div key={i} className="bg-white rounded-xl p-5 shadow-soft"><h4 className="font-serif text-title-sm text-forest mb-2">{item.topic}</h4><p className="text-body text-ink-500">{item.teaching}</p></div>))}</div>}</div>
        </div>
      )
    }
  }

  // Urdu Section
  if (view === 'urdu') {
    if (!selectedCategory) {
      return (
        <div className="min-h-screen bg-cream pb-28">
          <div className="bg-forest px-6 pt-14 pb-10"><div className="max-w-lg mx-auto"><h1 className="font-serif text-display-sm text-cream-50">Urdu</h1><p className="text-body text-cream-300">اردو</p></div></div>
          <div className="px-6 py-8 max-w-lg mx-auto"><BackButton onClick={() => setView('main')} /><div className="grid grid-cols-2 gap-3">{Object.keys(urduLibrary).map(cat => (<button key={cat} onClick={() => setSelectedCategory(cat)} className="bg-white rounded-xl p-4 shadow-soft text-left"><p className="font-serif text-title-sm text-forest capitalize">{cat}</p><p className="text-caption text-ink-400">{urduLibrary[cat].length} phrases</p></button>))}</div></div>
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-cream pb-28">
        <div className="bg-forest px-6 pt-14 pb-10"><div className="max-w-lg mx-auto"><h1 className="font-serif text-display-sm text-cream-50 capitalize">{selectedCategory}</h1></div></div>
        <div className="px-6 py-8 max-w-lg mx-auto"><BackButton onClick={() => setSelectedCategory(null)} /><div className="space-y-4">{urduLibrary[selectedCategory].map((word, i) => (<div key={i} className="bg-white rounded-2xl p-5 shadow-soft"><p className="text-2xl text-forest mb-2 text-center" dir="rtl">{word.native}</p><p className="font-serif text-title-sm text-forest text-center">{word.roman}</p><p className="text-body text-ink-500 text-center">{word.english}</p></div>))}</div></div>
      </div>
    )
  }

  // Tagalog Section
  if (view === 'tagalog') {
    if (!selectedCategory) {
      return (
        <div className="min-h-screen bg-cream pb-28">
          <div className="bg-forest px-6 pt-14 pb-10"><div className="max-w-lg mx-auto"><h1 className="font-serif text-display-sm text-cream-50">Tagalog</h1><p className="text-body text-cream-300">Filipino</p></div></div>
          <div className="px-6 py-8 max-w-lg mx-auto"><BackButton onClick={() => setView('main')} /><div className="grid grid-cols-2 gap-3">{Object.keys(tagalogLibrary).map(cat => (<button key={cat} onClick={() => setSelectedCategory(cat)} className="bg-white rounded-xl p-4 shadow-soft text-left"><p className="font-serif text-title-sm text-forest capitalize">{cat}</p><p className="text-caption text-ink-400">{tagalogLibrary[cat].length} phrases</p></button>))}</div></div>
        </div>
      )
    }
    return (
      <div className="min-h-screen bg-cream pb-28">
        <div className="bg-forest px-6 pt-14 pb-10"><div className="max-w-lg mx-auto"><h1 className="font-serif text-display-sm text-cream-50 capitalize">{selectedCategory}</h1></div></div>
        <div className="px-6 py-8 max-w-lg mx-auto"><BackButton onClick={() => setSelectedCategory(null)} /><div className="space-y-4">{tagalogLibrary[selectedCategory].map((word, i) => (<div key={i} className="bg-white rounded-2xl p-5 shadow-soft"><p className="text-2xl text-forest mb-2 text-center">{word.native}</p>{word.roman !== word.native && <p className="font-serif text-title-sm text-forest text-center">{word.roman}</p>}<p className="text-body text-ink-500 text-center">{word.english}</p></div>))}</div></div>
      </div>
    )
  }

  return null
}
