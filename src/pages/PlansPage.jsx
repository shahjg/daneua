import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getDateIdeas,
  addDateIdea,
  updateDateIdea,
  getCalendarEvents,
  addCalendarEvent
} from '../lib/supabase'

const vibes = [
  { id: 'romantic', label: 'Romantic', color: 'bg-rose-100 text-rose-600' },
  { id: 'casual', label: 'Casual', color: 'bg-cream-300 text-ink-600' },
  { id: 'adventure', label: 'Adventure', color: 'bg-gold-100 text-gold-700' },
  { id: 'cozy', label: 'Cozy', color: 'bg-forest-50 text-forest-600' },
  { id: 'fancy', label: 'Fancy', color: 'bg-gold-200 text-gold-800' },
]

const dateTypes = [
  { id: 'dinner', label: 'Dinner' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'cafe', label: 'Cafe' },
  { id: 'activity', label: 'Activity' },
  { id: 'day_trip', label: 'Day Trip' },
  { id: 'at_home', label: 'At Home' },
]

export default function PlansPage() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('dates')
  const [dateIdeas, setDateIdeas] = useState([])
  const [events, setEvents] = useState([])
  const [filter, setFilter] = useState(null)
  const [showAddDate, setShowAddDate] = useState(false)
  const [showAddEvent, setShowAddEvent] = useState(false)
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
          new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
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

  const handleAddEvent = async (event) => {
    try {
      const newEvent = await addCalendarEvent({ ...event, added_by: user.role })
      setEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.start_date) - new Date(b.start_date)))
      setShowAddEvent(false)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getVibeStyle = (vibe) => vibes.find(v => v.id === vibe)?.color || 'bg-cream-200 text-ink-500'

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="bg-gold-100 px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-display-sm text-forest mb-2">Plans</h1>
          <p className="text-body text-forest-600">Our adventures together</p>
        </div>
      </div>

      {/* Tabs */}
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
                <FilterPill label="All" active={!filter} onClick={() => setFilter(null)} />
                <FilterPill label="Want to do" active={filter === 'want_to_do'} onClick={() => setFilter('want_to_do')} />
                <FilterPill label="Planned" active={filter === 'planned'} onClick={() => setFilter('planned')} />
                <FilterPill label="Complete" active={filter === 'done'} onClick={() => setFilter('done')} />
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
                    <div key={idea.id} className="bg-white rounded-3xl p-6 shadow-card">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-serif text-title-sm text-forest">{idea.name}</h3>
                          <p className="text-caption text-ink-300 mt-1">
                            Added by {idea.added_by === 'shah' ? 'Shahjahan' : 'Dane'}
                          </p>
                        </div>
                        <span className="text-body font-semibold text-gold-600">
                          {'$'.repeat(idea.price_level)}
                        </span>
                      </div>

                      {idea.description && (
                        <p className="text-body text-ink-500 mb-4">{idea.description}</p>
                      )}

                      <div className="flex flex-wrap gap-2 mb-4">
                        <span className={`tag ${getVibeStyle(idea.vibe)}`}>{idea.vibe}</span>
                        <span className="tag tag-forest">{idea.date_type.replace('_', ' ')}</span>
                      </div>

                      {idea.location && (
                        <p className="text-body-sm text-ink-400 mb-4">📍 {idea.location}</p>
                      )}

                      {idea.notes && (
                        <p className="text-body-sm text-ink-400 italic mb-4">"{idea.notes}"</p>
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
                  <p className="text-body-sm text-ink-300 mt-1">Add your first one!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Calendar */}
        {activeSection === 'calendar' && (
          <div className="px-6 py-8">
            <div className="max-w-lg mx-auto">
              {/* Add Event Button */}
              <button 
                onClick={() => setShowAddEvent(true)}
                className="w-full mb-6 py-5 border-2 border-dashed border-forest-300 rounded-2xl text-forest hover:border-forest-400 hover:bg-forest-50 transition-all font-medium"
              >
                + Add event
              </button>

              {/* Events */}
              {events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="bg-white rounded-2xl p-5 shadow-soft flex items-start gap-4">
                      <div className="flex-shrink-0 w-16 text-center py-2 bg-forest-50 rounded-xl">
                        <p className="text-caption text-forest-600">
                          {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                        <p className="font-serif text-title text-forest">
                          {new Date(event.start_date).getDate()}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-title-sm text-forest">{event.title}</h3>
                        {event.description && (
                          <p className="text-body-sm text-ink-400 mt-1">{event.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 mt-2 text-caption text-ink-300">
                          {event.start_time && <span>🕐 {event.start_time}</span>}
                          {event.location && <span>📍 {event.location}</span>}
                        </div>
                        <p className="text-caption text-ink-300 mt-2">
                          By {event.added_by === 'shah' ? 'Shahjahan' : 'Dane'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <span className="text-5xl mb-4 block">📅</span>
                  <p className="text-body text-ink-400">No upcoming events</p>
                  <p className="text-body-sm text-ink-300 mt-1">Add something to look forward to</p>
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

      {/* Add Event Modal */}
      {showAddEvent && (
        <AddEventModal onClose={() => setShowAddEvent(false)} onAdd={handleAddEvent} />
      )}
    </div>
  )
}

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-body-sm font-medium transition-all
        ${active ? 'bg-forest text-cream-100' : 'bg-cream-200 text-ink-500 hover:bg-cream-300'}
      `}
    >
      {label}
    </button>
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
    notes: '',
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
    <div className="fixed inset-0 bg-forest-900/50 backdrop-blur-sm z-50 flex items-end" onClick={onClose}>
      <div 
        className="bg-cream w-full rounded-t-[2rem] p-6 pb-10 overflow-y-auto"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-title text-forest">Add Date Idea</h2>
          <button onClick={onClose} className="p-2 text-ink-400 hover:text-ink-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-body-sm font-medium text-ink-600 block mb-2">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              className="input"
              placeholder="Sunset picnic at the park"
              required
            />
          </div>

          <div>
            <label className="text-body-sm font-medium text-ink-600 block mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              className="input min-h-[80px] resize-none"
              placeholder="What makes this special?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-2">Vibe</label>
              <select
                value={form.vibe}
                onChange={(e) => setForm(p => ({ ...p, vibe: e.target.value }))}
                className="input"
              >
                {vibes.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-2">Price</label>
              <select
                value={form.price_level}
                onChange={(e) => setForm(p => ({ ...p, price_level: parseInt(e.target.value) }))}
                className="input"
              >
                <option value={1}>$ Free/Cheap</option>
                <option value={2}>$$ Moderate</option>
                <option value={3}>$$$ Pricey</option>
                <option value={4}>$$$$ Splurge</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-body-sm font-medium text-ink-600 block mb-2">Type</label>
            <select
              value={form.date_type}
              onChange={(e) => setForm(p => ({ ...p, date_type: e.target.value }))}
              className="input"
            >
              {dateTypes.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="text-body-sm font-medium text-ink-600 block mb-2">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))}
              className="input"
              placeholder="Where?"
            />
          </div>

          <div>
            <label className="text-body-sm font-medium text-ink-600 block mb-2">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm(p => ({ ...p, notes: e.target.value }))}
              className="input"
              placeholder="Make reservation, bring blanket..."
            />
          </div>

          <div className="pt-4">
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Adding...' : 'Add Date Idea'}
            </button>
          </div>
        </form>
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
    start_time: '',
    location: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.start_date) return
    setLoading(true)
    await onAdd(form)
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-forest-900/50 backdrop-blur-sm z-50 flex items-end" onClick={onClose}>
      <div 
        className="bg-cream w-full rounded-t-[2rem] p-6 pb-10 overflow-y-auto"
        style={{ maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-title text-forest">Add Event</h2>
          <button onClick={onClose} className="p-2 text-ink-400 hover:text-ink-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-body-sm font-medium text-ink-600 block mb-2">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
              className="input"
              placeholder="Dinner at..."
              required
            />
          </div>

          <div>
            <label className="text-body-sm font-medium text-ink-600 block mb-2">Type</label>
            <select
              value={form.event_type}
              onChange={(e) => setForm(p => ({ ...p, event_type: e.target.value }))}
              className="input"
            >
              <option value="date">Date</option>
              <option value="trip">Trip</option>
              <option value="anniversary">Anniversary</option>
              <option value="reminder">Reminder</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-2">Date *</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm(p => ({ ...p, start_date: e.target.value }))}
                className="input"
                required
              />
            </div>

            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-2">Time</label>
              <input
                type="time"
                value={form.start_time}
                onChange={(e) => setForm(p => ({ ...p, start_time: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="text-body-sm font-medium text-ink-600 block mb-2">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm(p => ({ ...p, location: e.target.value }))}
              className="input"
              placeholder="Where?"
            />
          </div>

          <div>
            <label className="text-body-sm font-medium text-ink-600 block mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
              className="input min-h-[80px] resize-none"
              placeholder="Details..."
            />
          </div>

          <div className="pt-4">
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Adding...' : 'Add Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
