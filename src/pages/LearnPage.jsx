import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

// URDU LIBRARY - Massive
const urduLibrary = {
  love: [
    { native: 'میں تم سے پیار کرتا ہوں', roman: 'Main tum se pyar karta hoon', english: 'I love you (male)' },
    { native: 'میں تم سے پیار کرتی ہوں', roman: 'Main tum se pyar karti hoon', english: 'I love you (female)' },
    { native: 'تم میری زندگی ہو', roman: 'Tum meri zindagi ho', english: 'You are my life' },
    { native: 'تم میری جان ہو', roman: 'Tum meri jaan ho', english: 'You are my soul' },
    { native: 'میرا دل تمہارا ہے', roman: 'Mera dil tumhara hai', english: 'My heart is yours' },
    { native: 'تم بہت خاص ہو', roman: 'Tum bohat khaas ho', english: 'You are very special' },
    { native: 'میں تمہارے بغیر نہیں رہ سکتا', roman: 'Main tumhare baghair nahi reh sakta', english: 'I cannot live without you' },
    { native: 'تم میری دنیا ہو', roman: 'Tum meri duniya ho', english: 'You are my world' },
    { native: 'تمہاری یاد آتی ہے', roman: 'Tumhari yaad aati hai', english: 'I miss you' },
    { native: 'میں تمہارا انتظار کر رہا ہوں', roman: 'Main tumhara intezaar kar raha hoon', english: 'I am waiting for you' },
  ],
  endearment: [
    { native: 'میری جان', roman: 'Meri Jaan', english: 'My life/soul' },
    { native: 'جانو', roman: 'Jaanu', english: 'Sweetheart' },
    { native: 'جانی', roman: 'Jaani', english: 'Darling' },
    { native: 'سونا', roman: 'Sona', english: 'Gold (term of endearment)' },
    { native: 'شہزادی', roman: 'Shehzadi', english: 'Princess' },
    { native: 'شہزادا', roman: 'Shehzada', english: 'Prince' },
    { native: 'میری گڑیا', roman: 'Meri Gudiya', english: 'My doll' },
    { native: 'پیارے', roman: 'Pyaare', english: 'Dear one' },
  ],
  greetings: [
    { native: 'السلام علیکم', roman: 'Assalamu Alaikum', english: 'Peace be upon you' },
    { native: 'وعلیکم السلام', roman: 'Walaikum Assalam', english: 'And upon you peace' },
    { native: 'کیا حال ہے؟', roman: 'Kya haal hai?', english: 'How are you?' },
    { native: 'میں ٹھیک ہوں', roman: 'Main theek hoon', english: 'I am fine' },
    { native: 'صبح بخیر', roman: 'Subah bakhair', english: 'Good morning' },
    { native: 'شب بخیر', roman: 'Shab bakhair', english: 'Good night' },
    { native: 'خدا حافظ', roman: 'Khuda Hafiz', english: 'Goodbye' },
    { native: 'پھر ملیں گے', roman: 'Phir milenge', english: 'See you again' },
    { native: 'خوش آمدید', roman: 'Khush Aamdeed', english: 'Welcome' },
  ],
  compliments: [
    { native: 'تم بہت خوبصورت ہو', roman: 'Tum bohat khubsurat ho', english: 'You are very beautiful' },
    { native: 'تم بہت پیاری ہو', roman: 'Tum bohat pyaari ho', english: 'You are very lovely' },
    { native: 'شاباش', roman: 'Shabaash', english: 'Well done' },
    { native: 'کمال کر دیا', roman: 'Kamaal kar diya', english: 'You did amazing' },
    { native: 'تم بہت ہوشیار ہو', roman: 'Tum bohat hoshiyaar ho', english: 'You are very smart' },
    { native: 'بہت خوب', roman: 'Bohat khoob', english: 'Excellent' },
  ],
  food: [
    { native: 'کھانا', roman: 'Khana', english: 'Food' },
    { native: 'پانی', roman: 'Paani', english: 'Water' },
    { native: 'چائے', roman: 'Chai', english: 'Tea' },
    { native: 'دودھ', roman: 'Doodh', english: 'Milk' },
    { native: 'روٹی', roman: 'Roti', english: 'Bread' },
    { native: 'چاول', roman: 'Chawal', english: 'Rice' },
    { native: 'گوشت', roman: 'Gosht', english: 'Meat' },
    { native: 'مرغی', roman: 'Murghi', english: 'Chicken' },
    { native: 'سبزی', roman: 'Sabzi', english: 'Vegetables' },
    { native: 'پھل', roman: 'Phal', english: 'Fruit' },
    { native: 'بریانی', roman: 'Biryani', english: 'Biryani' },
    { native: 'نہاری', roman: 'Nihari', english: 'Nihari' },
    { native: 'مزیدار', roman: 'Mazedaar', english: 'Delicious' },
    { native: 'بھوک لگی ہے', roman: 'Bhook lagi hai', english: 'I am hungry' },
    { native: 'پیاس لگی ہے', roman: 'Pyaas lagi hai', english: 'I am thirsty' },
  ],
  family: [
    { native: 'امی', roman: 'Ami', english: 'Mother' },
    { native: 'ابو', roman: 'Abu', english: 'Father' },
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
    { native: 'معاف کیجیے', roman: 'Maaf kijiye', english: 'Sorry' },
    { native: 'ٹھیک ہے', roman: 'Theek hai', english: 'Okay' },
    { native: 'آج', roman: 'Aaj', english: 'Today' },
    { native: 'کل', roman: 'Kal', english: 'Yesterday/Tomorrow' },
    { native: 'ابھی', roman: 'Abhi', english: 'Now' },
    { native: 'بعد میں', roman: 'Baad mein', english: 'Later' },
  ],
  questions: [
    { native: 'کیا؟', roman: 'Kya?', english: 'What?' },
    { native: 'کیوں؟', roman: 'Kyun?', english: 'Why?' },
    { native: 'کب؟', roman: 'Kab?', english: 'When?' },
    { native: 'کہاں؟', roman: 'Kahan?', english: 'Where?' },
    { native: 'کون؟', roman: 'Kaun?', english: 'Who?' },
    { native: 'کیسے؟', roman: 'Kaise?', english: 'How?' },
    { native: 'کتنا؟', roman: 'Kitna?', english: 'How much?' },
  ],
  verbs: [
    { native: 'کھانا', roman: 'Khana', english: 'To eat' },
    { native: 'پینا', roman: 'Peena', english: 'To drink' },
    { native: 'سونا', roman: 'Sona', english: 'To sleep' },
    { native: 'جاگنا', roman: 'Jaagna', english: 'To wake up' },
    { native: 'چلنا', roman: 'Chalna', english: 'To walk' },
    { native: 'دوڑنا', roman: 'Daurna', english: 'To run' },
    { native: 'بیٹھنا', roman: 'Baithna', english: 'To sit' },
    { native: 'دیکھنا', roman: 'Dekhna', english: 'To see' },
    { native: 'سننا', roman: 'Sunna', english: 'To hear' },
    { native: 'بولنا', roman: 'Bolna', english: 'To speak' },
    { native: 'پڑھنا', roman: 'Parhna', english: 'To read' },
    { native: 'لکھنا', roman: 'Likhna', english: 'To write' },
    { native: 'کرنا', roman: 'Karna', english: 'To do' },
    { native: 'آنا', roman: 'Aana', english: 'To come' },
    { native: 'جانا', roman: 'Jaana', english: 'To go' },
  ],
  pronouns: [
    { native: 'میں', roman: 'Main', english: 'I' },
    { native: 'تم', roman: 'Tum', english: 'You (informal)' },
    { native: 'آپ', roman: 'Aap', english: 'You (formal)' },
    { native: 'وہ', roman: 'Woh', english: 'He/She/That' },
    { native: 'ہم', roman: 'Hum', english: 'We' },
    { native: 'میرا', roman: 'Mera', english: 'My (masc)' },
    { native: 'میری', roman: 'Meri', english: 'My (fem)' },
    { native: 'تمہارا', roman: 'Tumhara', english: 'Your' },
  ],
  adjectives: [
    { native: 'اچھا', roman: 'Acha', english: 'Good' },
    { native: 'برا', roman: 'Bura', english: 'Bad' },
    { native: 'بڑا', roman: 'Bara', english: 'Big' },
    { native: 'چھوٹا', roman: 'Chota', english: 'Small' },
    { native: 'گرم', roman: 'Garam', english: 'Hot' },
    { native: 'ٹھنڈا', roman: 'Thanda', english: 'Cold' },
    { native: 'خوبصورت', roman: 'Khubsurat', english: 'Beautiful' },
    { native: 'خوش', roman: 'Khush', english: 'Happy' },
    { native: 'اداس', roman: 'Udaas', english: 'Sad' },
  ],
  badwords: [
    { native: 'پاگل', roman: 'Pagal', english: 'Crazy/Idiot' },
    { native: 'بے وقوف', roman: 'Bewakoof', english: 'Stupid' },
    { native: 'گدھا', roman: 'Gadha', english: 'Donkey (idiot)' },
    { native: 'چپ کر', roman: 'Chup kar', english: 'Shut up' },
    { native: 'دفع ہو', roman: 'Dafa ho', english: 'Get lost' },
  ],
}

