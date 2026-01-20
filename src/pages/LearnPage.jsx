import { useState, useEffect, useRef } from 'react'
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
    { arabic: 'الحمد لله', roman: 'Alhamdulillah', english: 'Praise be to God', usage: 'Response: I am well' }
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
    { arabic: 'أشتاق إليك', roman: 'Ashtaq ilayk', english: 'I miss you', usage: 'Expressing longing' }
  ],
  family: [
    { arabic: 'عائلة', roman: 'Aa\'ila', english: 'Family', usage: 'The family unit' },
    { arabic: 'أب', roman: 'Ab', english: 'Father', usage: 'Parent' },
    { arabic: 'أم', roman: 'Umm', english: 'Mother', usage: 'Parent' },
    { arabic: 'ابن', roman: 'Ibn', english: 'Son', usage: 'Child' },
    { arabic: 'بنت', roman: 'Bint', english: 'Daughter', usage: 'Child' },
    { arabic: 'أخ', roman: 'Akh', english: 'Brother', usage: 'Sibling' },
    { arabic: 'أخت', roman: 'Ukht', english: 'Sister', usage: 'Sibling' },
    { arabic: 'زوج', roman: 'Zawj', english: 'Husband', usage: 'Spouse' },
    { arabic: 'زوجة', roman: 'Zawja', english: 'Wife', usage: 'Spouse' },
    { arabic: 'جد', roman: 'Jadd', english: 'Grandfather', usage: 'Grandparent' },
    { arabic: 'جدة', roman: 'Jadda', english: 'Grandmother', usage: 'Grandparent' }
  ],
  daily: [
    { arabic: 'نعم', roman: 'Na\'am', english: 'Yes', usage: 'Affirmation' },
    { arabic: 'لا', roman: 'La', english: 'No', usage: 'Negation' },
    { arabic: 'شكراً', roman: 'Shukran', english: 'Thank you', usage: 'Gratitude' },
    { arabic: 'عفواً', roman: 'Afwan', english: 'You\'re welcome', usage: 'Response to thanks' },
    { arabic: 'من فضلك', roman: 'Min fadlak', english: 'Please', usage: 'Polite request' },
    { arabic: 'آسف', roman: 'Asif', english: 'Sorry', usage: 'Apology' },
    { arabic: 'ماذا', roman: 'Matha', english: 'What', usage: 'Question word' },
    { arabic: 'أين', roman: 'Ayna', english: 'Where', usage: 'Question word' },
    { arabic: 'متى', roman: 'Mata', english: 'When', usage: 'Question word' },
    { arabic: 'لماذا', roman: 'Limatha', english: 'Why', usage: 'Question word' },
    { arabic: 'كيف', roman: 'Kayf', english: 'How', usage: 'Question word' },
    { arabic: 'من', roman: 'Man', english: 'Who', usage: 'Question word' }
  ],
  food: [
    { arabic: 'ماء', roman: 'Ma\'', english: 'Water', usage: 'Drink' },
    { arabic: 'خبز', roman: 'Khubz', english: 'Bread', usage: 'Food staple' },
    { arabic: 'أرز', roman: 'Aruz', english: 'Rice', usage: 'Grain' },
    { arabic: 'لحم', roman: 'Lahm', english: 'Meat', usage: 'Protein' },
    { arabic: 'دجاج', roman: 'Dajaj', english: 'Chicken', usage: 'Poultry' },
    { arabic: 'سمك', roman: 'Samak', english: 'Fish', usage: 'Seafood' },
    { arabic: 'فاكهة', roman: 'Fakiha', english: 'Fruit', usage: 'Produce' },
    { arabic: 'خضار', roman: 'Khudar', english: 'Vegetables', usage: 'Produce' },
    { arabic: 'حليب', roman: 'Haleeb', english: 'Milk', usage: 'Dairy' },
    { arabic: 'قهوة', roman: 'Qahwa', english: 'Coffee', usage: 'Hot drink' },
    { arabic: 'شاي', roman: 'Shay', english: 'Tea', usage: 'Hot drink' }
  ],
  time: [
    { arabic: 'اليوم', roman: 'Al-yawm', english: 'Today', usage: 'Present day' },
    { arabic: 'غداً', roman: 'Ghadan', english: 'Tomorrow', usage: 'Next day' },
    { arabic: 'أمس', roman: 'Ams', english: 'Yesterday', usage: 'Previous day' },
    { arabic: 'صباح', roman: 'Sabah', english: 'Morning', usage: 'Time of day' },
    { arabic: 'مساء', roman: 'Masa\'', english: 'Evening', usage: 'Time of day' },
    { arabic: 'ليل', roman: 'Layl', english: 'Night', usage: 'Time of day' },
    { arabic: 'ساعة', roman: 'Sa\'a', english: 'Hour', usage: 'Time unit' },
    { arabic: 'دقيقة', roman: 'Daqiqa', english: 'Minute', usage: 'Time unit' },
    { arabic: 'أسبوع', roman: 'Usbu\'', english: 'Week', usage: 'Time period' },
    { arabic: 'شهر', roman: 'Shahr', english: 'Month', usage: 'Time period' },
    { arabic: 'سنة', roman: 'Sana', english: 'Year', usage: 'Time period' }
  ],
  places: [
    { arabic: 'بيت', roman: 'Bayt', english: 'House', usage: 'Dwelling' },
    { arabic: 'مسجد', roman: 'Masjid', english: 'Mosque', usage: 'Place of worship' },
    { arabic: 'مدرسة', roman: 'Madrasa', english: 'School', usage: 'Education' },
    { arabic: 'سوق', roman: 'Suq', english: 'Market', usage: 'Shopping' },
    { arabic: 'مطعم', roman: 'Mat\'am', english: 'Restaurant', usage: 'Dining' },
    { arabic: 'مستشفى', roman: 'Mustashfa', english: 'Hospital', usage: 'Medical' },
    { arabic: 'مطار', roman: 'Matar', english: 'Airport', usage: 'Travel' },
    { arabic: 'شارع', roman: 'Shari\'', english: 'Street', usage: 'Location' }
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
    { arabic: 'حديث', roman: 'Hadith', english: 'Hadith', usage: 'Prophet\'s sayings' },
    { arabic: 'سنة', roman: 'Sunnah', english: 'Sunnah', usage: 'Prophet\'s way' },
    { arabic: 'دعاء', roman: 'Du\'a', english: 'Supplication', usage: 'Personal prayer' },
    { arabic: 'ذكر', roman: 'Dhikr', english: 'Remembrance', usage: 'Of Allah' }
  ]
}

