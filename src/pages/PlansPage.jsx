import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getDateIdeas,
  addDateIdea,
  updateDateIdea,
  deleteDateIdea,
  getCalendarEvents,
  addCalendarEvent,
  deleteCalendarEvent
} from '../lib/supabase'

const vibes = [
  { id: 'romantic', label: 'Romantic' },
  { id: 'casual', label: 'Casual' },
  { id: 'adventure', label: 'Adventure' },
  { id: 'cozy', label: 'Cozy' },
  { id: 'fancy', label: 'Fancy' },
]

const dateTypes = [
  { id: 'dinner', label: 'Dinner' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'cafe', label: 'Cafe' },
  { id: 'activity', label: 'Activity' },
  { id: 'day_trip', label: 'Day Trip' },
  { id: 'at_home', label: 'At Home' },
]

// 2025-2026 Holidays
const holidays = [
  { date: '2025-01-01', title: "New Year's Day", emoji: '🎉' },
  { date: '2025-01-20', title: 'Martin Luther King Jr. Day', emoji: '✊' },
  { date: '2025-02-14', title: "Valentine's Day", emoji: '💕' },
  { date: '2025-02-17', title: "Presidents' Day", emoji: '🇺🇸' },
  { date: '2025-03-17', title: "St. Patrick's Day", emoji: '☘️' },
  { date: '2025-03-30', title: 'Ramadan Begins (approx)', emoji: '🌙' },
  { date: '2025-04-20', title: 'Easter', emoji: '🐣' },
  { date: '2025-04-29', title: 'Eid al-Fitr (approx)', emoji: '🌙' },
  { date: '2025-05-11', title: "Mother's Day", emoji: '💐' },
  { date: '2025-05-26', title: 'Memorial Day', emoji: '🇺🇸' },
  { date: '2025-06-15', title: "Father's Day", emoji: '👔' },
  { date: '2025-06-19', title: 'Juneteenth', emoji: '✊' },
  { date: '2025-07-04', title: 'Independence Day', emoji: '🎆' },
  { date: '2025-07-06', title: 'Eid al-Adha (approx)', emoji: '🐑' },
  { date: '2025-09-01', title: 'Labor Day', emoji: '👷' },
  { date: '2025-10-13', title: 'Columbus Day', emoji: '⛵' },
  { date: '2025-10-31', title: 'Halloween', emoji: '🎃' },
  { date: '2025-11-11', title: "Veterans Day", emoji: '🎖️' },
  { date: '2025-11-27', title: 'Thanksgiving', emoji: '🦃' },
  { date: '2025-12-25', title: 'Christmas', emoji: '🎄' },
  { date: '2025-12-31', title: "New Year's Eve", emoji: '🥳' },
  { date: '2026-01-01', title: "New Year's Day", emoji: '🎉' },
  { date: '2026-02-14', title: "Valentine's Day", emoji: '💕' },
  { date: '2026-03-19', title: 'Ramadan Begins (approx)', emoji: '🌙' },
  { date: '2026-04-05', title: 'Easter', emoji: '🐣' },
  { date: '2026-04-18', title: 'Eid al-Fitr (approx)', emoji: '🌙' },
]