const urduNumbers = [
  { native: '۰', roman: 'Sifar', english: '0' },
  { native: '۱', roman: 'Aik', english: '1' },
  { native: '۲', roman: 'Do', english: '2' },
  { native: '۳', roman: 'Teen', english: '3' },
  { native: '۴', roman: 'Chaar', english: '4' },
  { native: '۵', roman: 'Paanch', english: '5' },
  { native: '۶', roman: 'Chay', english: '6' },
  { native: '۷', roman: 'Saat', english: '7' },
  { native: '۸', roman: 'Aath', english: '8' },
  { native: '۹', roman: 'Nau', english: '9' },
  { native: '۱۰', roman: 'Das', english: '10' },
  { native: '۲۰', roman: 'Bees', english: '20' },
  { native: '۵۰', roman: 'Pachaas', english: '50' },
  { native: '۱۰۰', roman: 'Sau', english: '100' },
]

const urduAlphabet = [
  { letter: 'ا', name: 'Alif', sound: 'a' },
  { letter: 'ب', name: 'Bay', sound: 'b' },
  { letter: 'پ', name: 'Pay', sound: 'p' },
  { letter: 'ت', name: 'Tay', sound: 't' },
  { letter: 'ٹ', name: 'Ttay', sound: 'hard t' },
  { letter: 'ث', name: 'Say', sound: 's' },
  { letter: 'ج', name: 'Jeem', sound: 'j' },
  { letter: 'چ', name: 'Chay', sound: 'ch' },
  { letter: 'ح', name: 'Bari Hey', sound: 'h' },
  { letter: 'خ', name: 'Khay', sound: 'kh' },
  { letter: 'د', name: 'Daal', sound: 'd' },
  { letter: 'ڈ', name: 'Ddaal', sound: 'hard d' },
  { letter: 'ذ', name: 'Zaal', sound: 'z' },
  { letter: 'ر', name: 'Ray', sound: 'r' },
  { letter: 'ڑ', name: 'Rray', sound: 'flapped r' },
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
  { letter: 'و', name: 'Wao', sound: 'w' },
  { letter: 'ہ', name: 'Choti Hey', sound: 'h' },
  { letter: 'ی', name: 'Choti Yay', sound: 'y' },
  { letter: 'ے', name: 'Bari Yay', sound: 'ay' },
]