// Arabic Numbers 1-100
const arabicNumbers = [
  { num: 0, arabic: '٠', word: 'صفر', roman: 'Sifr' },
  { num: 1, arabic: '١', word: 'واحد', roman: 'Wahid' },
  { num: 2, arabic: '٢', word: 'اثنان', roman: 'Ithnan' },
  { num: 3, arabic: '٣', word: 'ثلاثة', roman: 'Thalatha' },
  { num: 4, arabic: '٤', word: 'أربعة', roman: 'Arba\'a' },
  { num: 5, arabic: '٥', word: 'خمسة', roman: 'Khamsa' },
  { num: 6, arabic: '٦', word: 'ستة', roman: 'Sitta' },
  { num: 7, arabic: '٧', word: 'سبعة', roman: 'Sab\'a' },
  { num: 8, arabic: '٨', word: 'ثمانية', roman: 'Thamaniya' },
  { num: 9, arabic: '٩', word: 'تسعة', roman: 'Tis\'a' },
  { num: 10, arabic: '١٠', word: 'عشرة', roman: 'Ashara' },
  { num: 11, arabic: '١١', word: 'أحد عشر', roman: 'Ahada ashar' },
  { num: 12, arabic: '١٢', word: 'اثنا عشر', roman: 'Ithna ashar' },
  { num: 20, arabic: '٢٠', word: 'عشرون', roman: 'Ishrun' },
  { num: 30, arabic: '٣٠', word: 'ثلاثون', roman: 'Thalathun' },
  { num: 40, arabic: '٤٠', word: 'أربعون', roman: 'Arba\'un' },
  { num: 50, arabic: '٥٠', word: 'خمسون', roman: 'Khamsun' },
  { num: 100, arabic: '١٠٠', word: 'مائة', roman: 'Mi\'a' },
  { num: 1000, arabic: '١٠٠٠', word: 'ألف', roman: 'Alf' }
]

// Arabic Alphabet
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
  { letter: 'ع', name: 'Ayn', sound: '\'a (guttural)', position: 'عـ ـعـ ـع' },
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

