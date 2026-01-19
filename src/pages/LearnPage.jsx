import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

// Arabic Words Database - 150+ words organized by category
const arabicWords = {
  greetings: [
    { arabic: 'السلام عليكم', roman: 'Assalamu Alaikum', meaning: 'Peace be upon you', usage: 'Standard Islamic greeting' },
    { arabic: 'وعليكم السلام', roman: 'Wa Alaikum Assalam', meaning: 'And upon you peace', usage: 'Response to Salam' },
    { arabic: 'صباح الخير', roman: 'Sabah al-khair', meaning: 'Good morning', usage: 'Morning greeting' },
    { arabic: 'مساء الخير', roman: 'Masa al-khair', meaning: 'Good evening', usage: 'Evening greeting' },
    { arabic: 'مرحبا', roman: 'Marhaba', meaning: 'Hello/Welcome', usage: 'Casual greeting' },
    { arabic: 'أهلاً وسهلاً', roman: 'Ahlan wa sahlan', meaning: 'Welcome', usage: 'Welcoming someone' },
    { arabic: 'كيف حالك', roman: 'Kayf halak', meaning: 'How are you? (m)', usage: 'Asking about wellbeing' },
    { arabic: 'كيف حالك', roman: 'Kayf halik', meaning: 'How are you? (f)', usage: 'Asking about wellbeing' },
    { arabic: 'الحمد لله', roman: 'Alhamdulillah', meaning: 'Praise be to God', usage: 'Response to "how are you"' },
    { arabic: 'بخير', roman: 'Bikhayr', meaning: 'Fine/Well', usage: 'Response to "how are you"' },
    { arabic: 'شكراً', roman: 'Shukran', meaning: 'Thank you', usage: 'Expressing gratitude' },
    { arabic: 'عفواً', roman: 'Afwan', meaning: "You're welcome", usage: 'Response to thanks' },
    { arabic: 'مع السلامة', roman: 'Ma\'a salama', meaning: 'Goodbye (go with peace)', usage: 'Farewell' },
    { arabic: 'إلى اللقاء', roman: 'Ila al-liqa', meaning: 'Until we meet again', usage: 'Farewell' },
  ],
  love: [
    { arabic: 'أحبك', roman: 'Uhibbuk', meaning: 'I love you (m)', usage: 'Expression of love' },
    { arabic: 'أحبك', roman: 'Uhibbuki', meaning: 'I love you (f)', usage: 'Expression of love' },
    { arabic: 'حبيبي', roman: 'Habibi', meaning: 'My love (m)', usage: 'Term of endearment' },
    { arabic: 'حبيبتي', roman: 'Habibti', meaning: 'My love (f)', usage: 'Term of endearment' },
    { arabic: 'قلبي', roman: 'Qalbi', meaning: 'My heart', usage: 'Term of endearment' },
    { arabic: 'روحي', roman: 'Ruhi', meaning: 'My soul', usage: 'Deep term of endearment' },
    { arabic: 'عمري', roman: 'Omri', meaning: 'My life', usage: 'Term of endearment' },
    { arabic: 'نور عيني', roman: 'Noor ayni', meaning: 'Light of my eyes', usage: 'Term of endearment' },
    { arabic: 'يا حياتي', roman: 'Ya hayati', meaning: 'Oh my life', usage: 'Term of endearment' },
    { arabic: 'عزيزي', roman: 'Azizi', meaning: 'My dear (m)', usage: 'Affectionate term' },
    { arabic: 'عزيزتي', roman: 'Azizati', meaning: 'My dear (f)', usage: 'Affectionate term' },
    { arabic: 'أشتاق إليك', roman: 'Ashtaq ilayk', meaning: 'I miss you', usage: 'Expressing longing' },
    { arabic: 'وحشتني', roman: 'Wahashitni', meaning: 'I missed you', usage: 'When reuniting' },
    { arabic: 'أنت كل شيء', roman: 'Anta kulli shay', meaning: 'You are everything', usage: 'Deep affection' },
  ],
  family: [
    { arabic: 'أب', roman: 'Ab', meaning: 'Father', usage: 'Family member' },
    { arabic: 'أم', roman: 'Umm', meaning: 'Mother', usage: 'Family member' },
    { arabic: 'أخ', roman: 'Akh', meaning: 'Brother', usage: 'Family member' },
    { arabic: 'أخت', roman: 'Ukht', meaning: 'Sister', usage: 'Family member' },
    { arabic: 'جد', roman: 'Jadd', meaning: 'Grandfather', usage: 'Family member' },
    { arabic: 'جدة', roman: 'Jadda', meaning: 'Grandmother', usage: 'Family member' },
    { arabic: 'عم', roman: 'Amm', meaning: 'Paternal uncle', usage: 'Family member' },
    { arabic: 'عمة', roman: 'Amma', meaning: 'Paternal aunt', usage: 'Family member' },
    { arabic: 'خال', roman: 'Khal', meaning: 'Maternal uncle', usage: 'Family member' },
    { arabic: 'خالة', roman: 'Khala', meaning: 'Maternal aunt', usage: 'Family member' },
    { arabic: 'ابن', roman: 'Ibn', meaning: 'Son', usage: 'Family member' },
    { arabic: 'بنت', roman: 'Bint', meaning: 'Daughter', usage: 'Family member' },
    { arabic: 'زوج', roman: 'Zawj', meaning: 'Husband', usage: 'Spouse' },
    { arabic: 'زوجة', roman: 'Zawja', meaning: 'Wife', usage: 'Spouse' },
    { arabic: 'عائلة', roman: 'A\'ila', meaning: 'Family', usage: 'General term' },
  ],
  food: [
    { arabic: 'طعام', roman: 'Ta\'am', meaning: 'Food', usage: 'General term' },
    { arabic: 'ماء', roman: 'Ma\'', meaning: 'Water', usage: 'Drink' },
    { arabic: 'خبز', roman: 'Khubz', meaning: 'Bread', usage: 'Staple food' },
    { arabic: 'أرز', roman: 'Aruzz', meaning: 'Rice', usage: 'Staple food' },
    { arabic: 'لحم', roman: 'Lahm', meaning: 'Meat', usage: 'Protein' },
    { arabic: 'دجاج', roman: 'Dajaj', meaning: 'Chicken', usage: 'Protein' },
    { arabic: 'سمك', roman: 'Samak', meaning: 'Fish', usage: 'Protein' },
    { arabic: 'خضروات', roman: 'Khudrawat', meaning: 'Vegetables', usage: 'Food category' },
    { arabic: 'فواكه', roman: 'Fawakih', meaning: 'Fruits', usage: 'Food category' },
    { arabic: 'تفاح', roman: 'Tuffah', meaning: 'Apple', usage: 'Fruit' },
    { arabic: 'برتقال', roman: 'Burtuqal', meaning: 'Orange', usage: 'Fruit' },
    { arabic: 'موز', roman: 'Mawz', meaning: 'Banana', usage: 'Fruit' },
    { arabic: 'شاي', roman: 'Shay', meaning: 'Tea', usage: 'Drink' },
    { arabic: 'قهوة', roman: 'Qahwa', meaning: 'Coffee', usage: 'Drink' },
    { arabic: 'حليب', roman: 'Halib', meaning: 'Milk', usage: 'Drink' },
    { arabic: 'بيض', roman: 'Bayd', meaning: 'Eggs', usage: 'Protein' },
    { arabic: 'جبن', roman: 'Jubn', meaning: 'Cheese', usage: 'Dairy' },
    { arabic: 'لذيذ', roman: 'Ladhidh', meaning: 'Delicious', usage: 'Describing food' },
    { arabic: 'بسم الله', roman: 'Bismillah', meaning: 'In the name of Allah', usage: 'Before eating' },
  ],
  daily: [
    { arabic: 'نعم', roman: 'Na\'am', meaning: 'Yes', usage: 'Affirmation' },
    { arabic: 'لا', roman: 'La', meaning: 'No', usage: 'Negation' },
    { arabic: 'من فضلك', roman: 'Min fadlak', meaning: 'Please (m)', usage: 'Polite request' },
    { arabic: 'من فضلك', roman: 'Min fadlik', meaning: 'Please (f)', usage: 'Polite request' },
    { arabic: 'آسف', roman: 'Asif', meaning: 'Sorry (m)', usage: 'Apology' },
    { arabic: 'آسفة', roman: 'Asifa', meaning: 'Sorry (f)', usage: 'Apology' },
    { arabic: 'إن شاء الله', roman: 'Insha\'Allah', meaning: 'God willing', usage: 'Future plans' },
    { arabic: 'ما شاء الله', roman: 'Masha\'Allah', meaning: 'What Allah willed', usage: 'Admiration' },
    { arabic: 'جزاك الله خيراً', roman: 'Jazak Allah khayran', meaning: 'May Allah reward you', usage: 'Thanks' },
    { arabic: 'يوم', roman: 'Yawm', meaning: 'Day', usage: 'Time' },
    { arabic: 'ليل', roman: 'Layl', meaning: 'Night', usage: 'Time' },
    { arabic: 'صباح', roman: 'Sabah', meaning: 'Morning', usage: 'Time' },
    { arabic: 'مساء', roman: 'Masa\'', meaning: 'Evening', usage: 'Time' },
    { arabic: 'اليوم', roman: 'Al-yawm', meaning: 'Today', usage: 'Time reference' },
    { arabic: 'غداً', roman: 'Ghadan', meaning: 'Tomorrow', usage: 'Time reference' },
    { arabic: 'أمس', roman: 'Ams', meaning: 'Yesterday', usage: 'Time reference' },
    { arabic: 'الآن', roman: 'Al-an', meaning: 'Now', usage: 'Time reference' },
    { arabic: 'بعد', roman: 'Ba\'d', meaning: 'After', usage: 'Time preposition' },
    { arabic: 'قبل', roman: 'Qabl', meaning: 'Before', usage: 'Time preposition' },
    { arabic: 'هنا', roman: 'Huna', meaning: 'Here', usage: 'Place' },
    { arabic: 'هناك', roman: 'Hunak', meaning: 'There', usage: 'Place' },
  ],
  colors: [
    { arabic: 'أبيض', roman: 'Abyad', meaning: 'White', usage: 'Color' },
    { arabic: 'أسود', roman: 'Aswad', meaning: 'Black', usage: 'Color' },
    { arabic: 'أحمر', roman: 'Ahmar', meaning: 'Red', usage: 'Color' },
    { arabic: 'أزرق', roman: 'Azraq', meaning: 'Blue', usage: 'Color' },
    { arabic: 'أخضر', roman: 'Akhdar', meaning: 'Green', usage: 'Color' },
    { arabic: 'أصفر', roman: 'Asfar', meaning: 'Yellow', usage: 'Color' },
    { arabic: 'برتقالي', roman: 'Burtuqali', meaning: 'Orange', usage: 'Color' },
    { arabic: 'بنفسجي', roman: 'Banafsaji', meaning: 'Purple', usage: 'Color' },
    { arabic: 'وردي', roman: 'Wardi', meaning: 'Pink', usage: 'Color' },
    { arabic: 'بني', roman: 'Bunni', meaning: 'Brown', usage: 'Color' },
  ],
  nature: [
    { arabic: 'شمس', roman: 'Shams', meaning: 'Sun', usage: 'Nature' },
    { arabic: 'قمر', roman: 'Qamar', meaning: 'Moon', usage: 'Nature' },
    { arabic: 'نجم', roman: 'Najm', meaning: 'Star', usage: 'Nature' },
    { arabic: 'سماء', roman: 'Sama\'', meaning: 'Sky', usage: 'Nature' },
    { arabic: 'أرض', roman: 'Ard', meaning: 'Earth/Land', usage: 'Nature' },
    { arabic: 'بحر', roman: 'Bahr', meaning: 'Sea', usage: 'Nature' },
    { arabic: 'نهر', roman: 'Nahr', meaning: 'River', usage: 'Nature' },
    { arabic: 'جبل', roman: 'Jabal', meaning: 'Mountain', usage: 'Nature' },
    { arabic: 'شجرة', roman: 'Shajara', meaning: 'Tree', usage: 'Nature' },
    { arabic: 'زهرة', roman: 'Zahra', meaning: 'Flower', usage: 'Nature' },
    { arabic: 'مطر', roman: 'Matar', meaning: 'Rain', usage: 'Weather' },
    { arabic: 'ثلج', roman: 'Thalj', meaning: 'Snow', usage: 'Weather' },
    { arabic: 'هواء', roman: 'Hawa\'', meaning: 'Air/Wind', usage: 'Weather' },
  ],
  islamic: [
    { arabic: 'الله', roman: 'Allah', meaning: 'God', usage: 'The one God' },
    { arabic: 'محمد', roman: 'Muhammad', meaning: 'The Prophet', usage: 'Prophet\'s name' },
    { arabic: 'قرآن', roman: 'Qur\'an', meaning: 'Holy Book', usage: 'Scripture' },
    { arabic: 'مسجد', roman: 'Masjid', meaning: 'Mosque', usage: 'Place of worship' },
    { arabic: 'صلاة', roman: 'Salah', meaning: 'Prayer', usage: 'Worship' },
    { arabic: 'صوم', roman: 'Sawm', meaning: 'Fasting', usage: 'Pillar of Islam' },
    { arabic: 'زكاة', roman: 'Zakat', meaning: 'Charity', usage: 'Pillar of Islam' },
    { arabic: 'حج', roman: 'Hajj', meaning: 'Pilgrimage', usage: 'Pillar of Islam' },
    { arabic: 'إيمان', roman: 'Iman', meaning: 'Faith', usage: 'Belief' },
    { arabic: 'تقوى', roman: 'Taqwa', meaning: 'God-consciousness', usage: 'Spiritual concept' },
    { arabic: 'دعاء', roman: 'Du\'a', meaning: 'Supplication', usage: 'Personal prayer' },
    { arabic: 'ذكر', roman: 'Dhikr', meaning: 'Remembrance', usage: 'Remembering Allah' },
    { arabic: 'حلال', roman: 'Halal', meaning: 'Permissible', usage: 'Islamic law' },
    { arabic: 'حرام', roman: 'Haram', meaning: 'Forbidden', usage: 'Islamic law' },
    { arabic: 'سنة', roman: 'Sunnah', meaning: 'Prophet\'s way', usage: 'Tradition' },
  ],
}