// TAGALOG LIBRARY
const tagalogLibrary = {
  love: [
    { roman: 'Mahal kita', english: 'I love you' },
    { roman: 'Mahal na mahal kita', english: 'I love you so much' },
    { roman: 'Ikaw ang buhay ko', english: 'You are my life' },
    { roman: 'Ikaw lang ang mahal ko', english: 'You are my only love' },
    { roman: 'Miss na miss kita', english: 'I miss you so much' },
    { roman: 'Lagi kitang iniisip', english: 'I always think of you' },
  ],
  endearment: [
    { roman: 'Mahal', english: 'Love/Dear' },
    { roman: 'Mahal ko', english: 'My love' },
    { roman: 'Sinta', english: 'Beloved' },
    { roman: 'Buhay ko', english: 'My life' },
  ],
  greetings: [
    { roman: 'Kumusta', english: 'Hello' },
    { roman: 'Magandang umaga', english: 'Good morning' },
    { roman: 'Magandang hapon', english: 'Good afternoon' },
    { roman: 'Magandang gabi', english: 'Good evening' },
    { roman: 'Paalam', english: 'Goodbye' },
    { roman: 'Ingat', english: 'Take care' },
    { roman: 'Salamat', english: 'Thank you' },
  ],
  compliments: [
    { roman: 'Ang ganda mo', english: 'You are beautiful' },
    { roman: 'Ang galing mo', english: 'You are amazing' },
    { roman: 'Ang bait mo', english: 'You are so kind' },
  ],
  food: [
    { roman: 'Pagkain', english: 'Food' },
    { roman: 'Tubig', english: 'Water' },
    { roman: 'Kanin', english: 'Rice' },
    { roman: 'Adobo', english: 'Adobo' },
    { roman: 'Sinigang', english: 'Sour soup' },
    { roman: 'Masarap', english: 'Delicious' },
    { roman: 'Gutom ako', english: 'I am hungry' },
  ],
  family: [
    { roman: 'Nanay', english: 'Mother' },
    { roman: 'Tatay', english: 'Father' },
    { roman: 'Kuya', english: 'Older brother' },
    { roman: 'Ate', english: 'Older sister' },
    { roman: 'Lolo', english: 'Grandfather' },
    { roman: 'Lola', english: 'Grandmother' },
  ],
  daily: [
    { roman: 'Oo', english: 'Yes' },
    { roman: 'Hindi', english: 'No' },
    { roman: 'Salamat', english: 'Thank you' },
    { roman: 'Pasensya na', english: 'Sorry' },
    { roman: 'Sige', english: 'Okay' },
  ],
  questions: [
    { roman: 'Ano?', english: 'What?' },
    { roman: 'Bakit?', english: 'Why?' },
    { roman: 'Kailan?', english: 'When?' },
    { roman: 'Saan?', english: 'Where?' },
    { roman: 'Sino?', english: 'Who?' },
    { roman: 'Paano?', english: 'How?' },
  ],
  verbs: [
    { roman: 'Kumain', english: 'To eat' },
    { roman: 'Uminom', english: 'To drink' },
    { roman: 'Matulog', english: 'To sleep' },
    { roman: 'Lumakad', english: 'To walk' },
    { roman: 'Tumakbo', english: 'To run' },
    { roman: 'Magsalita', english: 'To speak' },
  ],
  pronouns: [
    { roman: 'Ako', english: 'I' },
    { roman: 'Ikaw', english: 'You' },
    { roman: 'Siya', english: 'He/She' },
    { roman: 'Tayo', english: 'We' },
    { roman: 'Sila', english: 'They' },
  ],
  badwords: [
    { roman: 'Gago', english: 'Stupid' },
    { roman: 'Tanga', english: 'Idiot' },
    { roman: 'Bobo', english: 'Dumb' },
  ],
}