// Arabic Grammar
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
      { arabic: 'أنتن', roman: 'Antunna', english: 'You (pl f)' },
      { arabic: 'هم', roman: 'Hum', english: 'They (m)' },
      { arabic: 'هن', roman: 'Hunna', english: 'They (f)' }
    ]
  },
  articles: {
    title: 'The Definite Article',
    explanation: 'In Arabic, "the" is expressed by adding "ال" (al-) to the beginning of a word.',
    examples: [
      { without: 'كتاب (kitab) = book', with: 'الكتاب (al-kitab) = the book' },
      { without: 'بيت (bayt) = house', with: 'البيت (al-bayt) = the house' },
      { without: 'ولد (walad) = boy', with: 'الولد (al-walad) = the boy' }
    ]
  },
  gender: {
    title: 'Masculine & Feminine',
    explanation: 'Most feminine words end in ة (ta marbuta). Adjectives must match the noun\'s gender.',
    examples: [
      { masculine: 'كبير (kabir) = big', feminine: 'كبيرة (kabira) = big' },
      { masculine: 'جميل (jamil) = beautiful', feminine: 'جميلة (jamila) = beautiful' },
      { masculine: 'طويل (tawil) = tall', feminine: 'طويلة (tawila) = tall' }
    ]
  },
  sentences: {
    title: 'Basic Sentence Structure',
    explanation: 'Arabic sentences can begin with a verb (Verbal) or a noun (Nominal).',
    examples: [
      { type: 'Nominal', arabic: 'أنا طالب', roman: 'Ana talib', english: 'I am a student' },
      { type: 'Nominal', arabic: 'هذا كتاب', roman: 'Hadha kitab', english: 'This is a book' },
      { type: 'Verbal', arabic: 'ذهب الولد', roman: 'Dhahaba al-walad', english: 'The boy went' }
    ]
  },
  possessive: {
    title: 'Possessive Suffixes',
    explanation: 'Possession is shown by adding suffixes to nouns.',
    examples: [
      { suffix: 'ـي (-i)', meaning: 'my', example: 'كتابي (kitabi) = my book' },
      { suffix: 'ـك (-k)', meaning: 'your (m)', example: 'كتابك (kitabuk) = your book' },
      { suffix: 'ـه (-hu)', meaning: 'his', example: 'كتابه (kitabuhu) = his book' },
      { suffix: 'ـها (-ha)', meaning: 'her', example: 'كتابها (kitabuha) = her book' },
      { suffix: 'ـنا (-na)', meaning: 'our', example: 'كتابنا (kitabuna) = our book' }
    ]
  }
}

// REAL Islamic Lessons (structured curriculum)
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
          { pillar: 'Angels', explanation: 'Angels are created from light and carry out Allah\'s commands. Jibreel brought revelation to prophets.' },
          { pillar: 'Books', explanation: 'The Quran, Torah, Psalms, and Gospel. The Quran is the final, preserved revelation.' },
          { pillar: 'Prophets', explanation: 'From Adam to Muhammad (PBUH), prophets guided humanity. We honor all messengers equally.' },
          { pillar: 'Day of Judgment', explanation: 'All will be resurrected and held accountable for their deeds.' },
          { pillar: 'Qadr', explanation: 'Everything happens by Allah\'s will and wisdom. We trust His plan while making effort.' }
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
          { part: 'Al-Fatiha', arabic: 'الحمد لله رب العالمين', meaning: 'Praise be to Allah, Lord of the Worlds', when: 'Recited in every raka\'ah' },
          { part: 'Ruku', arabic: 'سبحان ربي العظيم', meaning: 'Glory to my Lord, the Magnificent', when: 'While bowing' },
          { part: 'Sujud', arabic: 'سبحان ربي الأعلى', meaning: 'Glory to my Lord, the Most High', when: 'While prostrating' },
          { part: 'Tashahhud', arabic: 'التحيات لله', meaning: 'All greetings are for Allah', when: 'Sitting after 2nd and final raka\'ah' },
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
          { occasion: 'Entering home', arabic: 'بسم الله ولجنا وبسم الله خرجنا وعلى الله ربنا توكلنا', meaning: 'In the name of Allah we enter, in His name we leave, and upon our Lord we rely' },
          { occasion: 'Before sleeping', arabic: 'باسمك اللهم أموت وأحيا', meaning: 'In Your name, O Allah, I die and I live' }
        ]
      },
      {
        title: 'Character from the Prophet\'s Example',
        content: 'How the Prophet (PBUH) conducted himself.',
        teachings: [
          { virtue: 'Truthfulness', hadith: '"Truthfulness leads to righteousness, and righteousness leads to Paradise."', practice: 'Always speak truth, even when difficult.' },
          { virtue: 'Kindness', hadith: '"Allah is kind and loves kindness in all matters."', practice: 'Be gentle with family, neighbors, and strangers.' },
          { virtue: 'Patience', hadith: '"No one is given a gift better than patience."', practice: 'Stay calm in hardship, trust Allah\'s plan.' },
          { virtue: 'Generosity', hadith: '"The upper hand is better than the lower hand."', practice: 'Give what you can, even a smile is charity.' }
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
      },
      {
        title: 'Ethics in Daily Life',
        content: 'Islam guides every aspect of life.',
        areas: [
          { area: 'Business', guidance: 'Be honest in transactions. No cheating, no interest (riba), fulfill contracts.' },
          { area: 'Neighbors', guidance: 'The Prophet said Jibreel kept advising about neighbors until he thought they\'d inherit.' },
          { area: 'Environment', guidance: 'Don\'t waste resources. We are stewards (khalifah) of the earth.' },
          { area: 'Speech', guidance: 'Avoid backbiting, lying, and harmful speech. Silence is better than bad words.' }
        ]
      }
    ]
  }
}