// Arabic Numbers
const arabicNumbers = [
  { number: 0, arabic: 'صفر', roman: 'Sifr' },
  { number: 1, arabic: 'واحد', roman: 'Wahid' },
  { number: 2, arabic: 'اثنان', roman: 'Ithnan' },
  { number: 3, arabic: 'ثلاثة', roman: 'Thalatha' },
  { number: 4, arabic: 'أربعة', roman: 'Arba\'a' },
  { number: 5, arabic: 'خمسة', roman: 'Khamsa' },
  { number: 6, arabic: 'ستة', roman: 'Sitta' },
  { number: 7, arabic: 'سبعة', roman: 'Sab\'a' },
  { number: 8, arabic: 'ثمانية', roman: 'Thamaniya' },
  { number: 9, arabic: 'تسعة', roman: 'Tis\'a' },
  { number: 10, arabic: 'عشرة', roman: 'Ashara' },
  { number: 11, arabic: 'أحد عشر', roman: 'Ahada ashar' },
  { number: 12, arabic: 'اثنا عشر', roman: 'Ithna ashar' },
  { number: 13, arabic: 'ثلاثة عشر', roman: 'Thalathata ashar' },
  { number: 14, arabic: 'أربعة عشر', roman: 'Arba\'ata ashar' },
  { number: 15, arabic: 'خمسة عشر', roman: 'Khamsata ashar' },
  { number: 20, arabic: 'عشرون', roman: 'Ishrun' },
  { number: 30, arabic: 'ثلاثون', roman: 'Thalathun' },
  { number: 40, arabic: 'أربعون', roman: 'Arba\'un' },
  { number: 50, arabic: 'خمسون', roman: 'Khamsun' },
  { number: 60, arabic: 'ستون', roman: 'Sittun' },
  { number: 70, arabic: 'سبعون', roman: 'Sab\'un' },
  { number: 80, arabic: 'ثمانون', roman: 'Thamanun' },
  { number: 90, arabic: 'تسعون', roman: 'Tis\'un' },
  { number: 100, arabic: 'مائة', roman: 'Mi\'a' },
  { number: 200, arabic: 'مائتان', roman: 'Mi\'atan' },
  { number: 1000, arabic: 'ألف', roman: 'Alf' },
]