const tagalogNumbers = [
  { roman: 'Isa', english: '1' },
  { roman: 'Dalawa', english: '2' },
  { roman: 'Tatlo', english: '3' },
  { roman: 'Apat', english: '4' },
  { roman: 'Lima', english: '5' },
  { roman: 'Anim', english: '6' },
  { roman: 'Pito', english: '7' },
  { roman: 'Walo', english: '8' },
  { roman: 'Siyam', english: '9' },
  { roman: 'Sampu', english: '10' },
]

const tagalogAlphabet = [
  { letter: 'A', name: 'A', sound: 'ah' },
  { letter: 'B', name: 'Ba', sound: 'bah' },
  { letter: 'K', name: 'Ka', sound: 'kah' },
  { letter: 'D', name: 'Da', sound: 'dah' },
  { letter: 'E', name: 'E', sound: 'eh' },
  { letter: 'G', name: 'Ga', sound: 'gah' },
  { letter: 'H', name: 'Ha', sound: 'hah' },
  { letter: 'I', name: 'I', sound: 'ee' },
  { letter: 'L', name: 'La', sound: 'lah' },
  { letter: 'M', name: 'Ma', sound: 'mah' },
  { letter: 'N', name: 'Na', sound: 'nah' },
  { letter: 'NG', name: 'Nga', sound: 'ngah' },
  { letter: 'O', name: 'O', sound: 'oh' },
  { letter: 'P', name: 'Pa', sound: 'pah' },
  { letter: 'R', name: 'Ra', sound: 'rah' },
  { letter: 'S', name: 'Sa', sound: 'sah' },
  { letter: 'T', name: 'Ta', sound: 'tah' },
  { letter: 'U', name: 'U', sound: 'oo' },
  { letter: 'W', name: 'Wa', sound: 'wah' },
  { letter: 'Y', name: 'Ya', sound: 'yah' },
]

// ISLAMIC/ARABIC
const arabicLibrary = {
  greetings: [
    { arabic: 'السَّلَامُ عَلَيْكُمْ', roman: 'Assalamu Alaikum', english: 'Peace be upon you' },
    { arabic: 'وَعَلَيْكُمُ السَّلَامُ', roman: 'Wa Alaikum Assalam', english: 'And upon you peace' },
    { arabic: 'مَرْحَبًا', roman: 'Marhaba', english: 'Hello' },
    { arabic: 'شُكْرًا', roman: 'Shukran', english: 'Thank you' },
  ],
  phrases: [
    { arabic: 'إِنْ شَاءَ اللَّهُ', roman: 'Inshallah', english: 'God willing' },
    { arabic: 'مَا شَاءَ اللَّهُ', roman: 'Mashallah', english: 'As Allah willed' },
    { arabic: 'سُبْحَانَ اللَّهِ', roman: 'SubhanAllah', english: 'Glory be to Allah' },
    { arabic: 'الْحَمْدُ لِلَّهِ', roman: 'Alhamdulillah', english: 'Praise be to Allah' },
    { arabic: 'اللَّهُ أَكْبَرُ', roman: 'Allahu Akbar', english: 'Allah is Greatest' },
    { arabic: 'بِسْمِ اللَّهِ', roman: 'Bismillah', english: 'In the name of Allah' },
    { arabic: 'جَزَاكَ اللَّهُ خَيْرًا', roman: 'JazakAllahu Khayran', english: 'May Allah reward you' },
  ],
  daily: [
    { arabic: 'نَعَمْ', roman: 'Naam', english: 'Yes' },
    { arabic: 'لَا', roman: 'La', english: 'No' },
    { arabic: 'مِنْ فَضْلِكَ', roman: 'Min fadlik', english: 'Please' },
  ],
}

const islamicLessons = {
  level1: { title: 'Social Phrases', description: 'Essential Islamic greetings', words: [
    { arabic: 'السَّلَامُ عَلَيْكُمْ', roman: 'Assalamu Alaikum', english: 'Peace be upon you', usage: 'Greeting Muslims' },
    { arabic: 'إِنْ شَاءَ اللَّهُ', roman: 'Inshallah', english: 'God willing', usage: 'Future plans' },
    { arabic: 'مَا شَاءَ اللَّهُ', roman: 'Mashallah', english: 'What Allah willed', usage: 'Admiration' },
  ]},
  level2: { title: 'Dhikr', description: 'Phrases of remembrance', words: [
    { arabic: 'سُبْحَانَ اللَّهِ', roman: 'SubhanAllah', english: 'Glory be to Allah', usage: 'Praising Allah' },
    { arabic: 'الْحَمْدُ لِلَّهِ', roman: 'Alhamdulillah', english: 'All praise to Allah', usage: 'Gratitude' },
    { arabic: 'اللَّهُ أَكْبَرُ', roman: 'Allahu Akbar', english: 'Allah is Greatest', usage: 'Proclaiming greatness' },
  ]},
  level3: { title: 'Daily Duas', description: 'Everyday supplications', words: [
    { arabic: 'بِسْمِ اللَّهِ', roman: 'Bismillah', english: 'In Allah\'s name', usage: 'Before starting' },
    { arabic: 'جَزَاكَ اللَّهُ خَيْرًا', roman: 'JazakAllah Khair', english: 'May Allah reward you', usage: 'Thanking' },
  ]},
  level4: { title: 'Spiritual Concepts', description: 'Deep values', words: [
    { arabic: 'صَبْر', roman: 'Sabr', english: 'Patience', usage: 'Steadfastness' },
    { arabic: 'تَوَكُّل', roman: 'Tawakkul', english: 'Trust in Allah', usage: 'Relying on Allah' },
    { arabic: 'شُكْر', roman: 'Shukr', english: 'Gratitude', usage: 'Being thankful' },
  ]},
}

