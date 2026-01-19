import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

// 2025-2026 Holidays
const HOLIDAYS = {
  '2025-01-01': 'New Year\'s Day',
  '2025-01-20': 'MLK Day',
  '2025-02-14': 'Valentine\'s Day',
  '2025-03-01': 'Ramadan Begins',
  '2025-03-30': 'Eid al-Fitr',
  '2025-04-20': 'Easter',
  '2025-05-11': 'Mother\'s Day',
  '2025-05-26': 'Memorial Day',
  '2025-06-06': 'Eid al-Adha',
  '2025-06-15': 'Father\'s Day',
  '2025-07-04': 'Independence Day',
  '2025-09-01': 'Labor Day',
  '2025-10-31': 'Halloween',
  '2025-11-27': 'Thanksgiving',
  '2025-12-25': 'Christmas',
  '2025-12-31': 'New Year\'s Eve',
  '2026-01-01': 'New Year\'s Day',
  '2026-01-19': 'MLK Day',
  '2026-02-14': 'Valentine\'s Day',
  '2026-02-17': 'Ramadan Begins',
  '2026-03-20': 'Eid al-Fitr',
  '2026-04-05': 'Easter',
  '2026-05-10': 'Mother\'s Day',
  '2026-05-25': 'Memorial Day',
  '2026-05-27': 'Eid al-Adha',
  '2026-06-21': 'Father\'s Day',
  '2026-07-04': 'Independence Day',
  '2026-09-07': 'Labor Day',
  '2026-10-31': 'Halloween',
  '2026-11-26': 'Thanksgiving',
  '2026-12-25': 'Christmas'
}