// Arabic Alphabet
const arabicAlphabet = [
  { letter: 'ا', name: 'Alif', sound: 'a/aa' },
  { letter: 'ب', name: 'Ba', sound: 'b' },
  { letter: 'ت', name: 'Ta', sound: 't' },
  { letter: 'ث', name: 'Tha', sound: 'th (as in think)' },
  { letter: 'ج', name: 'Jeem', sound: 'j' },
  { letter: 'ح', name: 'Ha', sound: 'h (breathy)' },
  { letter: 'خ', name: 'Kha', sound: 'kh (guttural)' },
  { letter: 'د', name: 'Dal', sound: 'd' },
  { letter: 'ذ', name: 'Dhal', sound: 'dh (as in this)' },
  { letter: 'ر', name: 'Ra', sound: 'r (rolled)' },
  { letter: 'ز', name: 'Zay', sound: 'z' },
  { letter: 'س', name: 'Seen', sound: 's' },
  { letter: 'ش', name: 'Sheen', sound: 'sh' },
  { letter: 'ص', name: 'Sad', sound: 's (emphatic)' },
  { letter: 'ض', name: 'Dad', sound: 'd (emphatic)' },
  { letter: 'ط', name: 'Ta', sound: 't (emphatic)' },
  { letter: 'ظ', name: 'Dha', sound: 'dh (emphatic)' },
  { letter: 'ع', name: 'Ayn', sound: 'voiced pharyngeal' },
  { letter: 'غ', name: 'Ghayn', sound: 'gh (like French r)' },
  { letter: 'ف', name: 'Fa', sound: 'f' },
  { letter: 'ق', name: 'Qaf', sound: 'q (deep k)' },
  { letter: 'ك', name: 'Kaf', sound: 'k' },
  { letter: 'ل', name: 'Lam', sound: 'l' },
  { letter: 'م', name: 'Meem', sound: 'm' },
  { letter: 'ن', name: 'Noon', sound: 'n' },
  { letter: 'ه', name: 'Ha', sound: 'h' },
  { letter: 'و', name: 'Waw', sound: 'w/oo' },
  { letter: 'ي', name: 'Ya', sound: 'y/ee' },
]

