import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============================================
// MOOD MESSAGES
// ============================================
export async function getRandomMoodMessage(mood) {
  const { data, error } = await supabase
    .rpc('get_random_mood_message', { mood_type: mood })
  
  if (error) throw error
  return data?.[0] || null
}

// ============================================
// LANGUAGE WORDS (Urdu & Tagalog)
// ============================================
export async function getDailyWord(language) {
  const { data, error } = await supabase
    .rpc('get_daily_word', { lang: language })
  
  if (error) throw error
  return data?.[0] || null
}

export async function getAllWords(language) {
  const { data, error } = await supabase
    .from('language_words')
    .select('*')
    .eq('language', language)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

// ============================================
// DAILY DEEN
// ============================================
export async function getDailyDeen() {
  // Get today's deen or random unshown one
  const today = new Date().toISOString().split('T')[0]
  
  let { data, error } = await supabase
    .from('daily_deen')
    .select('*')
    .eq('shown_on', today)
    .eq('is_active', true)
    .limit(1)
    .single()
  
  if (!data) {
    // Get random unshown
    const { data: randomData, error: randomError } = await supabase
      .from('daily_deen')
      .select('*')
      .eq('is_active', true)
      .or(`shown_on.is.null,shown_on.lt.${today}`)
      .limit(1)
      .single()
    
    if (randomData) {
      // Mark as shown today
      await supabase
        .from('daily_deen')
        .update({ shown_on: today })
        .eq('id', randomData.id)
      
      data = randomData
    }
  }
  
  return data
}

// ============================================
// STATUS UPDATES
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

export async function setStatus(status, emoji = null, location = null) {
  const { data, error } = await supabase
    .rpc('set_current_status', { 
      new_status: status, 
      new_emoji: emoji, 
      new_location: location 
    })
  
  if (error) throw error
  return data
}

// ============================================
// SHARED TODOS
// ============================================
export async function getTodos() {
  const { data, error } = await supabase
    .from('shared_todos')
    .select('*')
    .order('is_completed', { ascending: true })
    .order('priority', { ascending: false })
    .order('due_date', { ascending: true })
  
  if (error) throw error
  return data
}

export async function addTodo(todo) {
  const { data, error } = await supabase
    .from('shared_todos')
    .insert(todo)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function toggleTodo(id, completed) {
  const { data, error } = await supabase
    .from('shared_todos')
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

export async function deleteTodo(id) {
  const { error } = await supabase
    .from('shared_todos')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// ============================================
// CALENDAR
// ============================================
export async function getCalendarEvents(startDate, endDate) {
  const { data, error } = await supabase
    .from('shared_calendar')
    .select('*')
    .gte('start_date', startDate)
    .lte('start_date', endDate)
    .order('start_date', { ascending: true })
    .order('start_time', { ascending: true })
  
  if (error) throw error
  return data
}

export async function addCalendarEvent(event) {
  const { data, error } = await supabase
    .from('shared_calendar')
    .insert(event)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// ============================================
// MEDIA VAULT
// ============================================
export async function getMediaVault(category = null) {
  let query = supabase
    .from('media_vault')
    .select('*')
    .order('is_favorite', { ascending: false })
    .order('created_at', { ascending: false })
  
  if (category) {
    query = query.eq('category', category)
  }
  
  const { data, error } = await query
  if (error) throw error
  return data
}

export async function incrementViewCount(id) {
  const { error } = await supabase
    .from('media_vault')
    .update({ 
      view_count: supabase.raw('view_count + 1'),
      last_viewed_at: new Date().toISOString()
    })
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

export function subscribeToTodos(callback) {
  return supabase
    .channel('todo_changes')
    .on('postgres_changes',
      { event: '*', schema: 'public', table: 'shared_todos' },
      callback
    )
    .subscribe()
}