export default function PlansPage() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('dates')
  const [dateIdeas, setDateIdeas] = useState([])
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState(null)
  const [showAddDate, setShowAddDate] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [editingIdea, setEditingIdea] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [filter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [ideas, eventsData] = await Promise.all([
        getDateIdeas(filter ? { status: filter } : {}),
        getCalendarEvents(
          new Date().toISOString().split('T')[0],
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        )
      ])
      setDateIdeas(ideas || [])
      setEvents(eventsData || [])
    } catch (error) {
      console.error('Error:', error)
    }
    setLoading(false)
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateDateIdea(id, { 
        status: newStatus,
        completed_on: newStatus === 'done' ? new Date().toISOString().split('T')[0] : null
      })
      setDateIdeas(prev => prev.map(idea => 
        idea.id === id ? { ...idea, status: newStatus } : idea
      ))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAddIdea = async (idea) => {
    try {
      const newIdea = await addDateIdea({ ...idea, added_by: user.role })
      setDateIdeas(prev => [newIdea, ...prev])
      setShowAddDate(false)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleEditIdea = async (updatedIdea) => {
    try {
      await updateDateIdea(editingIdea.id, updatedIdea)
      setDateIdeas(prev => prev.map(i => 
        i.id === editingIdea.id ? { ...i, ...updatedIdea } : i
      ))
      setEditingIdea(null)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAddEvent = async (event) => {
    try {
      const newEvent = await addCalendarEvent({ ...event, added_by: user.role })
      setEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.start_date) - new Date(b.start_date)))
      setShowAddEvent(false)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteIdea = async (id) => {
    if (!confirm('Delete this date idea?')) return
    try {
      await deleteDateIdea(id)
      setDateIdeas(prev => prev.filter(i => i.id !== id))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteEvent = async (id) => {
    if (!confirm('Delete this event?')) return
    try {
      await deleteCalendarEvent(id)
      setEvents(prev => prev.filter(e => e.id !== id))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getVibeStyle = (vibe) => {
    const styles = {
      romantic: 'bg-rose-100 text-rose-600',
      casual: 'bg-cream-300 text-ink-600',
      adventure: 'bg-gold-100 text-gold-700',
      cozy: 'bg-forest-50 text-forest-600',
      fancy: 'bg-gold-200 text-gold-800',
    }
    return styles[vibe] || 'bg-cream-200 text-ink-500'
  }

  // Get upcoming holidays
  const upcomingHolidays = holidays
    .filter(h => new Date(h.date) >= new Date())
    .slice(0, 5)

  // Combine events with holidays for calendar view
  const allEvents = [
    ...events.map(e => ({ ...e, isHoliday: false })),
    ...holidays.map(h => ({ 
      id: `holiday-${h.date}`, 
      title: h.title, 
      start_date: h.date,
      emoji: h.emoji,
      isHoliday: true 
    }))
  ].sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
    .filter(e => new Date(e.start_date) >= new Date(new Date().setHours(0,0,0,0)))

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="bg-gold-100 px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-display-sm text-forest mb-2">Plans</h1>
          <p className="text-body text-forest-600">Our adventures together</p>
        </div>
      </div>

      {/* Tabs - Date Ideas First */}
      <div className="bg-cream px-6 py-4 sticky top-0 z-20 border-b border-cream-300">
        <div className="max-w-lg mx-auto flex justify-center gap-2">
          {[
            { id: 'dates', label: 'Date Ideas' },
            { id: 'calendar', label: 'Calendar' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`
                px-6 py-3 rounded-full text-body-sm font-medium transition-all
                ${activeSection === tab.id 
                  ? 'bg-forest text-cream-100' 
                  : 'bg-cream-200 text-ink-500 hover:bg-cream-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-cream min-h-[60vh]">
        {/* Date Ideas */}
        {activeSection === 'dates' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              {/* Filters */}
              <div className="flex justify-center gap-2 mb-6 flex-wrap">
                {[
                  { id: null, label: 'All' },
                  { id: 'want_to_do', label: 'Want' },
                  { id: 'planned', label: 'Planned' },
                  { id: 'done', label: 'Complete' },
                ].map((f) => (
                  <button
                    key={f.id || 'all'}
                    onClick={() => setFilter(f.id)}
                    className={`px-4 py-2 rounded-full text-body-sm font-medium transition-all ${
                      filter === f.id ? 'bg-forest text-cream-100' : 'bg-cream-200 text-ink-500 hover:bg-cream-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Add Button */}
              <button 
                onClick={() => setShowAddDate(true)}
                className="w-full mb-6 py-5 border-2 border-dashed border-gold-300 rounded-2xl text-gold-600 hover:border-gold-400 hover:bg-gold-50 transition-all font-medium"
              >
                + Add date idea
              </button>

              {/* Ideas */}
              {loading ? (
                <p className="text-center py-12 text-ink-400">Loading...</p>
              ) : dateIdeas.length > 0 ? (
                <div className="space-y-4">
                  {dateIdeas.map((idea) => (
                    <div key={idea.id} className="bg-white rounded-3xl p-6 shadow-card relative group">
                      {/* Edit & Delete - show on hover */}
                      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setEditingIdea(idea)}
                          className="w-8 h-8 bg-cream-200 rounded-full flex items-center justify-center text-ink-500 hover:bg-cream-300"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteIdea(idea.id)}
                          className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center text-rose-500 hover:bg-rose-200"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-serif text-title-sm text-forest">{idea.name}</h3>
                          <p className="text-caption text-ink-300 mt-1">
                            Added by {idea.added_by === 'shah' ? 'Shahjahan' : 'Dane'}
                          </p>
                        </div>
                        <span className="text-body font-semibold text-gold-600">
                          {'$'.repeat(idea.price_level || 1)}
                        </span>
                      </div>

                      {idea.description && (
                        <p className="text-body text-ink-500 mb-4">{idea.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        {idea.vibe && <span className={`tag ${getVibeStyle(idea.vibe)}`}>{idea.vibe}</span>}
                        {idea.date_type && <span className="tag tag-forest">{idea.date_type.replace('_', ' ')}</span>}
                      </div>

                      {idea.location && (
                        <p className="text-body-sm text-ink-400 mb-4">📍 {idea.location}</p>
                      )}

                      {/* Status Buttons */}
                      <div className="flex gap-2 pt-4 border-t border-cream-200">
                        {[
                          { id: 'want_to_do', label: 'Want' },
                          { id: 'planned', label: 'Planned' },
                          { id: 'done', label: 'Complete' },
                        ].map((status) => (
                          <button
                            key={status.id}
                            onClick={() => handleStatusUpdate(idea.id, status.id)}
                            className={`
                              flex-1 py-3 rounded-xl text-body-sm font-medium transition-all
                              ${idea.status === status.id 
                                ? 'bg-forest text-cream-100' 
                                : 'bg-cream-100 text-ink-400 hover:bg-cream-200'
                              }
                            `}
                          >
                            {status.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <span className="text-5xl mb-4 block">💡</span>
                  <p className="text-body text-ink-400">No date ideas yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calendar */}
        {activeSection === 'calendar' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              <button 
                onClick={() => setShowAddEvent(true)}
                className="w-full mb-6 py-5 border-2 border-dashed border-forest-300 rounded-2xl text-forest hover:border-forest-400 hover:bg-forest-50 transition-all font-medium"
              >
                + Add event
              </button>

              {/* Upcoming Holidays */}
              <div className="mb-8">
                <p className="section-label mb-4">Upcoming Holidays</p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {upcomingHolidays.map((h) => (
                    <div key={h.date} className="flex-shrink-0 bg-rose-50 rounded-2xl p-4 min-w-[140px] text-center">
                      <span className="text-2xl block mb-2">{h.emoji}</span>
                      <p className="text-body-sm font-medium text-forest">{h.title}</p>
                      <p className="text-caption text-ink-400">
                        {new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Events List */}
              <p className="section-label mb-4">Upcoming Events</p>
              {allEvents.length > 0 ? (
                <div className="space-y-4">
                  {allEvents.slice(0, 20).map((event) => {
                    const isMultiDay = event.end_date && event.end_date !== event.start_date
                    return (
                      <div 
                        key={event.id} 
                        className={`rounded-2xl p-5 relative group ${
                          event.isHoliday ? 'bg-rose-50' : 'bg-white shadow-card'
                        }`}
                      >
                        {!event.isHoliday && (
                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="absolute top-3 right-3 w-7 h-7 bg-rose-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:bg-rose-200"
                          >
                            ×
                          </button>
                        )}

                        <div className="flex items-start gap-4">
                          <div className="text-center min-w-[50px]">
                            <p className="text-caption text-ink-400 uppercase">
                              {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                            </p>
                            <p className="font-serif text-title text-forest">
                              {new Date(event.start_date).getDate()}
                            </p>
                            {isMultiDay && (
                              <>
                                <p className="text-caption text-ink-300">to</p>
                                <p className="font-serif text-body text-forest">
                                  {new Date(event.end_date).getDate()}
                                </p>
                              </>
                            )}
                          </div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {event.emoji && <span>{event.emoji}</span>}
                              <h3 className="font-serif text-title-sm text-forest">{event.title}</h3>
                            </div>
                            {event.start_time && (
                              <p className="text-body-sm text-gold-600 mt-1">
                                🕐 {event.start_time}
                              </p>
                            )}
                            <div className="flex flex-wrap gap-2 mt-2 text-body-sm text-ink-400">
                              {event.location && <span>📍 {event.location}</span>}
                            </div>
                            {!event.isHoliday && event.added_by && (
                              <p className="text-caption text-ink-300 mt-2">
                                By {event.added_by === 'shah' ? 'Shahjahan' : 'Dane'}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <span className="text-5xl mb-4 block">📅</span>
                  <p className="text-body text-ink-400">No upcoming events</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Date Idea Modal */}
      {showAddDate && (
        <AddDateModal onClose={() => setShowAddDate(false)} onAdd={handleAddIdea} />
      )}

      {/* Edit Date Idea Modal */}
      {editingIdea && (
        <EditDateModal idea={editingIdea} onClose={() => setEditingIdea(null)} onSave={handleEditIdea} />
      )}

      {/* Add Event Modal */}
      {showAddEvent && (
        <AddEventModal onClose={() => setShowAddEvent(false)} onAdd={handleAddEvent} />
      )}
    </div>
  )
}

function AddDateModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    name: '',
    description: '',
    vibe: 'casual',
    price_level: 2,
    date_type: 'dinner',
    location: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    await onAdd(form)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream w-full max-w-md rounded-3xl shadow-elevated overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 bg-gold-100">
          <h2 className="font-serif text-title text-forest">Add Date Idea</h2>
          <button onClick={onClose} className="p-2 text-forest hover:text-forest-700 rounded-full hover:bg-gold-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-5">
          <form id="date-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="input" placeholder="Sunset picnic..." required />
            </div>
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="input min-h-[60px] resize-none" placeholder="What makes this special?" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-body-sm font-medium text-ink-600 block mb-1">Vibe</label>
                <select value={form.vibe} onChange={(e) => setForm(p => ({ ...p, vibe: e.target.value }))} className="input">
                  {vibes.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-body-sm font-medium text-ink-600 block mb-1">Price</label>
                <select value={form.price_level} onChange={(e) => setForm(p => ({ ...p, price_level: parseInt(e.target.value) }))} className="input">
                  <option value={1}>$ Free</option>
                  <option value={2}>$$ Moderate</option>
                  <option value={3}>$$$ Pricey</option>
                  <option value={4}>$$$$ Splurge</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Type</label>
              <select value={form.date_type} onChange={(e) => setForm(p => ({ ...p, date_type: e.target.value }))} className="input">
                {dateTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} className="input" placeholder="Where?" />
            </div>
          </form>
        </div>

        <div className="p-5 bg-cream border-t border-cream-300">
          <button type="submit" form="date-form" className="w-full py-4 bg-forest text-cream-100 rounded-2xl font-semibold text-lg" disabled={loading}>
            {loading ? 'Adding...' : '✨ Add Date Idea'}
          </button>
        </div>
      </div>
    </div>
  )
}

function EditDateModal({ idea, onClose, onSave }) {
  const [form, setForm] = useState({
    name: idea.name || '',
    description: idea.description || '',
    vibe: idea.vibe || 'casual',
    price_level: idea.price_level || 2,
    date_type: idea.date_type || 'dinner',
    location: idea.location || '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    await onSave(form)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream w-full max-w-md rounded-3xl shadow-elevated overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 bg-gold-100">
          <h2 className="font-serif text-title text-forest">Edit Date Idea</h2>
          <button onClick={onClose} className="p-2 text-forest rounded-full hover:bg-gold-200">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-5">
          <form id="edit-date-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="input" required />
            </div>
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="input min-h-[60px] resize-none" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-body-sm font-medium text-ink-600 block mb-1">Vibe</label>
                <select value={form.vibe} onChange={(e) => setForm(p => ({ ...p, vibe: e.target.value }))} className="input">
                  {vibes.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-body-sm font-medium text-ink-600 block mb-1">Price</label>
                <select value={form.price_level} onChange={(e) => setForm(p => ({ ...p, price_level: parseInt(e.target.value) }))} className="input">
                  <option value={1}>$ Free</option>
                  <option value={2}>$$ Moderate</option>
                  <option value={3}>$$$ Pricey</option>
                  <option value={4}>$$$$ Splurge</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} className="input" />
            </div>
          </form>
        </div>

        <div className="p-5 bg-cream border-t border-cream-300">
          <button type="submit" form="edit-date-form" className="w-full py-4 bg-forest text-cream-100 rounded-2xl font-semibold text-lg" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddEventModal({ onClose, onAdd }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    event_type: 'date',
    start_date: '',
    end_date: '',
    start_time: '',
    location: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.start_date) return
    setLoading(true)
    await onAdd({
      ...form,
      end_date: form.end_date || form.start_date
    })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-forest-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream w-full max-w-md rounded-3xl shadow-elevated overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 bg-forest">
          <h2 className="font-serif text-title text-cream-100">Add Event</h2>
          <button onClick={onClose} className="p-2 text-cream-200 hover:text-cream-100 rounded-full hover:bg-forest-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-5">
          <form id="event-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Title *</label>
              <input type="text" value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} className="input" placeholder="Dinner at..." required />
            </div>

            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Type</label>
              <select value={form.event_type} onChange={(e) => setForm(p => ({ ...p, event_type: e.target.value }))} className="input">
                <option value="date">Date</option>
                <option value="trip">Trip</option>
                <option value="anniversary">Anniversary</option>
                <option value="reminder">Reminder</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-body-sm font-medium text-ink-600 block mb-1">Start Date *</label>
                <input type="date" value={form.start_date} onChange={(e) => setForm(p => ({ ...p, start_date: e.target.value }))} className="input" required />
              </div>
              <div>
                <label className="text-body-sm font-medium text-ink-600 block mb-1">End Date</label>
                <input type="date" value={form.end_date} onChange={(e) => setForm(p => ({ ...p, end_date: e.target.value }))} className="input" placeholder="Multi-day?" />
              </div>
            </div>

            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">⏰ Time (optional)</label>
              <input type="time" value={form.start_time} onChange={(e) => setForm(p => ({ ...p, start_time: e.target.value }))} className="input" />
            </div>

            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))} className="input" placeholder="Where?" />
            </div>

            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} className="input min-h-[60px] resize-none" placeholder="Details..." />
            </div>
          </form>
        </div>

        <div className="p-5 bg-cream border-t border-cream-300">
          <button type="submit" form="event-form" className="w-full py-4 bg-forest text-cream-100 rounded-2xl font-semibold text-lg" disabled={loading}>
            {loading ? 'Adding...' : '📅 Add Event'}
          </button>
        </div>
      </div>
    </div>
  )
}