// Arabic Grammar
const arabicGrammar = [
  {
    title: 'Basic Sentence Structure',
    content: 'Arabic sentences can be nominal (starting with noun) or verbal (starting with verb). Nominal: الكتاب كبير (The book is big). Verbal: يقرأ الولد (The boy reads).',
    examples: ['الولد كبير - The boy is big', 'تأكل البنت - The girl eats']
  },
  {
    title: 'Definite Article (ال)',
    content: 'The prefix "ال" (al-) makes a noun definite, like "the" in English. كتاب (a book) → الكتاب (the book).',
    examples: ['بيت → البيت (house → the house)', 'قمر → القمر (moon → the moon)']
  },
  {
    title: 'Gender',
    content: 'Arabic nouns are either masculine or feminine. Most feminine nouns end in ة (ta marbuta). معلم (male teacher), معلمة (female teacher).',
    examples: ['طالب/طالبة (student m/f)', 'صديق/صديقة (friend m/f)']
  },
  {
    title: 'Pronouns',
    content: 'أنا (I), أنت (you m), أنتِ (you f), هو (he), هي (she), نحن (we), أنتم (you pl), هم (they).',
    examples: ['أنا طالب - I am a student', 'هي معلمة - She is a teacher']
  },
  {
    title: 'Possession',
    content: 'Add suffixes to show possession: ي (my), ك (your m), كِ (your f), ه (his), ها (her).',
    examples: ['كتابي (my book)', 'بيتك (your house)', 'قلمها (her pen)']
  },
  {
    title: 'Plurals',
    content: 'Regular plurals add ون (m) or ات (f). Broken plurals change the word pattern internally.',
    examples: ['معلمون (teachers m)', 'طالبات (students f)', 'كتب (books - broken plural)']
  },
]