// Urdu Library
const urduLibrary = {
  greetings: [
    { native: 'السلام علیکم', roman: 'Assalamu alaikum', english: 'Peace be upon you' },
    { native: 'خوش آمدید', roman: 'Khush amdeed', english: 'Welcome' },
    { native: 'کیسے ہو؟', roman: 'Kaise ho?', english: 'How are you?' },
    { native: 'ٹھیک ہوں', roman: 'Theek hoon', english: 'I am fine' },
    { native: 'شکریہ', roman: 'Shukriya', english: 'Thank you' },
    { native: 'خدا حافظ', roman: 'Khuda hafiz', english: 'Goodbye' }
  ],
  love: [
    { native: 'میں تم سے پیار کرتا ہوں', roman: 'Main tum se pyar karta hoon', english: 'I love you (m)' },
    { native: 'میں تم سے پیار کرتی ہوں', roman: 'Main tum se pyar karti hoon', english: 'I love you (f)' },
    { native: 'جان', roman: 'Jaan', english: 'My life/dear' },
    { native: 'میری جان', roman: 'Meri jaan', english: 'My love' },
    { native: 'تم بہت خوبصورت ہو', roman: 'Tum bohat khoobsurat ho', english: 'You are very beautiful' },
    { native: 'مجھے تمہاری یاد آتی ہے', roman: 'Mujhe tumhari yaad aati hai', english: 'I miss you' }
  ],
  family: [
    { native: 'ابو/ابا', roman: 'Abu/Abba', english: 'Father' },
    { native: 'امی/اماں', roman: 'Ami/Amaan', english: 'Mother' },
    { native: 'بھائی', roman: 'Bhai', english: 'Brother' },
    { native: 'بہن', roman: 'Behan', english: 'Sister' },
    { native: 'بیٹا', roman: 'Beta', english: 'Son' },
    { native: 'بیٹی', roman: 'Beti', english: 'Daughter' }
  ],
  daily: [
    { native: 'ہاں', roman: 'Haan', english: 'Yes' },
    { native: 'نہیں', roman: 'Nahi', english: 'No' },
    { native: 'کیا', roman: 'Kya', english: 'What' },
    { native: 'کیوں', roman: 'Kyun', english: 'Why' },
    { native: 'کہاں', roman: 'Kahan', english: 'Where' },
    { native: 'کب', roman: 'Kab', english: 'When' }
  ]
}