const arabicAlphabet = [
  { letter: 'ا', name: 'Alif', sound: 'a' },
  { letter: 'ب', name: 'Ba', sound: 'b' },
  { letter: 'ت', name: 'Ta', sound: 't' },
  { letter: 'ث', name: 'Tha', sound: 'th' },
  { letter: 'ج', name: 'Jeem', sound: 'j' },
  { letter: 'ح', name: 'Ha', sound: 'h' },
  { letter: 'خ', name: 'Kha', sound: 'kh' },
  { letter: 'د', name: 'Dal', sound: 'd' },
  { letter: 'ذ', name: 'Dhal', sound: 'dh' },
  { letter: 'ر', name: 'Ra', sound: 'r' },
  { letter: 'ز', name: 'Zay', sound: 'z' },
  { letter: 'س', name: 'Seen', sound: 's' },
  { letter: 'ش', name: 'Sheen', sound: 'sh' },
  { letter: 'ص', name: 'Sad', sound: 's' },
  { letter: 'ض', name: 'Dad', sound: 'd' },
  { letter: 'ط', name: 'Ta', sound: 't' },
  { letter: 'ظ', name: 'Dha', sound: 'dh' },
  { letter: 'ع', name: 'Ain', sound: 'a' },
  { letter: 'غ', name: 'Ghain', sound: 'gh' },
  { letter: 'ف', name: 'Fa', sound: 'f' },
  { letter: 'ق', name: 'Qaf', sound: 'q' },
  { letter: 'ك', name: 'Kaf', sound: 'k' },
  { letter: 'ل', name: 'Lam', sound: 'l' },
  { letter: 'م', name: 'Meem', sound: 'm' },
  { letter: 'ن', name: 'Noon', sound: 'n' },
  { letter: 'ه', name: 'Ha', sound: 'h' },
  { letter: 'و', name: 'Waw', sound: 'w' },
  { letter: 'ي', name: 'Ya', sound: 'y' },
]

const arabicNumbers = [
  { arabic: '٠', roman: 'Sifr', english: '0' },
  { arabic: '١', roman: 'Wahid', english: '1' },
  { arabic: '٢', roman: 'Ithnan', english: '2' },
  { arabic: '٣', roman: 'Thalatha', english: '3' },
  { arabic: '٤', roman: 'Arba\'a', english: '4' },
  { arabic: '٥', roman: 'Khamsa', english: '5' },
  { arabic: '٦', roman: 'Sitta', english: '6' },
  { arabic: '٧', roman: 'Sab\'a', english: '7' },
  { arabic: '٨', roman: 'Thamaniya', english: '8' },
  { arabic: '٩', roman: 'Tis\'a', english: '9' },
  { arabic: '١٠', roman: 'Ashara', english: '10' },
]

const grammarLessons = {
  urdu: {
    title: 'Urdu Sentence Structure',
    subtitle: 'SOV - Subject Object Verb',
    explanation: 'In Urdu, the verb comes at the END. Basic order: Subject + Object + Verb.',
    examples: [
      { english: 'I eat food', local: 'Main khana khata hoon', breakdown: 'I + food + eat' },
      { english: 'She drinks water', local: 'Woh paani peeti hai', breakdown: 'She + water + drinks' },
    ],
    tips: ['Verb always at end', 'Male verbs end in -ta, female in -ti', 'Use "aap" for respect'],
  },
  tagalog: {
    title: 'Tagalog Sentence Structure',
    subtitle: 'VSO - Verb Subject Object',
    explanation: 'In Tagalog, the verb comes FIRST. Description before noun.',
    examples: [
      { english: 'I am beautiful', local: 'Maganda ako', breakdown: 'Beautiful + I' },
      { english: 'I love you', local: 'Mahal kita', breakdown: 'Love + I-you' },
    ],
    tips: ['Po/Opo adds respect', 'Ang marks subject', 'Ng marks object'],
  },
}

