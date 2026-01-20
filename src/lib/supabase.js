import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ==================== AUTH ====================
export async function verifyPin(role, pin) {
  const { data, error } = await supabase.rpc('verify_pin', { user_role: role, pin })
  if (error) throw error
  return data
}

export async function getUser(role) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', role)
    .single()
  if (error) throw error
  return data
}

// ==================== STATUS ====================
export async function getCurrentStatus() {
  const { data, error } = await supabase
    .from('status_updates')
    .select('*')
    .eq('is_current', true)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function setStatus(status, type = 'general', emoji = null, location = null) {
  const { data, error } = await supabase.rpc('set_status', {
    new_status: status,
    new_type: type,
    new_emoji: emoji,
    new_location: location
  })
  if (error) throw error
  return data
}

// ==================== COUNTDOWNS ====================
export async function getCountdowns() {
  const { data, error } = await supabase
    .from('countdowns')
    .select('*')
    .eq('is_active', true)
    .order('target_date', { ascending: true })
  if (error) throw error
  return data
}

export async function addCountdown(title, targetDate, emoji = '📅') {
  const { data, error } = await supabase
    .from('countdowns')
    .insert({ title, target_date: targetDate, emoji, is_active: true })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCountdown(id) {
  const { error } = await supabase
    .from('countdowns')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ==================== DUA REQUESTS ====================
export async function sendDuaRequest(fromUser, message = null) {
  const { data, error } = await supabase
    .from('dua_requests')
    .insert({ from_user: fromUser, message })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getUnreadDuaRequests(forUser) {
  const otherUser = forUser === 'shah' ? 'dane' : 'shah'
  const { data, error } = await supabase
    .from('dua_requests')
    .select('*')
    .eq('from_user', otherUser)
    .eq('is_read', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function markDuaRead(id) {
  const { error } = await supabase
    .from('dua_requests')
    .update({ is_read: true })
    .eq('id', id)
  if (error) throw error
}

// ==================== DAILY QUESTIONS ====================
export async function getDailyQuestion() {
  // Use today's date to get a consistent question for the day
  const today = new Date().toISOString().split('T')[0]
  
  // Get all questions
  const { data: questions, error: qError } = await supabase
    .from('daily_questions')
    .select('*')
    .order('id')
  
  if (qError || !questions || questions.length === 0) {
    return null
  }
  
  // Use the day of year to pick a consistent question
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
  const questionIndex = dayOfYear % questions.length
  const question = questions[questionIndex]
  
  // Get answers for this question
  const { data: answers } = await supabase
    .from('question_answers')
    .select('*')
    .eq('question_id', question.id)
  
  return {
    ...question,
    shah_answer: answers?.find(a => a.user_role === 'shah')?.answer || null,
    dane_answer: answers?.find(a => a.user_role === 'dane')?.answer || null
  }
}

export async function answerQuestion(questionId, userRole, answer) {
  // Check if answer already exists
  const { data: existing } = await supabase
    .from('question_answers')
    .select('*')
    .eq('question_id', questionId)
    .eq('user_role', userRole)
    .maybeSingle()
  
  if (existing) {
    const { data, error } = await supabase
      .from('question_answers')
      .update({ answer, answered_at: new Date().toISOString() })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  }
  
  const { data, error } = await supabase
    .from('question_answers')
    .insert({
      question_id: questionId,
      user_role: userRole,
      answer,
      answered_at: new Date().toISOString()
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ==================== LESSONS ====================
export async function getDailyLesson(language) {
  // Get today's date to create a consistent seed per day per language
  const today = new Date().toISOString().split('T')[0]
  const seed = today + '-' + language
  
  // Get all lessons for this language
  const { data: lessons, error } = await supabase
    .from('lessons')
    .select('*')
    .eq('language', language)
    .eq('is_active', true)
    .order('id')
  
  if (error) throw error
  if (!lessons || lessons.length === 0) return null
  
  // Use day of year + language to pick a consistent lesson
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24))
  const languageOffset = language === 'urdu' ? 0 : language === 'tagalog' ? 100 : 200
  const index = (dayOfYear + languageOffset) % lessons.length
  
  return lessons[index]
}

export async function getLessonsByCategory(language, category = null) {
  let query = supabase
    .from('lessons')
    .select('*')
    .eq('language', language)
    .eq('is_active', true)
    .order('is_couples_vocab', { ascending: false })
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getLessonCategories(language) {
  const { data, error } = await supabase
    .from('lessons')
    .select('category')
    .eq('language', language)
    .eq('is_active', true)
  if (error) throw error
  return [...new Set(data.map(d => d.category))]
}

export async function addLessonResponse(lessonId, userRole, type, audioUrl = null, comment = null) {
  // For voice notes without a lesson, we need to handle null lesson_id
  const insertData = {
    user_role: userRole,
    response_type: type,
    audio_url: audioUrl,
    comment
  }
  
  // Only add lesson_id if it's not null
  if (lessonId) {
    insertData.lesson_id = lessonId
  }
  
  const { data, error } = await supabase
    .from('lesson_responses')
    .insert(insertData)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getLessonResponses(lessonId) {
  const { data, error } = await supabase
    .from('lesson_responses')
    .select('*')
    .eq('lesson_id', lessonId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function markLessonComplete(userRole, lessonId) {
  await supabase
    .from('lesson_progress')
    .upsert({ user_role: userRole, lesson_id: lessonId }, { onConflict: 'user_role,lesson_id' })

  const { error } = await supabase.rpc('update_learning_streak', { p_user_role: userRole })
  if (error) throw error
}

export async function getLearningStreak(userRole) {
  const { data, error } = await supabase
    .from('learning_streaks')
    .select('*')
    .eq('user_role', userRole)
    .single()
  if (error && error.code !== 'PGRST116') throw error
  return data
}

// ==================== DAILY DEEN ====================
export async function getDailyDeen() {
  const { data, error } = await supabase.rpc('get_daily_deen')
  if (error) throw error
  return data?.[0] || null
}

// ==================== LOVE MESSAGES ====================
export async function getLoveMessage(mood) {
  const { data, error } = await supabase.rpc('get_love_message', { msg_mood: mood })
  if (error) throw error
  return data?.[0] || null
}

// ==================== LOVE LETTERS ====================
export async function getLoveLetters() {
  const { data, error } = await supabase
    .from('love_letters')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addLoveLetter(fromUser, title, content) {
  const { data, error } = await supabase
    .from('love_letters')
    .insert({ from_user: fromUser, title, content })
    .select()
    .single()
  if (error) throw error
  return data
}

// ==================== MOMENTS ====================
export async function getTodaysMoments() {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .eq('moment_date', today)
  if (error) throw error
  return data
}

export async function getMomentsHistory(limit = 20) {
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .order('moment_date', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function addMoment(userRole, photoUrl, caption = null) {
  const { data, error } = await supabase
    .from('moments')
    .insert({
      user_role: userRole,
      photo_url: photoUrl,
      caption,
      moment_date: new Date().toISOString().split('T')[0]
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ==================== DATE IDEAS ====================
export async function getDateIdeas(filters = {}) {
  let query = supabase
    .from('date_ideas')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.vibe) query = query.eq('vibe', filters.vibe)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function addDateIdea(idea) {
  const { data, error } = await supabase
    .from('date_ideas')
    .insert(idea)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateDateIdea(id, updates) {
  const { data, error } = await supabase
    .from('date_ideas')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteDateIdea(id) {
  const { error } = await supabase
    .from('date_ideas')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ==================== CALENDAR ====================
export async function getCalendarEvents(startDate, endDate) {
  const { data, error } = await supabase
    .from('calendar_events')
    .select('*')
    .gte('start_date', startDate)
    .lte('start_date', endDate)
    .order('start_date', { ascending: true })
  if (error) throw error
  return data
}

export async function addCalendarEvent(event) {
  const { data, error } = await supabase
    .from('calendar_events')
    .insert(event)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCalendarEvent(id) {
  const { error } = await supabase
    .from('calendar_events')
    .delete()
    .eq('id', id)
  if (error) throw error
}

// ==================== GOALS ====================
export async function getGoals(owner = null) {
  let query = supabase
    .from('goals')
    .select(`*, milestones:goal_milestones(*)`)
    .order('created_at', { ascending: false })

  if (owner) query = query.eq('owner', owner)

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function addGoal(goal) {
  const { data, error } = await supabase
    .from('goals')
    .insert(goal)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateGoal(id, updates) {
  const { data, error } = await supabase
    .from('goals')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteGoal(id) {
  // First delete milestones
  await supabase
    .from('goal_milestones')
    .delete()
    .eq('goal_id', id)
  
  // Then delete the goal
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function addMilestone(goalId, title) {
  const { data, error } = await supabase
    .from('goal_milestones')
    .insert({ goal_id: goalId, title })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function toggleMilestone(id, completed) {
  const { data, error } = await supabase
    .from('goal_milestones')
    .update({
      is_completed: completed,
      completed_at: completed ? new Date().toISOString() : null
    })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ==================== ACTIVITY FEED ====================
export async function getActivityFeed(forUser, limit = 10) {
  const { data, error } = await supabase
    .from('activity_feed')
    .select('*')
    .eq('for_user', forUser)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

// ==================== FILE UPLOAD ====================
export async function uploadAudio(blob, fileName) {
  // Check if bucket exists first
  const { data: buckets } = await supabase.storage.listBuckets()
  const audioBucket = buckets?.find(b => b.name === 'audio')
  
  if (!audioBucket) {
    throw new Error('Storage bucket "audio" not found. Please create it in Supabase Storage.')
  }

  const { data, error } = await supabase.storage
    .from('audio')
    .upload(fileName, blob, { 
      contentType: 'audio/webm',
      upsert: true 
    })
  
  if (error) {
    console.error('Upload error:', error)
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data: urlData } = supabase.storage.from('audio').getPublicUrl(fileName)
  return urlData.publicUrl
}

export async function uploadPhoto(file, fileName) {
  // Check if bucket exists first
  const { data: buckets } = await supabase.storage.listBuckets()
  const photoBucket = buckets?.find(b => b.name === 'photos')
  
  if (!photoBucket) {
    throw new Error('Storage bucket "photos" not found. Please create it in Supabase Storage.')
  }

  const { data, error } = await supabase.storage
    .from('photos')
    .upload(fileName, file, { 
      contentType: file.type,
      upsert: true
    })
  
  if (error) {
    console.error('Upload error:', error)
    throw new Error(`Upload failed: ${error.message}`)
  }

  const { data: urlData } = supabase.storage.from('photos').getPublicUrl(fileName)
  return urlData.publicUrl
}

// ==================== SUBSCRIPTIONS ====================
export function subscribeToStatus(callback) {
  return supabase
    .channel('status')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'status_updates' }, callback)
    .subscribe()
}

export function subscribeToDuaRequests(callback) {
  return supabase
    .channel('dua')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'dua_requests' }, callback)
    .subscribe()
}

export function subscribeToMoments(callback) {
  return supabase
    .channel('moments')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'moments' }, callback)
    .subscribe()
}