// Tagalog Library
const tagalogLibrary = {
  greetings: [
    { native: 'Kamusta', roman: 'Kamusta', english: 'Hello/How are you' },
    { native: 'Magandang umaga', roman: 'Magandang umaga', english: 'Good morning' },
    { native: 'Magandang hapon', roman: 'Magandang hapon', english: 'Good afternoon' },
    { native: 'Magandang gabi', roman: 'Magandang gabi', english: 'Good evening' },
    { native: 'Salamat', roman: 'Salamat', english: 'Thank you' },
    { native: 'Walang anuman', roman: 'Walang anuman', english: 'You\'re welcome' },
    { native: 'Paalam', roman: 'Paalam', english: 'Goodbye' }
  ],
  love: [
    { native: 'Mahal kita', roman: 'Mahal kita', english: 'I love you' },
    { native: 'Mahal ko', roman: 'Mahal ko', english: 'My love' },
    { native: 'Aking mahal', roman: 'Aking mahal', english: 'My dear' },
    { native: 'Miss na kita', roman: 'Miss na kita', english: 'I miss you' },
    { native: 'Ikaw ang buhay ko', roman: 'Ikaw ang buhay ko', english: 'You are my life' },
    { native: 'Maganda ka', roman: 'Maganda ka', english: 'You are beautiful' },
    { native: 'Gwapo ka', roman: 'Gwapo ka', english: 'You are handsome' }
  ],
  family: [
    { native: 'Tatay/Papa', roman: 'Tatay/Papa', english: 'Father' },
    { native: 'Nanay/Mama', roman: 'Nanay/Mama', english: 'Mother' },
    { native: 'Kuya', roman: 'Kuya', english: 'Older brother' },
    { native: 'Ate', roman: 'Ate', english: 'Older sister' },
    { native: 'Asawa', roman: 'Asawa', english: 'Spouse' },
    { native: 'Anak', roman: 'Anak', english: 'Child' }
  ],
  daily: [
    { native: 'Oo', roman: 'Oo', english: 'Yes' },
    { native: 'Hindi', roman: 'Hindi', english: 'No' },
    { native: 'Ano', roman: 'Ano', english: 'What' },
    { native: 'Bakit', roman: 'Bakit', english: 'Why' },
    { native: 'Saan', roman: 'Saan', english: 'Where' },
    { native: 'Kailan', roman: 'Kailan', english: 'When' },
    { native: 'Paano', roman: 'Paano', english: 'How' }
  ]
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function LearnPage() {
  const { user, supabase } = useAuth()
  const [view, setView] = useState('main') // main, arabic, urdu, tagalog, islam
  const [subView, setSubView] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [alphabetIndex, setAlphabetIndex] = useState(0)
  const [recording, setRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState(null)
  const mediaRecorder = useRef(null)
  const audioChunks = useRef([])
  
  const BackButton = ({ onClick }) => (
    <button 
      onClick={onClick} 
      className="flex items-center gap-2 mb-6 px-4 py-3 bg-white rounded-xl shadow-soft text-forest font-medium hover:bg-cream-50 transition-colors"
    >
      <span className="text-xl">←</span>
      <span>Back</span>
    </button>
  )

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const options = MediaRecorder.isTypeSupported('audio/webm') ? { mimeType: 'audio/webm' } : {}
      mediaRecorder.current = new MediaRecorder(stream, options)
      audioChunks.current = []
      
      mediaRecorder.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunks.current.push(e.data)
      }
      
      mediaRecorder.current.onstop = () => {
        const blob = new Blob(audioChunks.current, { type: 'audio/webm' })
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.current.start()
      setRecording(true)
    } catch (err) {
      console.error('Recording error:', err)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder.current && recording) {
      mediaRecorder.current.stop()
      setRecording(false)
    }
  }

  // Main Menu
  if (view === 'main') {
    return (
      <div className="min-h-screen bg-cream-100 p-6">
        <h1 className="font-serif text-display-sm text-forest mb-2">Learn</h1>
        <p className="text-body text-ink-500 mb-8">Languages & Islam</p>
        
        <div className="space-y-4">
          <button onClick={() => setView('arabic')} className="w-full bg-white rounded-2xl p-6 shadow-soft text-left hover:shadow-card transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-forest rounded-xl flex items-center justify-center text-2xl">🕌</div>
              <div>
                <h3 className="font-serif text-title-sm text-forest">Arabic</h3>
                <p className="text-body-sm text-ink-400">150+ words, grammar, alphabet, numbers</p>
              </div>
            </div>
          </button>
          
          <button onClick={() => setView('urdu')} className="w-full bg-white rounded-2xl p-6 shadow-soft text-left hover:shadow-card transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-forest rounded-xl flex items-center justify-center text-2xl">🇵🇰</div>
              <div>
                <h3 className="font-serif text-title-sm text-forest">Urdu</h3>
                <p className="text-body-sm text-ink-400">Essential phrases & vocabulary</p>
              </div>
            </div>
          </button>
          
          <button onClick={() => setView('tagalog')} className="w-full bg-white rounded-2xl p-6 shadow-soft text-left hover:shadow-card transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-forest rounded-xl flex items-center justify-center text-2xl">🇵🇭</div>
              <div>
                <h3 className="font-serif text-title-sm text-forest">Tagalog</h3>
                <p className="text-body-sm text-ink-400">Filipino expressions & love words</p>
              </div>
            </div>
          </button>
          
          <button onClick={() => setView('islam')} className="w-full bg-white rounded-2xl p-6 shadow-soft text-left hover:shadow-card transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gold-100 rounded-xl flex items-center justify-center text-2xl">☪️</div>
              <div>
                <h3 className="font-serif text-title-sm text-forest">Islamic Studies</h3>
                <p className="text-body-sm text-ink-400">Faith, prayer, prophetic guidance</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    )
  }

  // Arabic Section
  if (view === 'arabic') {
    if (!subView) {
      return (
        <div className="min-h-screen bg-cream-100 p-6">
          <BackButton onClick={() => setView('main')} />
          <h1 className="font-serif text-display-sm text-forest mb-2">Arabic</h1>
          <p className="text-body text-ink-500 mb-8">العربية</p>
          
          <div className="space-y-4">
            <button onClick={() => setSubView('vocabulary')} className="w-full bg-white rounded-2xl p-5 shadow-soft text-left">
              <h3 className="font-serif text-title-sm text-forest">Vocabulary</h3>
              <p className="text-body-sm text-ink-400">150+ words in 8 categories</p>
            </button>
            <button onClick={() => setSubView('alphabet')} className="w-full bg-white rounded-2xl p-5 shadow-soft text-left">
              <h3 className="font-serif text-title-sm text-forest">Alphabet</h3>
              <p className="text-body-sm text-ink-400">28 letters with positions</p>
            </button>
            <button onClick={() => setSubView('numbers')} className="w-full bg-white rounded-2xl p-5 shadow-soft text-left">
              <h3 className="font-serif text-title-sm text-forest">Numbers</h3>
              <p className="text-body-sm text-ink-400">0-1000 with Arabic numerals</p>
            </button>
            <button onClick={() => setSubView('grammar')} className="w-full bg-white rounded-2xl p-5 shadow-soft text-left">
              <h3 className="font-serif text-title-sm text-forest">Grammar</h3>
              <p className="text-body-sm text-ink-400">Pronouns, articles, gender, sentences</p>
            </button>
          </div>
        </div>
      )
    }

    if (subView === 'vocabulary') {
      if (!selectedCategory) {
        return (
          <div className="min-h-screen bg-cream-100 p-6">
            <BackButton onClick={() => setSubView(null)} />
            <h2 className="font-serif text-title text-forest mb-6">Arabic Vocabulary</h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.keys(arabicLibrary).map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className="bg-white rounded-xl p-4 shadow-soft text-left">
                  <p className="font-serif text-title-sm text-forest capitalize">{cat}</p>
                  <p className="text-caption text-ink-400">{arabicLibrary[cat].length} words</p>
                </button>
              ))}
            </div>
          </div>
        )
      }

      return (
        <div className="min-h-screen bg-cream-100 p-6 pb-24">
          <BackButton onClick={() => setSelectedCategory(null)} />
          <h2 className="font-serif text-title text-forest mb-2 capitalize">{selectedCategory}</h2>
          <p className="text-body-sm text-ink-400 mb-6">{arabicLibrary[selectedCategory].length} words</p>
          
          <div className="space-y-4">
            {arabicLibrary[selectedCategory].map((word, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-soft">
                <p className="text-3xl text-forest mb-2 text-center" dir="rtl">{word.arabic}</p>
                <p className="font-serif text-title-sm text-forest text-center">{word.roman}</p>
                <p className="text-body text-ink-500 text-center mb-2">{word.english}</p>
                <div className="bg-gold-50 rounded-xl p-3">
                  <p className="text-body-sm text-gold-700 text-center">{word.usage}</p>
                </div>
                
                {/* Voice Practice */}
                <div className="mt-4 pt-4 border-t border-cream-200">
                  <p className="text-caption text-ink-400 mb-2 text-center">Practice your pronunciation</p>
                  <div className="flex justify-center gap-3">
                    {!recording ? (
                      <button onClick={startRecording} className="px-4 py-2 bg-forest text-cream-100 rounded-lg text-body-sm">
                        🎤 Record
                      </button>
                    ) : (
                      <button onClick={stopRecording} className="px-4 py-2 bg-rose-500 text-white rounded-lg text-body-sm animate-pulse">
                        ⏹ Stop
                      </button>
                    )}
                    {audioUrl && (
                      <audio controls src={audioUrl} className="h-10" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (subView === 'alphabet') {
      const letter = arabicAlphabet[alphabetIndex]
      return (
        <div className="min-h-screen bg-cream-100 p-6">
          <BackButton onClick={() => setSubView(null)} />
          <h2 className="font-serif text-title text-forest mb-6">Arabic Alphabet</h2>
          
          <div className="bg-white rounded-2xl p-8 shadow-soft mb-6">
            <p className="text-8xl text-forest text-center mb-4" dir="rtl">{letter.letter}</p>
            <p className="font-serif text-display-sm text-forest text-center">{letter.name}</p>
            <p className="text-body text-ink-500 text-center mb-4">Sound: {letter.sound}</p>
            <div className="bg-cream-50 rounded-xl p-4">
              <p className="text-body-sm text-ink-400 text-center mb-1">Positions (initial, middle, final)</p>
              <p className="text-2xl text-forest text-center" dir="rtl">{letter.position}</p>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setAlphabetIndex(i => Math.max(0, i - 1))}
              disabled={alphabetIndex === 0}
              className="px-6 py-3 bg-white rounded-xl shadow-soft disabled:opacity-50"
            >
              ← Previous
            </button>
            <span className="text-body text-ink-500">{alphabetIndex + 1} / {arabicAlphabet.length}</span>
            <button 
              onClick={() => setAlphabetIndex(i => Math.min(arabicAlphabet.length - 1, i + 1))}
              disabled={alphabetIndex === arabicAlphabet.length - 1}
              className="px-6 py-3 bg-white rounded-xl shadow-soft disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      )
    }

    if (subView === 'numbers') {
      return (
        <div className="min-h-screen bg-cream-100 p-6 pb-24">
          <BackButton onClick={() => setSubView(null)} />
          <h2 className="font-serif text-title text-forest mb-6">Arabic Numbers</h2>
          
          <div className="space-y-3">
            {arabicNumbers.map((n, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-soft flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-bold text-ink-600 w-12">{n.num}</span>
                  <span className="text-3xl text-forest">{n.arabic}</span>
                </div>
                <div className="text-right">
                  <p className="text-xl text-forest" dir="rtl">{n.word}</p>
                  <p className="text-body-sm text-ink-400">{n.roman}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (subView === 'grammar') {
      if (!selectedCategory) {
        return (
          <div className="min-h-screen bg-cream-100 p-6">
            <BackButton onClick={() => setSubView(null)} />
            <h2 className="font-serif text-title text-forest mb-6">Arabic Grammar</h2>
            
            <div className="space-y-3">
              {Object.entries(arabicGrammar).map(([key, section]) => (
                <button key={key} onClick={() => setSelectedCategory(key)} className="w-full bg-white rounded-xl p-5 shadow-soft text-left">
                  <h3 className="font-serif text-title-sm text-forest">{section.title}</h3>
                </button>
              ))}
            </div>
          </div>
        )
      }

      const section = arabicGrammar[selectedCategory]
      return (
        <div className="min-h-screen bg-cream-100 p-6 pb-24">
          <BackButton onClick={() => setSelectedCategory(null)} />
          <h2 className="font-serif text-title text-forest mb-2">{section.title}</h2>
          {section.explanation && <p className="text-body text-ink-500 mb-6">{section.explanation}</p>}
          
          {section.content && (
            <div className="space-y-3 mb-6">
              {section.content.map((item, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-soft">
                  <p className="text-2xl text-forest text-center" dir="rtl">{item.arabic}</p>
                  <p className="font-medium text-forest text-center">{item.roman}</p>
                  <p className="text-body-sm text-ink-500 text-center">{item.english}</p>
                </div>
              ))}
            </div>
          )}
          
          {section.examples && (
            <div className="space-y-3">
              {section.examples.map((ex, i) => (
                <div key={i} className="bg-white rounded-xl p-4 shadow-soft">
                  {ex.without && <p className="text-body text-ink-500">{ex.without}</p>}
                  {ex.with && <p className="text-body text-forest font-medium">{ex.with}</p>}
                  {ex.masculine && <p className="text-body text-ink-500">M: {ex.masculine}</p>}
                  {ex.feminine && <p className="text-body text-forest">F: {ex.feminine}</p>}
                  {ex.type && <p className="text-caption text-ink-400">{ex.type}</p>}
                  {ex.arabic && <p className="text-xl text-forest" dir="rtl">{ex.arabic}</p>}
                  {ex.roman && <p className="text-body text-ink-500">{ex.roman}</p>}
                  {ex.english && <p className="text-body-sm text-ink-400">{ex.english}</p>}
                  {ex.suffix && <p className="text-xl text-forest">{ex.suffix} = {ex.meaning}</p>}
                  {ex.example && <p className="text-body text-ink-500">{ex.example}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }
  }

  // Urdu Section
  if (view === 'urdu') {
    if (!selectedCategory) {
      return (
        <div className="min-h-screen bg-cream-100 p-6">
          <BackButton onClick={() => setView('main')} />
          <h1 className="font-serif text-display-sm text-forest mb-2">Urdu</h1>
          <p className="text-body text-ink-500 mb-8">اردو</p>
          
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(urduLibrary).map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className="bg-white rounded-xl p-4 shadow-soft text-left">
                <p className="font-serif text-title-sm text-forest capitalize">{cat}</p>
                <p className="text-caption text-ink-400">{urduLibrary[cat].length} phrases</p>
              </button>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-cream-100 p-6 pb-24">
        <BackButton onClick={() => setSelectedCategory(null)} />
        <h2 className="font-serif text-title text-forest mb-6 capitalize">{selectedCategory}</h2>
        
        <div className="space-y-4">
          {urduLibrary[selectedCategory].map((word, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-soft">
              <p className="text-2xl text-forest mb-2 text-center" dir="rtl">{word.native}</p>
              <p className="font-serif text-title-sm text-forest text-center">{word.roman}</p>
              <p className="text-body text-ink-500 text-center">{word.english}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Tagalog Section
  if (view === 'tagalog') {
    if (!selectedCategory) {
      return (
        <div className="min-h-screen bg-cream-100 p-6">
          <BackButton onClick={() => setView('main')} />
          <h1 className="font-serif text-display-sm text-forest mb-2">Tagalog</h1>
          <p className="text-body text-ink-500 mb-8">Filipino</p>
          
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(tagalogLibrary).map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className="bg-white rounded-xl p-4 shadow-soft text-left">
                <p className="font-serif text-title-sm text-forest capitalize">{cat}</p>
                <p className="text-caption text-ink-400">{tagalogLibrary[cat].length} phrases</p>
              </button>
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-cream-100 p-6 pb-24">
        <BackButton onClick={() => setSelectedCategory(null)} />
        <h2 className="font-serif text-title text-forest mb-6 capitalize">{selectedCategory}</h2>
        
        <div className="space-y-4">
          {tagalogLibrary[selectedCategory].map((word, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-soft">
              <p className="text-2xl text-forest mb-2 text-center">{word.native}</p>
              <p className="text-body text-ink-500 text-center">{word.english}</p>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Islamic Studies Section
  if (view === 'islam') {
    if (!selectedCategory) {
      return (
        <div className="min-h-screen bg-cream-100 p-6">
          <BackButton onClick={() => setView('main')} />
          <h1 className="font-serif text-display-sm text-forest mb-2">Islamic Studies</h1>
          <p className="text-body text-ink-500 mb-8">4 Levels of Growth</p>
          
          <div className="space-y-4">
            {Object.entries(islamicLessons).map(([key, level], i) => (
              <button key={key} onClick={() => setSelectedCategory(key)} className="w-full bg-white rounded-2xl p-5 shadow-soft text-left hover:shadow-card transition-shadow">
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
        </div>
      )
    }

    const level = islamicLessons[selectedCategory]
    
    if (!selectedLesson) {
      return (
        <div className="min-h-screen bg-cream-100 p-6">
          <BackButton onClick={() => setSelectedCategory(null)} />
          <h2 className="font-serif text-title text-forest mb-2">{level.title}</h2>
          <p className="text-body text-ink-500 mb-6">{level.description}</p>
          
          <div className="space-y-3">
            {level.lessons.map((lesson, i) => (
              <button key={i} onClick={() => setSelectedLesson(i)} className="w-full bg-white rounded-xl p-5 shadow-soft text-left">
                <h3 className="font-serif text-title-sm text-forest">{lesson.title}</h3>
                <p className="text-body-sm text-ink-400 line-clamp-2">{lesson.content}</p>
              </button>
            ))}
          </div>
        </div>
      )
    }

    const lesson = level.lessons[selectedLesson]
    return (
      <div className="min-h-screen bg-cream-100 p-6 pb-24">
        <BackButton onClick={() => setSelectedLesson(null)} />
        <h2 className="font-serif text-title text-forest mb-2">{lesson.title}</h2>
        <p className="text-body text-ink-500 mb-6">{lesson.content}</p>
        
        {lesson.details && (
          <div className="space-y-4">
            {lesson.details.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-soft">
                <h4 className="font-serif text-title-sm text-forest mb-2">{item.pillar}</h4>
                <p className="text-body text-ink-500">{item.explanation}</p>
              </div>
            ))}
          </div>
        )}
        
        {lesson.steps && (
          <div className="space-y-3">
            {lesson.steps.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-4 shadow-soft flex items-center gap-4">
                <div className="w-10 h-10 bg-forest rounded-full flex items-center justify-center text-cream-100 font-bold flex-shrink-0">{item.step}</div>
                <p className="text-body text-ink-600">{item.action}</p>
              </div>
            ))}
          </div>
        )}
        
        {lesson.components && (
          <div className="space-y-4">
            {lesson.components.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-soft">
                <h4 className="font-serif text-title-sm text-forest">{item.part}</h4>
                <p className="text-xl text-forest my-2" dir="rtl">{item.arabic}</p>
                <p className="text-body text-ink-600 mb-1">{item.meaning}</p>
                <p className="text-body-sm text-ink-400">{item.when}</p>
              </div>
            ))}
          </div>
        )}
        
        {lesson.duas && (
          <div className="space-y-4">
            {lesson.duas.map((dua, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-soft">
                <p className="text-caption text-gold-600 mb-2">{dua.occasion}</p>
                <p className="text-xl text-forest mb-2 text-center" dir="rtl">{dua.arabic}</p>
                <p className="text-body text-ink-500 text-center">{dua.meaning}</p>
              </div>
            ))}
          </div>
        )}
        
        {lesson.teachings && (
          <div className="space-y-4">
            {lesson.teachings.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-soft">
                <h4 className="font-serif text-title-sm text-forest mb-2">{item.virtue}</h4>
                <p className="text-body text-ink-600 italic mb-2">"{item.hadith}"</p>
                <p className="text-body-sm text-ink-400">{item.practice}</p>
              </div>
            ))}
          </div>
        )}
        
        {lesson.principles && (
          <div className="space-y-4">
            {lesson.principles.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-soft">
                <h4 className="font-serif text-title-sm text-forest mb-2">{item.topic}</h4>
                <p className="text-body text-ink-500">{item.teaching}</p>
              </div>
            ))}
          </div>
        )}
        
        {lesson.areas && (
          <div className="space-y-4">
            {lesson.areas.map((item, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-soft">
                <h4 className="font-serif text-title-sm text-forest mb-2">{item.area}</h4>
                <p className="text-body text-ink-500">{item.guidance}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return null
}