// Islamic Lessons - Real comprehensive lessons
const islamicLessons = {
  beginner: [
    {
      title: 'The Five Pillars of Islam',
      content: `Islam is built upon five fundamental pillars that every Muslim should know and practice:

1. **Shahada (Declaration of Faith)**: "La ilaha illa Allah, Muhammad rasul Allah" - There is no god but Allah, and Muhammad is His messenger. This declaration is the foundation of Islamic faith.

2. **Salah (Prayer)**: Muslims pray five times daily - Fajr (dawn), Dhuhr (noon), Asr (afternoon), Maghrib (sunset), and Isha (night). Prayer connects us directly with Allah.

3. **Zakat (Charity)**: Giving 2.5% of one's savings annually to those in need. This purifies wealth and helps the community.

4. **Sawm (Fasting)**: During Ramadan, Muslims fast from dawn to sunset, abstaining from food, drink, and negative behaviors. This builds self-discipline and empathy.

5. **Hajj (Pilgrimage)**: Every able Muslim should perform pilgrimage to Mecca at least once in their lifetime if they can afford it.`,
      keyPoints: ['Shahada is the entry point to Islam', 'Prayer is performed 5 times daily', 'Zakat purifies wealth', 'Fasting builds discipline', 'Hajj unites the Ummah']
    },
    {
      title: 'Who is Allah?',
      content: `Allah is the Arabic word for God - the same God worshipped by Abraham, Moses, Jesus, and Muhammad (peace be upon them all).

**Key Attributes of Allah:**
- Al-Rahman (The Most Merciful)
- Al-Raheem (The Most Compassionate)  
- Al-Malik (The King/Sovereign)
- Al-Quddus (The Holy)
- Al-Alim (The All-Knowing)
- Al-Khaliq (The Creator)

Allah has 99 beautiful names that describe His attributes. Muslims believe Allah is:
- One and unique (Tawhid)
- All-powerful and All-knowing
- The Creator of everything
- Close to His servants
- Merciful and forgiving`,
      keyPoints: ['Allah means "The God" in Arabic', 'He has 99 beautiful names', 'Tawhid is the belief in One God', 'Allah is Most Merciful']
    },
    {
      title: 'The Prophet Muhammad ﷺ',
      content: `Prophet Muhammad (peace be upon him) was born in Mecca in 570 CE. He received the first revelation from Allah through Angel Jibreel (Gabriel) at age 40.

**Key Facts:**
- Born in the Year of the Elephant
- Known as "Al-Sadiq Al-Amin" (The Truthful, The Trustworthy)
- Received revelation for 23 years
- Migrated to Medina in 622 CE (Hijra)
- Established the first Muslim community
- Passed away in 632 CE in Medina

**His Character:**
- Honest in all dealings
- Kind to all people
- Patient in hardship
- Merciful to enemies
- Simple in lifestyle`,
      keyPoints: ['Born in Mecca 570 CE', 'First revelation at age 40', 'Hijra to Medina in 622 CE', 'Known for honesty and trustworthiness']
    },
  ],
  intermediate: [
    {
      title: 'Understanding the Quran',
      content: `The Quran is the holy book of Islam, revealed to Prophet Muhammad ﷺ over 23 years.

**Structure:**
- 114 Surahs (chapters)
- 6,236 verses (ayat)
- Divided into 30 Juz (parts) for easier reading

**Revelation:**
- First revealed in Ramadan
- First word: "Iqra" (Read)
- Revealed in Arabic
- Preserved unchanged since revelation

**How to Approach the Quran:**
1. Make wudu (ablution) before reading
2. Seek refuge from Shaytan
3. Start with Bismillah
4. Read with contemplation (tadabbur)
5. Implement what you learn`,
      keyPoints: ['114 Surahs, 6236 verses', 'Preserved unchanged', 'First word was "Iqra" (Read)', 'Read with contemplation']
    },
    {
      title: 'The Importance of Prayer',
      content: `Salah (prayer) is the second pillar and the first thing we'll be asked about on Judgment Day.

**The Five Daily Prayers:**
- Fajr: 2 rakaat (before sunrise)
- Dhuhr: 4 rakaat (after midday)
- Asr: 4 rakaat (afternoon)
- Maghrib: 3 rakaat (after sunset)
- Isha: 4 rakaat (night)

**Benefits of Prayer:**
- Direct connection with Allah
- Spiritual purification
- Time management
- Community bonding
- Physical exercise
- Mental peace

**Prerequisites:**
1. Cleanliness (Tahara)
2. Proper clothing
3. Facing Qibla (Mecca)
4. Right intention (Niyyah)
5. Proper time`,
      keyPoints: ['5 prayers = 17 rakaat daily', 'First thing asked about on Judgment Day', 'Requires wudu and facing Qibla', 'Brings peace and discipline']
    },
  ],
  advanced: [
    {
      title: 'Purification of the Heart',
      content: `Islam emphasizes internal purification as much as external worship. The Prophet ﷺ said: "There is a piece of flesh in the body, if it is healthy, the whole body is healthy, and if it is corrupt, the whole body is corrupt. Verily, it is the heart."

**Diseases of the Heart:**
- Kibr (Arrogance)
- Hasad (Envy)
- Riya (Showing off)
- Ghurur (Delusion)
- Ghaflah (Heedlessness)

**Cures:**
- Regular dhikr (remembrance)
- Self-accountability (muhasaba)
- Keeping good company
- Seeking knowledge
- Sincere repentance
- Gratitude (shukr)`,
      keyPoints: ['The heart is central to faith', 'Pride and envy corrupt the heart', 'Dhikr purifies the heart', 'Self-reflection is essential']
    },
    {
      title: 'Understanding Tawakkul (Trust in Allah)',
      content: `Tawakkul means placing complete trust in Allah while taking appropriate action.

**Misconceptions:**
❌ Tawakkul is NOT abandoning effort
❌ It's NOT fatalism or laziness
❌ It's NOT neglecting responsibilities

**True Tawakkul:**
✓ Trust Allah with the outcome
✓ Do your best effort
✓ Accept Allah's decree
✓ Maintain hope and patience

The Prophet ﷺ said: "Tie your camel, then trust in Allah." This teaches us to take necessary precautions while trusting Allah with results.

**Levels of Tawakkul:**
1. Trust in worldly matters
2. Trust in religious matters
3. Complete surrender to Allah's will`,
      keyPoints: ['Tie your camel, then trust Allah', 'Effort + Trust = True Tawakkul', 'Accept outcomes with patience', 'Not fatalism or laziness']
    },
  ],
}

