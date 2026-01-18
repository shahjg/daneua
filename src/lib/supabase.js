import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// STATUS
// ============================================
export async function getCurrentStatus() {
  const { data, error } = await supabase
    .from('status_updates')
    .select('*')
    .eq('is_current', true)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function setStatus(status, location = null) {
  const { data, error } = await supabase.rpc('set_status', { 
    new_status: status, 
    new_location: location 
  })
  if (error) throw error
  return data
}

// ============================================
// LOVE MESSAGES
// ============================================
export async function getLoveMessage(category) {
  const { data, error } = await supabase.rpc('get_love_message', { msg_category: category })
  if (error) throw error
  return data?.[0] || null
}

export async function getAllLoveMessages() {
  const { data, error } = await supabase
    .from('love_messages')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

// ============================================
// LOVE LETTERS
// ============================================
export async function getLoveLetters() {
  const { data, error } = await supabase
    .from('love_letters')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function addLoveLetter(letter) {
  const { data, error } = await supabase
    .from('love_letters')
    .insert(letter)
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================
// LANGUAGE LEARNING
// ============================================
export async function getDailyWord(language) {
  const { data, error } = await supabase.rpc('get_daily_word', { lang: language })
  if (error) throw error
  return data?.[0] || null
}

export async function getAllWords(language) {
  const { data, error } = await supabase
    .from('language_lessons')
    .select('*')
    .eq('language', language)
    .eq('is_active', true)
    .order('shown_on', { ascending: false, nullsFirst: false })
  if (error) throw error
  return data
}

// ============================================
// DAILY DEEN
// ============================================
export async function getDailyDeen() {
  const { data, error } = await supabase.rpc('get_daily_deen')
  if (error) throw error
  return data?.[0] || null
}

// ============================================
// DATE IDEAS
// ============================================
export async function getDateIdeas(filters = {}) {
  let query = supabase
    .from('date_ideas')
    .select('*')
    .order('created_at', { ascending: false })

  if (filters.status) query = query.eq('status', filters.status)
  if (filters.vibe) query = query.eq('vibe', filters.vibe)
  if (filters.date_type) query = query.eq('date_type', filters.date_type)
  if (filters.price_level) query = query.eq('price_level', filters.price_level)

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

// ============================================
// CALENDAR
// ============================================
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

// ============================================
// GOALS
// ============================================
export async function getGoals(owner = null) {
  let query = supabase
    .from('goals')
    .select(`
      *,
      milestones:goal_milestones(*)
    `)
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

// ============================================
// DAILY QUESTIONS
// ============================================
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
    }, {
      onConflict: 'question_id,user_role'
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// ============================================
// MOMENTS (Photo of the Day)
// ============================================
export async function getTodaysMoments() {
  const today = new Date().toISOString().split('T')[0]
  const { data, error } = await supabase
    .from('moments')
    .select('*')
    .eq('moment_date', today)
  if (error) throw error
  return data
}

export async function getMomentsHistory(limit = 14) {
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

// ============================================
// ACTIVITY FEED
// ============================================
export async function getActivityFeed(userRole, limit = 20) {
  const { data, error } = await supabase
    .from('activity_feed')
    .select('*')
    .eq('for_user', userRole)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function markActivityRead(id) {
  const { error } = await supabase
    .from('activity_feed')
    .update({ is_read: true })
    .eq('id', id)
  if (error) throw error
}

// ============================================
// REAL-TIME SUBSCRIPTIONS
// ============================================
export function subscribeToStatus(callback) {
  return supabase
    .channel('status_changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'status_updates' },
      callback
    )
    .subscribe()
}

export function subscribeToMoments(callback) {
  return supabase
    .channel('moments_changes')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'moments' },
      callback
    )
    .subscribe()
}

export function subscribeToActivity(callback) {
  return supabase
    .channel('activity_changes')
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'activity_feed' },
      callback
    )
    .subscribe()
}
