import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function PlansPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('calendar')

  return (
    <div className="min-h-screen pb-28">
      <div className="bg-forest px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-display-sm text-cream-50 mb-2">Plans</h1>
          <p className="text-body text-cream-300">Our journey ahead</p>
        </div>
      </div>

      <div className="bg-cream px-4 py-4 sticky top-0 z-20 border-b border-cream-300">
        <div className="max-w-lg mx-auto flex justify-center gap-2">
          {[{ id: 'calendar', label: 'Calendar' }, { id: 'dates', label: 'Date Ideas' }, { id: 'countdowns', label: 'Countdowns' }].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`px-4 py-2 rounded-full text-body-sm font-medium transition-all ${activeTab === tab.id ? 'bg-forest text-cream-100' : 'bg-cream-200 text-ink-500'}`}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-cream min-h-[60vh]">
        {activeTab === 'calendar' && <CalendarView user={user} />}
        {activeTab === 'dates' && <DateIdeasView user={user} />}
        {activeTab === 'countdowns' && <CountdownsView user={user} />}
      </div>
    </div>
  )
}

function CalendarView({ user }) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', time: '', notes: '' })
  const [editingEvent, setEditingEvent] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const fetchEvents = async () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    const { data } = await supabase
      .from('calendar_events')
      .select('*')
      .gte('date', startOfMonth.toISOString().split('T')[0])
      .lte('date', endOfMonth.toISOString().split('T')[0])
    setEvents(data || [])
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []
    for (let i = 0; i < firstDay; i++) days.push(null)
    for (let i = 1; i <= daysInMonth; i++) days.push(i)
    return days
  }

  const getEventsForDay = (day) => {
    if (!day) return []
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return events.filter(e => e.date === dateStr)
  }

  const handleDayClick = (day) => {
    if (!day) return
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    setSelectedDate(dateStr)
    setShowAddEvent(true)
  }

  const addEvent = async () => {
    if (!newEvent.title.trim() || !selectedDate) return
    await supabase.from('calendar_events').insert({
      date: selectedDate,
      title: newEvent.title,
      time: newEvent.time || null,
      notes: newEvent.notes || null,
      created_by: user.role
    })
    setNewEvent({ title: '', time: '', notes: '' })
    setShowAddEvent(false)
    setSelectedDate(null)
    fetchEvents()
  }

  const updateEvent = async () => {
    if (!editingEvent?.title.trim()) return
    await supabase.from('calendar_events').update({
      title: editingEvent.title,
      time: editingEvent.time,
      notes: editingEvent.notes
    }).eq('id', editingEvent.id)
    setEditingEvent(null)
    fetchEvents()
  }

  const deleteEvent = async (id) => {
    await supabase.from('calendar_events').delete().eq('id', id)
    setShowDeleteModal(null)
    setEditingEvent(null)
    fetchEvents()
  }

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const today = new Date()
  const isToday = (day) => day && today.getDate() === day && today.getMonth() === currentDate.getMonth() && today.getFullYear() === currentDate.getFullYear()

  return (
    <div className="px-6 py-6">
      <div className="max-w-lg mx-auto">
        {/* Month Navigation */}
        <div className="flex justify-between items-center mb-4">
          <button onClick={prevMonth} className="w-10 h-10 bg-cream-200 rounded-full flex items-center justify-center">←</button>
          <h2 className="font-serif text-title text-forest">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
          <button onClick={nextMonth} className="w-10 h-10 bg-cream-200 rounded-full flex items-center justify-center">→</button>
        </div>

        {/* Calendar Grid */}
        <div className="bg-white rounded-2xl p-4 shadow-card mb-6">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(d => <div key={d} className="text-center text-caption text-ink-400 py-2">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth().map((day, i) => {
              const dayEvents = getEventsForDay(day)
              return (
                <button
                  key={i}
                  onClick={() => handleDayClick(day)}
                  disabled={!day}
                  className={`aspect-square rounded-lg flex flex-col items-center justify-center text-body-sm relative ${
                    !day ? 'bg-transparent' :
                    isToday(day) ? 'bg-forest text-cream-100' :
                    dayEvents.length > 0 ? 'bg-rose-100 text-forest' :
                    'bg-cream-100 text-ink-600 hover:bg-cream-200'
                  }`}
                >
                  {day}
                  {dayEvents.length > 0 && <span className="absolute bottom-1 w-1.5 h-1.5 bg-rose-500 rounded-full" />}
                </button>
              )
            })}
          </div>
        </div>

        {/* Events List */}
        <h3 className="font-serif text-title-sm text-forest mb-3">Upcoming Events</h3>
        {events.length === 0 ? (
          <p className="text-ink-400 text-center py-6">No events this month. Tap a date to add one.</p>
        ) : (
          <div className="space-y-2">
            {events.sort((a, b) => a.date.localeCompare(b.date)).map(event => (
              <button key={event.id} onClick={() => setEditingEvent(event)} className="w-full bg-white rounded-xl p-4 shadow-soft text-left">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-forest">{event.title}</p>
                    <p className="text-body-sm text-ink-400">{new Date(event.date + 'T00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })} {event.time && `at ${event.time}`}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add Event Modal */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-serif text-title text-forest mb-2">Add Event</h3>
            <p className="text-body-sm text-ink-400 mb-4">{selectedDate && new Date(selectedDate + 'T00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            <input type="text" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Event title..." className="w-full px-4 py-3 border border-cream-300 rounded-xl mb-3" />
            <input type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} className="w-full px-4 py-3 border border-cream-300 rounded-xl mb-3" />
            <textarea value={newEvent.notes} onChange={e => setNewEvent({ ...newEvent, notes: e.target.value })} placeholder="Notes..." className="w-full px-4 py-3 border border-cream-300 rounded-xl mb-4 h-20 resize-none" />
            <div className="flex gap-3">
              <button onClick={() => { setShowAddEvent(false); setNewEvent({ title: '', time: '', notes: '' }); setSelectedDate(null) }} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={addEvent} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {editingEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-serif text-title text-forest mb-4">Edit Event</h3>
            <input type="text" value={editingEvent.title} onChange={e => setEditingEvent({ ...editingEvent, title: e.target.value })} className="w-full px-4 py-3 border border-cream-300 rounded-xl mb-3" />
            <input type="time" value={editingEvent.time || ''} onChange={e => setEditingEvent({ ...editingEvent, time: e.target.value })} className="w-full px-4 py-3 border border-cream-300 rounded-xl mb-3" />
            <textarea value={editingEvent.notes || ''} onChange={e => setEditingEvent({ ...editingEvent, notes: e.target.value })} placeholder="Notes..." className="w-full px-4 py-3 border border-cream-300 rounded-xl mb-4 h-20 resize-none" />
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(editingEvent.id)} className="py-3 px-4 bg-rose-100 text-rose-600 rounded-xl">Delete</button>
              <button onClick={() => setEditingEvent(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={updateEvent} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-2">Delete Event?</h3>
            <p className="text-body text-ink-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={() => deleteEvent(showDeleteModal)} className="flex-1 py-3 bg-rose-500 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DateIdeasView({ user }) {
  const [ideas, setIdeas] = useState([])
  const [newIdea, setNewIdea] = useState('')
  const [editingIdea, setEditingIdea] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)

  useEffect(() => {
    fetchIdeas()
  }, [])

  const fetchIdeas = async () => {
    const { data } = await supabase.from('date_ideas').select('*').order('created_at', { ascending: false })
    setIdeas(data || [])
  }

  const addIdea = async () => {
    if (!newIdea.trim()) return
    await supabase.from('date_ideas').insert({ idea: newIdea, added_by: user.role })
    setNewIdea('')
    fetchIdeas()
  }

  const updateIdea = async () => {
    if (!editingIdea?.idea.trim()) return
    await supabase.from('date_ideas').update({ idea: editingIdea.idea }).eq('id', editingIdea.id)
    setEditingIdea(null)
    fetchIdeas()
  }

  const deleteIdea = async (id) => {
    await supabase.from('date_ideas').delete().eq('id', id)
    setShowDeleteModal(null)
    setEditingIdea(null)
    fetchIdeas()
  }

  const toggleDone = async (idea) => {
    await supabase.from('date_ideas').update({ done: !idea.done }).eq('id', idea.id)
    fetchIdeas()
  }

  return (
    <div className="px-6 py-6">
      <div className="max-w-lg mx-auto">
        <div className="flex gap-2 mb-6">
          <input type="text" value={newIdea} onChange={e => setNewIdea(e.target.value)} onKeyDown={e => e.key === 'Enter' && addIdea()} placeholder="Add a date idea..." className="flex-1 px-4 py-3 bg-white border border-cream-300 rounded-xl" />
          <button onClick={addIdea} className="px-4 bg-forest text-cream-100 rounded-xl">Add</button>
        </div>

        {ideas.length === 0 ? (
          <p className="text-ink-400 text-center py-12">No date ideas yet</p>
        ) : (
          <div className="space-y-3">
            {ideas.map(idea => (
              <div key={idea.id} className={`bg-white rounded-xl p-4 shadow-soft ${idea.done ? 'opacity-60' : ''}`}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggleDone(idea)} className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${idea.done ? 'bg-green-500 border-green-500' : 'border-cream-400'}`}>
                    {idea.done && <span className="text-white text-xs">✓</span>}
                  </button>
                  <div className="flex-1">
                    <p className={`text-body text-ink-600 ${idea.done ? 'line-through' : ''}`}>{idea.idea}</p>
                    <p className="text-caption text-ink-300 mt-1">by {idea.added_by === 'shah' ? 'Shahjahan' : 'Dane'}</p>
                  </div>
                  <button onClick={() => setEditingIdea(idea)} className="text-ink-300 hover:text-forest p-1">Edit</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingIdea && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-serif text-title text-forest mb-4">Edit Date Idea</h3>
            <textarea value={editingIdea.idea} onChange={e => setEditingIdea({ ...editingIdea, idea: e.target.value })} className="w-full px-4 py-3 border border-cream-300 rounded-xl mb-4 h-24 resize-none" />
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(editingIdea.id)} className="py-3 px-4 bg-rose-100 text-rose-600 rounded-xl">Delete</button>
              <button onClick={() => setEditingIdea(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={updateIdea} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-2">Delete Idea?</h3>
            <p className="text-body text-ink-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={() => deleteIdea(showDeleteModal)} className="flex-1 py-3 bg-rose-500 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CountdownsView({ user }) {
  const [countdowns, setCountdowns] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newCountdown, setNewCountdown] = useState({ title: '', date: '' })
  const [editingCountdown, setEditingCountdown] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)

  useEffect(() => {
    fetchCountdowns()
  }, [])

  const fetchCountdowns = async () => {
    const { data } = await supabase.from('countdowns').select('*').order('date')
    setCountdowns(data || [])
  }

  const addCountdown = async () => {
    if (!newCountdown.title.trim() || !newCountdown.date) return
    await supabase.from('countdowns').insert({ ...newCountdown, created_by: user.role })
    setNewCountdown({ title: '', date: '' })
    setShowAdd(false)
    fetchCountdowns()
  }

  const updateCountdown = async () => {
    if (!editingCountdown?.title.trim()) return
    await supabase.from('countdowns').update({ title: editingCountdown.title, date: editingCountdown.date }).eq('id', editingCountdown.id)
    setEditingCountdown(null)
    fetchCountdowns()
  }

  const deleteCountdown = async (id) => {
    await supabase.from('countdowns').delete().eq('id', id)
    setShowDeleteModal(null)
    setEditingCountdown(null)
    fetchCountdowns()
  }

  const getDaysUntil = (date) => {
    const diff = new Date(date) - new Date()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="px-6 py-6">
      <div className="max-w-lg mx-auto">
        <button onClick={() => setShowAdd(true)} className="w-full bg-forest text-cream-100 rounded-xl p-4 mb-6 font-medium">Add Countdown</button>

        {showAdd && (
          <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
            <h3 className="font-serif text-title text-forest mb-4">New Countdown</h3>
            <input type="text" value={newCountdown.title} onChange={e => setNewCountdown({ ...newCountdown, title: e.target.value })} placeholder="What are you counting down to?" className="w-full px-4 py-3 border border-cream-300 rounded-xl mb-3" />
            <input type="date" value={newCountdown.date} onChange={e => setNewCountdown({ ...newCountdown, date: e.target.value })} className="w-full px-4 py-3 border border-cream-300 rounded-xl mb-4" />
            <div className="flex gap-3">
              <button onClick={() => { setShowAdd(false); setNewCountdown({ title: '', date: '' }) }} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={addCountdown} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Create</button>
            </div>
          </div>
        )}

        {countdowns.length === 0 ? (
          <p className="text-ink-400 text-center py-12">No countdowns yet</p>
        ) : (
          <div className="space-y-4">
            {countdowns.map(countdown => {
              const days = getDaysUntil(countdown.date)
              const isPast = days < 0
              return (
                <div key={countdown.id} className={`bg-white rounded-2xl p-5 shadow-card ${isPast ? 'opacity-60' : ''}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-serif text-title-sm text-forest">{countdown.title}</h3>
                      <p className="text-body-sm text-ink-400">{new Date(countdown.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <button onClick={() => setEditingCountdown(countdown)} className="text-ink-300 hover:text-forest p-1">Edit</button>
                  </div>
                  <div className="mt-4 text-center">
                    <p className="font-serif text-display text-forest">{Math.abs(days)}</p>
                    <p className="text-body text-ink-500">{isPast ? 'days ago' : 'days to go'}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingCountdown && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-serif text-title text-forest mb-4">Edit Countdown</h3>
            <input type="text" value={editingCountdown.title} onChange={e => setEditingCountdown({ ...editingCountdown, title: e.target.value })} className="w-full px-4 py-3 border border-cream-300 rounded-xl mb-3" />
            <input type="date" value={editingCountdown.date} onChange={e => setEditingCountdown({ ...editingCountdown, date: e.target.value })} className="w-full px-4 py-3 border border-cream-300 rounded-xl mb-4" />
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(editingCountdown.id)} className="py-3 px-4 bg-rose-100 text-rose-600 rounded-xl">Delete</button>
              <button onClick={() => setEditingCountdown(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={updateCountdown} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-2">Delete Countdown?</h3>
            <p className="text-body text-ink-500 mb-6">This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={() => deleteCountdown(showDeleteModal)} className="flex-1 py-3 bg-rose-500 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