const categoryConfig = {
  love: { label: 'Love', color: 'bg-rose-50' },
  endearment: { label: 'Sweet Names', color: 'bg-pink-50' },
  greetings: { label: 'Greetings', color: 'bg-amber-50' },
  compliments: { label: 'Compliments', color: 'bg-purple-50' },
  food: { label: 'Food and Dining', color: 'bg-orange-50' },
  family: { label: 'Family', color: 'bg-blue-50' },
  daily: { label: 'Daily Essentials', color: 'bg-green-50' },
  questions: { label: 'Questions', color: 'bg-cyan-50' },
  verbs: { label: 'Verbs', color: 'bg-indigo-50' },
  pronouns: { label: 'Pronouns', color: 'bg-teal-50' },
  adjectives: { label: 'Adjectives', color: 'bg-lime-50' },
  badwords: { label: 'Bad Words', color: 'bg-red-50' },
  phrases: { label: 'Phrases', color: 'bg-emerald-50' },
}

export default function LearnPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('urdu')
  const [view, setView] = useState('daily')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedLevel, setSelectedLevel] = useState(null)
  const [alphabetIndex, setAlphabetIndex] = useState(0)

  const handleTabChange = (newTab) => {
    setView('daily')
    setSelectedCategory(null)
    setSelectedLevel(null)
    setAlphabetIndex(0)
    setActiveTab(newTab)
  }

  const getWordOfDay = () => {
    if (activeTab === 'islam') {
      const allWords = Object.values(islamicLessons).flatMap(l => l.words)
      const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
      return allWords[day % allWords.length]
    }
    const library = activeTab === 'urdu' ? urduLibrary : tagalogLibrary
    const allWords = Object.values(library).flat()
    const day = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    return allWords[(day + (activeTab === 'urdu' ? 0 : 100)) % allWords.length]
  }

  const wordOfDay = getWordOfDay()
  const theirName = user?.role === 'shah' ? 'Dane' : 'Shahjahan'

  return (
    <div className="min-h-screen pb-28">
      <div className="bg-forest px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-display-sm text-cream-50 mb-2">Learn</h1>
          <p className="text-body text-cream-300">Growing together</p>
        </div>
      </div>

      <div className="bg-cream px-4 py-4 sticky top-0 z-20 border-b border-cream-300">
        <div className="max-w-lg mx-auto flex justify-center gap-2">
          {[{ id: 'urdu', label: 'Urdu' }, { id: 'tagalog', label: 'Tagalog' }, { id: 'islam', label: 'Islam' }].map((lang) => (
            <button key={lang.id} onClick={() => handleTabChange(lang.id)} className={`px-5 py-3 rounded-full text-body-sm font-medium transition-all ${activeTab === lang.id ? 'bg-forest text-cream-100' : 'bg-cream-200 text-ink-500'}`}>
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-cream min-h-[60vh]">
        {view === 'daily' && <DailyView word={wordOfDay} language={activeTab} setView={setView} user={user} theirName={theirName} />}
        {view === 'library' && <LibraryView library={activeTab === 'urdu' ? urduLibrary : activeTab === 'tagalog' ? tagalogLibrary : arabicLibrary} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} setView={setView} user={user} theirName={theirName} />}
        {view === 'grammar' && <GrammarView grammar={grammarLessons[activeTab === 'islam' ? 'urdu' : activeTab]} setView={setView} />}
        {view === 'alphabet' && <AlphabetView alphabet={activeTab === 'urdu' ? urduAlphabet : activeTab === 'tagalog' ? tagalogAlphabet : arabicAlphabet} index={alphabetIndex} setIndex={setAlphabetIndex} setView={setView} rtl={activeTab !== 'tagalog'} />}
        {view === 'numbers' && <NumbersView numbers={activeTab === 'urdu' ? urduNumbers : activeTab === 'tagalog' ? tagalogNumbers : arabicNumbers} setView={setView} rtl={activeTab !== 'tagalog'} />}
        {view === 'islamic' && <IslamicView selectedLevel={selectedLevel} setSelectedLevel={setSelectedLevel} setView={setView} user={user} theirName={theirName} />}
      </div>
    </div>
  )
}

function VoicePractice({ word, user, theirName }) {
  const [recordings, setRecordings] = useState([])
  const [isRecording, setIsRecording] = useState(false)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const wordKey = word?.roman?.toLowerCase().replace(/\s+/g, '-') || 'unknown'

  useEffect(() => { fetchRecordings() }, [wordKey])

  const fetchRecordings = async () => {
    try {
      const { data } = await supabase.from('word_recordings').select('*').eq('word_key', wordKey)
      setRecordings(data || [])
    } catch (err) { console.error(err) }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRef.current = new MediaRecorder(stream)
      chunksRef.current = []
      mediaRef.current.ondataavailable = e => e.data.size > 0 && chunksRef.current.push(e.data)
      mediaRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        stream.getTracks().forEach(t => t.stop())
        await uploadRecording(blob)
      }
      mediaRef.current.start()
      setIsRecording(true)
    } catch { alert('Microphone access needed') }
  }

  const stopRecording = () => { mediaRef.current?.stop(); setIsRecording(false) }

  const uploadRecording = async (blob) => {
    try {
      const filename = `${wordKey}_${user.role}_${Date.now()}.webm`
      const { error: uploadError } = await supabase.storage.from('audio').upload(filename, blob)
      if (uploadError) throw uploadError
      const { data: { publicUrl } } = supabase.storage.from('audio').getPublicUrl(filename)
      await supabase.from('word_recordings').insert({ word_key: wordKey, user_role: user.role, audio_url: publicUrl })
      fetchRecordings()
    } catch (err) { console.error(err) }
  }

  const shahRec = recordings.find(r => r.user_role === 'shah')
  const daneRec = recordings.find(r => r.user_role === 'dane')

  return (
    <div className="mt-6 pt-6 border-t border-cream-200">
      <p className="text-body-sm text-ink-400 text-center mb-4">Practice Together</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <p className="text-body-sm font-medium text-forest mb-2">Shahjahan</p>
          {shahRec ? <audio controls src={shahRec.audio_url} className="w-full h-10" /> : <p className="text-caption text-ink-300">Not recorded</p>}
        </div>
        <div className="text-center">
          <p className="text-body-sm font-medium text-forest mb-2">Dane</p>
          {daneRec ? <audio controls src={daneRec.audio_url} className="w-full h-10" /> : <p className="text-caption text-ink-300">Not recorded</p>}
        </div>
      </div>
      <div className="flex justify-center">
        <button onClick={isRecording ? stopRecording : startRecording} className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${isRecording ? 'bg-rose-500 animate-pulse' : 'bg-forest'}`}>
          <span className="text-white text-sm font-medium">{isRecording ? 'Stop' : 'Record'}</span>
        </button>
      </div>
    </div>
  )
}

function DailyView({ word, language, setView, user, theirName }) {
  if (!word) return null
  return (
    <div className="px-6 py-8">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-card mb-6">
          <p className="text-center text-body-sm text-forest font-medium mb-6">Word of the Day</p>
          <div className="text-center py-4">
            {(word.native || word.arabic) && <p className="text-4xl text-forest mb-4" dir="rtl">{word.native || word.arabic}</p>}
            <h2 className="font-serif text-display-sm text-forest mb-3">{word.roman}</h2>
            <p className="text-body-lg text-ink-500">{word.english}</p>
            {word.usage && <p className="text-body-sm text-ink-400 mt-2 italic">{word.usage}</p>}
          </div>
          <VoicePractice word={word} user={user} theirName={theirName} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setView('library')} className="bg-rose-50 rounded-2xl p-5 text-left"><p className="font-serif text-title-sm text-forest">Word Library</p><p className="text-body-sm text-forest-600">All words</p></button>
          {language !== 'islam' && <button onClick={() => setView('grammar')} className="bg-amber-50 rounded-2xl p-5 text-left"><p className="font-serif text-title-sm text-forest">Grammar</p><p className="text-body-sm text-forest-600">Structure</p></button>}
          <button onClick={() => setView('alphabet')} className="bg-purple-50 rounded-2xl p-5 text-left"><p className="font-serif text-title-sm text-forest">Alphabet</p><p className="text-body-sm text-forest-600">Letters</p></button>
          <button onClick={() => setView('numbers')} className="bg-blue-50 rounded-2xl p-5 text-left"><p className="font-serif text-title-sm text-forest">Numbers</p><p className="text-body-sm text-forest-600">Counting</p></button>
          {language === 'islam' && <button onClick={() => setView('islamic')} className="bg-green-50 rounded-2xl p-5 text-left col-span-2"><p className="font-serif text-title-sm text-forest">Islamic Lessons</p><p className="text-body-sm text-forest-600">4 levels</p></button>}
        </div>
      </div>
    </div>
  )
}

function LibraryView({ library, selectedCategory, setSelectedCategory, setView, user, theirName }) {
  return (
    <div className="px-6 py-8">
      <div className="max-w-lg mx-auto">
        <button onClick={() => selectedCategory ? setSelectedCategory(null) : setView('daily')} className="text-body-sm text-ink-400 mb-6">← Back</button>
        {!selectedCategory ? (
          <>
            <h2 className="font-serif text-title text-forest text-center mb-6">Word Library</h2>
            <div className="space-y-3">
              {Object.keys(library).map(cat => (
                <button key={cat} onClick={() => setSelectedCategory(cat)} className={`w-full ${categoryConfig[cat]?.color || 'bg-cream-200'} rounded-xl p-4 text-left flex justify-between items-center`}>
                  <div><p className="font-medium text-forest">{categoryConfig[cat]?.label || cat}</p><p className="text-body-sm text-forest-600">{library[cat].length} words</p></div>
                  <span className="text-forest-400">→</span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h3 className="font-serif text-title text-forest mb-4">{categoryConfig[selectedCategory]?.label}</h3>
            <div className="space-y-3">
              {library[selectedCategory].map((word, i) => <WordCard key={i} word={word} user={user} theirName={theirName} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function WordCard({ word, user, theirName }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="bg-white rounded-xl shadow-soft overflow-hidden">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-4 text-left">
        {(word.native || word.arabic) && <p className="text-xl text-forest mb-1" dir="rtl">{word.native || word.arabic}</p>}
        <p className="font-serif text-title-sm text-forest">{word.roman}</p>
        <p className="text-body text-ink-500">{word.english}</p>
      </button>
      {expanded && <div className="px-4 pb-4 border-t border-cream-200"><VoicePractice word={word} user={user} theirName={theirName} /></div>}
    </div>
  )
}

function GrammarView({ grammar, setView }) {
  if (!grammar) return null
  return (
    <div className="px-6 py-8">
      <div className="max-w-lg mx-auto">
        <button onClick={() => setView('daily')} className="text-body-sm text-ink-400 mb-6">← Back</button>
        <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
          <h2 className="font-serif text-title text-forest mb-2">{grammar.title}</h2>
          <p className="text-body-lg text-amber-600 font-medium mb-3">{grammar.subtitle}</p>
          <p className="text-body text-ink-600">{grammar.explanation}</p>
        </div>
        <h3 className="font-serif text-title-sm text-forest mb-3">Examples</h3>
        <div className="space-y-3 mb-6">
          {grammar.examples?.map((ex, i) => (
            <div key={i} className="bg-amber-50 rounded-xl p-4">
              <p className="text-body text-ink-600">"{ex.english}"</p>
              <p className="font-serif text-title-sm text-forest">→ {ex.local}</p>
              <p className="text-body-sm text-amber-700">{ex.breakdown}</p>
            </div>
          ))}
        </div>
        <div className="bg-forest-50 rounded-xl p-5">
          <h3 className="font-medium text-forest mb-3">Tips</h3>
          <ul className="space-y-2">{grammar.tips?.map((tip, i) => <li key={i} className="text-body text-forest-700">• {tip}</li>)}</ul>
        </div>
      </div>
    </div>
  )
}

function AlphabetView({ alphabet, index, setIndex, setView, rtl }) {
  const current = alphabet[index]
  const next = () => setIndex((index + 1) % alphabet.length)
  const prev = () => setIndex((index - 1 + alphabet.length) % alphabet.length)
  return (
    <div className="px-6 py-8">
      <div className="max-w-lg mx-auto">
        <button onClick={() => setView('daily')} className="text-body-sm text-ink-400 mb-6">← Back</button>
        <h2 className="font-serif text-title text-forest text-center mb-2">Alphabet</h2>
        <p className="text-body-sm text-ink-400 text-center mb-6">{index + 1} of {alphabet.length}</p>
        <div className="flex items-center gap-4 mb-6">
          <button onClick={prev} className="w-12 h-12 bg-cream-200 rounded-full flex items-center justify-center text-forest">←</button>
          <div className="flex-1 bg-white rounded-3xl p-8 shadow-card text-center">
            <p className="text-8xl text-forest mb-4" dir={rtl ? 'rtl' : 'ltr'}>{current.letter}</p>
            <p className="font-serif text-title text-forest mb-2">{current.name}</p>
            <p className="text-body text-ink-500">Sound: "{current.sound}"</p>
          </div>
          <button onClick={next} className="w-12 h-12 bg-cream-200 rounded-full flex items-center justify-center text-forest">→</button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {alphabet.map((item, i) => (
            <button key={i} onClick={() => setIndex(i)} className={`aspect-square rounded-lg flex items-center justify-center text-lg ${i === index ? 'bg-forest text-cream-100' : 'bg-white text-forest shadow-soft'}`}>{item.letter}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

function NumbersView({ numbers, setView, rtl }) {
  return (
    <div className="px-6 py-8">
      <div className="max-w-lg mx-auto">
        <button onClick={() => setView('daily')} className="text-body-sm text-ink-400 mb-6">← Back</button>
        <h2 className="font-serif text-title text-forest text-center mb-6">Numbers</h2>
        <div className="space-y-3">
          {numbers.map((num, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-soft flex items-center justify-between">
              <div><p className="font-serif text-title-sm text-forest">{num.roman}</p><p className="text-body-sm text-ink-500">{num.english}</p></div>
              {(num.native || num.arabic) && <p className="text-3xl text-forest" dir={rtl ? 'rtl' : 'ltr'}>{num.native || num.arabic}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function IslamicView({ selectedLevel, setSelectedLevel, setView, user, theirName }) {
  const levels = Object.entries(islamicLessons)
  return (
    <div className="px-6 py-8">
      <div className="max-w-lg mx-auto">
        <button onClick={() => selectedLevel ? setSelectedLevel(null) : setView('daily')} className="text-body-sm text-ink-400 mb-6">← Back</button>
        {!selectedLevel ? (
          <>
            <h2 className="font-serif text-title text-forest text-center mb-6">Islamic Lessons</h2>
            <div className="space-y-3">
              {levels.map(([key, level], i) => (
                <button key={key} onClick={() => setSelectedLevel(key)} className="w-full bg-white rounded-xl p-4 shadow-soft text-left flex items-center gap-4">
                  <div className="w-10 h-10 bg-forest rounded-full flex items-center justify-center text-cream-100 font-serif">{i + 1}</div>
                  <div><p className="font-medium text-forest">{level.title}</p><p className="text-body-sm text-ink-400">{level.description}</p></div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="font-serif text-title text-forest mb-2">{islamicLessons[selectedLevel].title}</h2>
            <div className="space-y-4">
              {islamicLessons[selectedLevel].words.map((word, i) => <WordCard key={i} word={word} user={user} theirName={theirName} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
