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
  const { data, error } = await supabase.rpc('get_daily_question')
  if (error) throw error
  return data?.[0] || null
}

export async function answerQuestion(questionId, userRole, answer) {
  const { data, error } = await supabase
    .from('question_answers')
    .upsert({
      question_id: questionId,
      user_role: userRole,
      answer,
      answered_at: new Date().toISOString()
    }, { onConflict: 'question_id,user_role' })
    .select()
    .single()
  if (error) throw error
  return data
}

// ==================== LESSONS ====================
export async function getDailyLesson(language) {
  const { data, error } = await supabase.rpc('get_daily_lesson', { lang: language })
  if (error) throw error
  return data?.[0] || null
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
  const { data, error } = await supabase
    .from('lesson_responses')
    .insert({
      lesson_id: lessonId,
      user_role: userRole,
      response_type: type,
      audio_url: audioUrl,
      comment
    })
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
  // Add to progress
  await supabase
    .from('lesson_progress')
    .upsert({ user_role: userRole, lesson_id: lessonId }, { onConflict: 'user_role,lesson_id' })

  // Update streak
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
export async function uploadAudio(file, path) {
  const { data, error } = await supabase.storage
    .from('audio')
    .upload(path, file, { contentType: 'audio/webm' })
  if (error) throw error

  const { data: urlData } = supabase.storage.from('audio').getPublicUrl(path)
  return urlData.publicUrl
}

export async function uploadPhoto(file, path) {
  const { data, error } = await supabase.storage
    .from('photos')
    .upload(path, file, { contentType: file.type })
  if (error) throw error

  const { data: urlData } = supabase.storage.from('photos').getPublicUrl(path)
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