// Words of the Day - rotating daily
const wordsOfTheDay = [
  { arabic: 'صبر', roman: 'Sabr', meaning: 'Patience', reflection: 'Patience is half of faith' },
  { arabic: 'شكر', roman: 'Shukr', meaning: 'Gratitude', reflection: 'If you are grateful, I will give you more' },
  { arabic: 'توكل', roman: 'Tawakkul', meaning: 'Trust in Allah', reflection: 'Trust Allah but tie your camel' },
  { arabic: 'إحسان', roman: 'Ihsan', meaning: 'Excellence', reflection: 'Worship Allah as if you see Him' },
  { arabic: 'تقوى', roman: 'Taqwa', meaning: 'God-consciousness', reflection: 'The best provision is Taqwa' },
  { arabic: 'رحمة', roman: 'Rahma', meaning: 'Mercy', reflection: 'My mercy encompasses all things' },
  { arabic: 'عدل', roman: 'Adl', meaning: 'Justice', reflection: 'Be just, even against yourselves' },
]

export default function LearnPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('arabic')
  const [view, setView] = useState('main')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)

  const wordOfDay = wordsOfTheDay[new Date().getDay()]

  const categories = [
    { id: 'greetings', label: 'Greetings', emoji: '👋', count: arabicWords.greetings.length },
    { id: 'love', label: 'Love & Affection', emoji: '💕', count: arabicWords.love.length },
    { id: 'family', label: 'Family', emoji: '👨‍👩‍👧', count: arabicWords.family.length },
    { id: 'food', label: 'Food & Drink', emoji: '🍽️', count: arabicWords.food.length },
    { id: 'daily', label: 'Daily Words', emoji: '☀️', count: arabicWords.daily.length },
    { id: 'colors', label: 'Colors', emoji: '🎨', count: arabicWords.colors.length },
    { id: 'nature', label: 'Nature', emoji: '🌿', count: arabicWords.nature.length },
    { id: 'islamic', label: 'Islamic Terms', emoji: '🕌', count: arabicWords.islamic.length },
  ]

  const BackButton = ({ onClick, label }) => (
    <button 
      onClick={onClick}
      className="flex items-center gap-3 text-forest mb-6 hover:opacity-80 transition-opacity"
    >
      <div className="w-10 h-10 rounded-full bg-forest flex items-center justify-center">
        <svg className="w-5 h-5 text-cream-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </div>
      <span className="text-body font-medium">{label || 'Back'}</span>
    </button>
  )

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="bg-forest px-6 pt-14 pb-10">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-display-sm text-cream-50 mb-2">Learn</h1>
          <p className="text-body text-cream-300">Grow together, learn together</p>
        </div>
      </div>

      {/* Word of the Day */}
      {view === 'main' && (
        <div className="bg-gradient-to-r from-gold-100 via-rose-100 to-gold-100 px-6 py-6">
          <div className="max-w-lg mx-auto text-center">
            <p className="text-caption text-gold-700 uppercase tracking-widest mb-2">Word of the Day</p>
            <p className="font-serif text-display-sm text-forest mb-1">{wordOfDay.arabic}</p>
            <p className="text-title-sm text-forest-700">{wordOfDay.roman}</p>
            <p className="text-body text-forest-600">{wordOfDay.meaning}</p>
            <p className="text-body-sm text-gold-700 mt-2 italic">"{wordOfDay.reflection}"</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      {view === 'main' && (
        <div className="bg-cream px-6 py-4 sticky top-0 z-20 border-b border-cream-300">
          <div className="max-w-lg mx-auto flex justify-center gap-2">
            {[
              { id: 'arabic', label: 'Arabic' },
              { id: 'islam', label: 'Islam' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-full text-body-sm font-medium transition-all ${
                  activeTab === tab.id 
                    ? 'bg-forest text-cream-100' 
                    : 'bg-cream-200 text-ink-500 hover:bg-cream-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-cream min-h-[60vh]">
        {/* Main View */}
        {view === 'main' && activeTab === 'arabic' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              {/* Quick Links */}
              <div className="grid grid-cols-3 gap-3 mb-8">
                <button
                  onClick={() => setView('alphabet')}
                  className="bg-forest-50 rounded-2xl p-4 text-center hover:bg-forest-100 transition-colors"
                >
                  <span className="text-2xl block mb-1">أ ب</span>
                  <span className="text-body-sm text-forest">Alphabet</span>
                </button>
                <button
                  onClick={() => setView('numbers')}
                  className="bg-gold-50 rounded-2xl p-4 text-center hover:bg-gold-100 transition-colors"
                >
                  <span className="text-2xl block mb-1">١٢٣</span>
                  <span className="text-body-sm text-forest">Numbers</span>
                </button>
                <button
                  onClick={() => setView('grammar')}
                  className="bg-rose-50 rounded-2xl p-4 text-center hover:bg-rose-100 transition-colors"
                >
                  <span className="text-2xl block mb-1">📖</span>
                  <span className="text-body-sm text-forest">Grammar</span>
                </button>
              </div>

              {/* Word Categories */}
              <p className="section-label mb-4">Word Library</p>
              <div className="space-y-3">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => { setSelectedCategory(cat.id); setView('words'); }}
                    className="w-full bg-white rounded-2xl p-5 shadow-soft hover:shadow-card transition-shadow flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{cat.emoji}</span>
                      <div className="text-left">
                        <p className="font-serif text-title-sm text-forest">{cat.label}</p>
                        <p className="text-body-sm text-ink-400">{cat.count} words</p>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-ink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Islam Tab */}
        {view === 'main' && activeTab === 'islam' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <p className="section-label mb-4">Islamic Studies</p>
              
              {/* Beginner */}
              <div className="mb-6">
                <p className="text-body-sm font-medium text-ink-500 mb-3">📗 Beginner</p>
                <div className="space-y-3">
                  {islamicLessons.beginner.map((lesson, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedLesson(lesson); setView('lesson'); }}
                      className="w-full bg-green-50 rounded-2xl p-5 text-left hover:bg-green-100 transition-colors"
                    >
                      <p className="font-serif text-title-sm text-forest">{lesson.title}</p>
                      <p className="text-body-sm text-ink-400 mt-1">{lesson.keyPoints.length} key points</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Intermediate */}
              <div className="mb-6">
                <p className="text-body-sm font-medium text-ink-500 mb-3">📘 Intermediate</p>
                <div className="space-y-3">
                  {islamicLessons.intermediate.map((lesson, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedLesson(lesson); setView('lesson'); }}
                      className="w-full bg-blue-50 rounded-2xl p-5 text-left hover:bg-blue-100 transition-colors"
                    >
                      <p className="font-serif text-title-sm text-forest">{lesson.title}</p>
                      <p className="text-body-sm text-ink-400 mt-1">{lesson.keyPoints.length} key points</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced */}
              <div>
                <p className="text-body-sm font-medium text-ink-500 mb-3">📕 Advanced</p>
                <div className="space-y-3">
                  {islamicLessons.advanced.map((lesson, i) => (
                    <button
                      key={i}
                      onClick={() => { setSelectedLesson(lesson); setView('lesson'); }}
                      className="w-full bg-rose-50 rounded-2xl p-5 text-left hover:bg-rose-100 transition-colors"
                    >
                      <p className="font-serif text-title-sm text-forest">{lesson.title}</p>
                      <p className="text-body-sm text-ink-400 mt-1">{lesson.keyPoints.length} key points</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Words View */}
        {view === 'words' && selectedCategory && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <BackButton onClick={() => { setView('main'); setSelectedCategory(null); }} label="Back to categories" />
              
              <h2 className="font-serif text-title text-forest mb-6">
                {categories.find(c => c.id === selectedCategory)?.emoji} {categories.find(c => c.id === selectedCategory)?.label}
              </h2>

              <div className="space-y-4">
                {arabicWords[selectedCategory]?.map((word, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-soft">
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-serif text-display-sm text-forest">{word.arabic}</p>
                    </div>
                    <p className="text-title-sm text-forest-700">{word.roman}</p>
                    <p className="text-body text-ink-600 mt-1">{word.meaning}</p>
                    {word.usage && (
                      <p className="text-body-sm text-ink-400 mt-2 italic">{word.usage}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alphabet View */}
        {view === 'alphabet' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <BackButton onClick={() => setView('main')} label="Back" />
              
              <h2 className="font-serif text-title text-forest mb-2">Arabic Alphabet</h2>
              <p className="text-body text-ink-500 mb-6">28 letters, read right to left</p>

              <div className="grid grid-cols-2 gap-3">
                {arabicAlphabet.map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-soft text-center">
                    <p className="font-serif text-display-sm text-forest mb-1">{item.letter}</p>
                    <p className="text-body font-medium text-forest-700">{item.name}</p>
                    <p className="text-body-sm text-ink-400">{item.sound}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Numbers View */}
        {view === 'numbers' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <BackButton onClick={() => setView('main')} label="Back" />
              
              <h2 className="font-serif text-title text-forest mb-2">Arabic Numbers</h2>
              <p className="text-body text-ink-500 mb-6">From 0 to 1000</p>

              <div className="grid grid-cols-2 gap-3">
                {arabicNumbers.map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl p-4 shadow-soft">
                    <div className="flex items-center justify-between">
                      <span className="text-title text-gold-600 font-bold">{item.number}</span>
                      <span className="font-serif text-title text-forest">{item.arabic}</span>
                    </div>
                    <p className="text-body-sm text-ink-500 mt-1">{item.roman}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Grammar View */}
        {view === 'grammar' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <BackButton onClick={() => setView('main')} label="Back" />
              
              <h2 className="font-serif text-title text-forest mb-6">Arabic Grammar Basics</h2>

              <div className="space-y-4">
                {arabicGrammar.map((item, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-soft">
                    <h3 className="font-serif text-title-sm text-forest mb-3">{item.title}</h3>
                    <p className="text-body text-ink-600 mb-4">{item.content}</p>
                    <div className="bg-cream-100 rounded-xl p-3">
                      <p className="text-caption text-ink-500 mb-2">Examples:</p>
                      {item.examples.map((ex, j) => (
                        <p key={j} className="text-body-sm text-forest">{ex}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Lesson View */}
        {view === 'lesson' && selectedLesson && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <BackButton onClick={() => { setView('main'); setSelectedLesson(null); }} label="Back to lessons" />
              
              <h2 className="font-serif text-display-sm text-forest mb-6">{selectedLesson.title}</h2>

              <div className="bg-white rounded-2xl p-6 shadow-soft mb-6">
                <div className="prose prose-forest text-body text-ink-600 whitespace-pre-line">
                  {selectedLesson.content}
                </div>
              </div>

              {selectedLesson.keyPoints && (
                <div className="bg-forest-50 rounded-2xl p-5">
                  <h3 className="font-serif text-title-sm text-forest mb-3">Key Points</h3>
                  <ul className="space-y-2">
                    {selectedLesson.keyPoints.map((point, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-forest mt-1">✓</span>
                        <span className="text-body text-ink-600">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