export default function PlansPage() {
  const { user, supabase, getPartner } = useAuth()
  const [tab, setTab] = useState('dateIdeas')
  const [toast, setToast] = useState(null)
  
  // Date Ideas State
  const [dateIdeas, setDateIdeas] = useState([])
  const [showAddIdea, setShowAddIdea] = useState(false)
  const [newIdea, setNewIdea] = useState('')
  const [editingIdea, setEditingIdea] = useState(null)
  const [showDeleteIdea, setShowDeleteIdea] = useState(null)
  
  // Calendar State
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [eventTitle, setEventTitle] = useState('')
  const [eventTime, setEventTime] = useState('')
  const [eventEndDate, setEventEndDate] = useState('')
  const [editingEvent, setEditingEvent] = useState(null)
  const [showDeleteEvent, setShowDeleteEvent] = useState(null)
  
  // Countdowns State
  const [countdowns, setCountdowns] = useState([])
  const [showAddCountdown, setShowAddCountdown] = useState(false)
  const [countdownTitle, setCountdownTitle] = useState('')
  const [countdownDate, setCountdownDate] = useState('')
  const [editingCountdown, setEditingCountdown] = useState(null)
  const [showDeleteCountdown, setShowDeleteCountdown] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadData = async () => {
    if (!supabase) return
    
    const [ideasRes, eventsRes, countdownsRes] = await Promise.all([
      supabase.from('date_ideas').select('*').order('created_at', { ascending: false }),
      supabase.from('calendar_events').select('*').order('start_date', { ascending: true }),
      supabase.from('countdowns').select('*').order('target_date', { ascending: true })
    ])
    
    if (ideasRes.data) setDateIdeas(ideasRes.data)
    if (eventsRes.data) setEvents(eventsRes.data)
    if (countdownsRes.data) setCountdowns(countdownsRes.data)
  }

  // Date Ideas Functions
  const addDateIdea = async () => {
    if (!newIdea.trim() || !supabase) return
    
    const { error } = await supabase.from('date_ideas').insert({
      title: newIdea.trim(),
      completed: false,
      created_by: user.id
    })
    
    if (!error) {
      setNewIdea('')
      setShowAddIdea(false)
      loadData()
      showToast('Date idea added!', 'success')
    }
  }

  const toggleIdeaComplete = async (idea) => {
    if (!supabase) return
    await supabase.from('date_ideas').update({ completed: !idea.completed }).eq('id', idea.id)
    loadData()
  }

  const updateDateIdea = async () => {
    if (!editingIdea || !supabase) return
    await supabase.from('date_ideas').update({ title: editingIdea.title }).eq('id', editingIdea.id)
    setEditingIdea(null)
    loadData()
    showToast('Updated!', 'success')
  }

  const deleteIdea = async (id) => {
    if (!supabase) return
    await supabase.from('date_ideas').delete().eq('id', id)
    setShowDeleteIdea(null)
    loadData()
    showToast('Deleted', 'success')
  }

  // Calendar Functions
  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    const days = []
    for (let i = 0; i < startingDay; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const formatDateKey = (year, month, day) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }

  const getEventsForDate = (dateKey) => {
    return events.filter(e => {
      if (e.end_date) {
        return dateKey >= e.start_date && dateKey <= e.end_date
      }
      return e.start_date === dateKey
    })
  }

  const getHoliday = (dateKey) => HOLIDAYS[dateKey]

  const handleDateClick = (day) => {
    if (!day) return
    const dateKey = formatDateKey(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setSelectedDate(dateKey)
    setEventTitle('')
    setEventTime('')
    setEventEndDate('')
    setEditingEvent(null)
    setShowEventModal(true)
  }

  const saveEvent = async () => {
    if (!eventTitle.trim() || !supabase) return
    
    const eventData = {
      title: eventTitle.trim(),
      start_date: selectedDate,
      end_date: eventEndDate || null,
      time: eventTime || null,
      created_by: user.id
    }
    
    if (editingEvent) {
      await supabase.from('calendar_events').update(eventData).eq('id', editingEvent.id)
    } else {
      await supabase.from('calendar_events').insert(eventData)
    }
    
    setShowEventModal(false)
    loadData()
    showToast(editingEvent ? 'Updated!' : 'Event added!', 'success')
  }

  const editEvent = (event) => {
    setEditingEvent(event)
    setEventTitle(event.title)
    setEventTime(event.time || '')
    setEventEndDate(event.end_date || '')
    setSelectedDate(event.start_date)
    setShowEventModal(true)
  }

  const deleteEvent = async (id) => {
    if (!supabase) return
    await supabase.from('calendar_events').delete().eq('id', id)
    setShowDeleteEvent(null)
    loadData()
    showToast('Deleted', 'success')
  }

  // Countdown Functions
  const addCountdown = async () => {
    if (!countdownTitle.trim() || !countdownDate || !supabase) return
    
    await supabase.from('countdowns').insert({
      title: countdownTitle.trim(),
      target_date: countdownDate,
      created_by: user.id
    })
    
    setCountdownTitle('')
    setCountdownDate('')
    setShowAddCountdown(false)
    loadData()
    showToast('Countdown added!', 'success')
  }

  const updateCountdown = async () => {
    if (!editingCountdown || !supabase) return
    await supabase.from('countdowns').update({
      title: editingCountdown.title,
      target_date: editingCountdown.target_date
    }).eq('id', editingCountdown.id)
    setEditingCountdown(null)
    loadData()
    showToast('Updated!', 'success')
  }

  const deleteCountdown = async (id) => {
    if (!supabase) return
    await supabase.from('countdowns').delete().eq('id', id)
    setShowDeleteCountdown(null)
    loadData()
    showToast('Deleted', 'success')
  }

  const getDaysUntil = (dateStr) => {
    const target = new Date(dateStr + 'T00:00:00')
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
    return diff
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-card ${toast.type === 'success' ? 'bg-forest text-cream-100' : 'bg-ink-700 text-white'}`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="p-6 pb-4">
        <h1 className="font-serif text-display-sm text-forest mb-4">Plans</h1>
        
        {/* Tabs */}
        <div className="flex gap-2 bg-cream-200 p-1 rounded-xl">
          <button
            onClick={() => setTab('dateIdeas')}
            className={`flex-1 py-2 px-3 rounded-lg text-body-sm font-medium transition-colors ${tab === 'dateIdeas' ? 'bg-white text-forest shadow-soft' : 'text-ink-500'}`}
          >
            Date Ideas
          </button>
          <button
            onClick={() => setTab('calendar')}
            className={`flex-1 py-2 px-3 rounded-lg text-body-sm font-medium transition-colors ${tab === 'calendar' ? 'bg-white text-forest shadow-soft' : 'text-ink-500'}`}
          >
            Calendar
          </button>
          <button
            onClick={() => setTab('countdowns')}
            className={`flex-1 py-2 px-3 rounded-lg text-body-sm font-medium transition-colors ${tab === 'countdowns' ? 'bg-white text-forest shadow-soft' : 'text-ink-500'}`}
          >
            Countdowns
          </button>
        </div>
      </div>

      <div className="px-6 pb-24">
        {/* DATE IDEAS TAB */}
        {tab === 'dateIdeas' && (
          <div>
            <button
              onClick={() => setShowAddIdea(true)}
              className="w-full bg-forest text-cream-100 py-4 rounded-xl font-medium mb-4"
            >
              + Add Date Idea
            </button>
            
            <div className="space-y-3">
              {dateIdeas.map(idea => (
                <div key={idea.id} className="bg-white rounded-xl p-4 shadow-soft">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleIdeaComplete(idea)}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${idea.completed ? 'bg-forest border-forest text-white' : 'border-ink-300'}`}
                    >
                      {idea.completed && '✓'}
                    </button>
                    <p className={`flex-1 text-body ${idea.completed ? 'line-through text-ink-400' : 'text-ink-600'}`}>
                      {idea.title}
                    </p>
                    <button
                      onClick={() => setEditingIdea(idea)}
                      className="text-ink-400 px-2"
                    >
                      ✏️
                    </button>
                  </div>
                </div>
              ))}
              
              {dateIdeas.length === 0 && (
                <p className="text-center text-ink-400 py-8">No date ideas yet. Add one!</p>
              )}
            </div>
          </div>
        )}

        {/* CALENDAR TAB */}
        {tab === 'calendar' && (
          <div>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="p-2 bg-white rounded-lg shadow-soft"
              >
                ←
              </button>
              <h2 className="font-serif text-title text-forest">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="p-2 bg-white rounded-lg shadow-soft"
              >
                →
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-2xl p-4 shadow-soft mb-4">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-center text-caption text-ink-400 font-medium py-2">{d}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((day, i) => {
                  if (!day) return <div key={i} />
                  
                  const dateKey = formatDateKey(currentMonth.getFullYear(), currentMonth.getMonth(), day)
                  const dayEvents = getEventsForDate(dateKey)
                  const holiday = getHoliday(dateKey)
                  const isToday = dateKey === new Date().toISOString().split('T')[0]
                  
                  return (
                    <button
                      key={i}
                      onClick={() => handleDateClick(day)}
                      className={`aspect-square rounded-lg flex flex-col items-center justify-center relative ${
                        isToday ? 'bg-forest text-cream-100' : 'hover:bg-cream-50'
                      }`}
                    >
                      <span className="text-body-sm">{day}</span>
                      {(dayEvents.length > 0 || holiday) && (
                        <div className="flex gap-0.5 mt-0.5">
                          {holiday && <div className="w-1.5 h-1.5 rounded-full bg-gold" />}
                          {dayEvents.length > 0 && <div className="w-1.5 h-1.5 rounded-full bg-rose-400" />}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Upcoming Events & Holidays */}
            <h3 className="font-serif text-title-sm text-forest mb-3">Upcoming</h3>
            <div className="space-y-2">
              {/* Show holidays for next 30 days */}
              {Object.entries(HOLIDAYS)
                .filter(([date]) => {
                  const d = new Date(date)
                  const now = new Date()
                  const diff = (d - now) / (1000 * 60 * 60 * 24)
                  return diff >= 0 && diff <= 60
                })
                .slice(0, 5)
                .map(([date, name]) => (
                  <div key={date} className="bg-gold-50 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-gold" />
                    <div className="flex-1">
                      <p className="text-body-sm font-medium text-ink-600">{name}</p>
                      <p className="text-caption text-ink-400">{new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                  </div>
                ))}
              
              {events.slice(0, 5).map(event => (
                <div key={event.id} className="bg-white rounded-xl p-3 shadow-soft flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-rose-400" />
                  <div className="flex-1">
                    <p className="text-body-sm font-medium text-ink-600">{event.title}</p>
                    <p className="text-caption text-ink-400">
                      {new Date(event.start_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {event.time && ` at ${event.time}`}
                      {event.end_date && ` → ${new Date(event.end_date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                    </p>
                  </div>
                  <button onClick={() => editEvent(event)} className="text-ink-400 px-2">✏️</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* COUNTDOWNS TAB */}
        {tab === 'countdowns' && (
          <div>
            <button
              onClick={() => setShowAddCountdown(true)}
              className="w-full bg-forest text-cream-100 py-4 rounded-xl font-medium mb-4"
            >
              + Add Countdown
            </button>
            
            <div className="space-y-4">
              {countdowns.map(countdown => {
                const daysLeft = getDaysUntil(countdown.target_date)
                return (
                  <div key={countdown.id} className="bg-white rounded-2xl p-5 shadow-soft">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-serif text-title-sm text-forest">{countdown.title}</h3>
                      <button onClick={() => setEditingCountdown(countdown)} className="text-ink-400">✏️</button>
                    </div>
                    <div className="flex items-end gap-2">
                      <span className="font-serif text-display text-forest">{daysLeft}</span>
                      <span className="text-body text-ink-500 mb-2">{daysLeft === 1 ? 'day' : 'days'} left</span>
                    </div>
                    <p className="text-caption text-ink-400 mt-2">
                      {new Date(countdown.target_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )
              })}
              
              {countdowns.length === 0 && (
                <p className="text-center text-ink-400 py-8">No countdowns yet. Add one!</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ADD DATE IDEA MODAL */}
      {showAddIdea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-4">Add Date Idea</h3>
            <input
              value={newIdea}
              onChange={(e) => setNewIdea(e.target.value)}
              placeholder="What should we do?"
              className="w-full p-4 bg-cream-50 rounded-xl text-body mb-4 focus:outline-none focus:ring-2 focus:ring-forest/20"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowAddIdea(false)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={addDateIdea} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT DATE IDEA MODAL */}
      {editingIdea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-4">Edit Date Idea</h3>
            <input
              value={editingIdea.title}
              onChange={(e) => setEditingIdea({ ...editingIdea, title: e.target.value })}
              className="w-full p-4 bg-cream-50 rounded-xl text-body mb-4 focus:outline-none focus:ring-2 focus:ring-forest/20"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteIdea(editingIdea.id)} className="py-3 px-4 bg-rose-100 text-rose-600 rounded-xl">Delete</button>
              <button onClick={() => setEditingIdea(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={updateDateIdea} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE IDEA CONFIRMATION */}
      {showDeleteIdea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-2">Delete Date Idea?</h3>
            <p className="text-body text-ink-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteIdea(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={() => deleteIdea(showDeleteIdea)} className="flex-1 py-3 bg-rose-500 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* CALENDAR EVENT MODAL */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-4">
              {editingEvent ? 'Edit Event' : 'Add Event'}
            </h3>
            <p className="text-body-sm text-ink-400 mb-4">
              {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-body-sm text-ink-500 mb-1 block">Event Title</label>
                <input
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="What's happening?"
                  className="w-full p-4 bg-cream-50 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>
              
              <div>
                <label className="text-body-sm text-ink-500 mb-1 block">Time (optional)</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full p-4 bg-cream-50 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>
              
              <div>
                <label className="text-body-sm text-ink-500 mb-1 block">End Date (for multi-day events)</label>
                <input
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  min={selectedDate}
                  className="w-full p-4 bg-cream-50 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              {editingEvent && (
                <button onClick={() => setShowDeleteEvent(editingEvent.id)} className="py-3 px-4 bg-rose-100 text-rose-600 rounded-xl">Delete</button>
              )}
              <button onClick={() => setShowEventModal(false)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={saveEvent} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE EVENT CONFIRMATION */}
      {showDeleteEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-2">Delete Event?</h3>
            <p className="text-body text-ink-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteEvent(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={() => { deleteEvent(showDeleteEvent); setShowEventModal(false) }} className="flex-1 py-3 bg-rose-500 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD COUNTDOWN MODAL */}
      {showAddCountdown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-4">Add Countdown</h3>
            <div className="space-y-4 mb-4">
              <input
                value={countdownTitle}
                onChange={(e) => setCountdownTitle(e.target.value)}
                placeholder="What are you counting down to?"
                className="w-full p-4 bg-cream-50 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
              <input
                type="date"
                value={countdownDate}
                onChange={(e) => setCountdownDate(e.target.value)}
                className="w-full p-4 bg-cream-50 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAddCountdown(false)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={addCountdown} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT COUNTDOWN MODAL */}
      {editingCountdown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-4">Edit Countdown</h3>
            <div className="space-y-4 mb-4">
              <input
                value={editingCountdown.title}
                onChange={(e) => setEditingCountdown({ ...editingCountdown, title: e.target.value })}
                className="w-full p-4 bg-cream-50 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
              <input
                type="date"
                value={editingCountdown.target_date}
                onChange={(e) => setEditingCountdown({ ...editingCountdown, target_date: e.target.value })}
                className="w-full p-4 bg-cream-50 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-forest/20"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteCountdown(editingCountdown.id)} className="py-3 px-4 bg-rose-100 text-rose-600 rounded-xl">Delete</button>
              <button onClick={() => setEditingCountdown(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={updateCountdown} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE COUNTDOWN CONFIRMATION */}
      {showDeleteCountdown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-2">Delete Countdown?</h3>
            <p className="text-body text-ink-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteCountdown(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={() => deleteCountdown(showDeleteCountdown)} className="flex-1 py-3 bg-rose-500 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
