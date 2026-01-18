import { useState, useEffect } from 'react'
import { getCalendarEvents, getDateIdeas, addDateIdea, updateDateIdea } from '../lib/supabase'

const vibeColors = {
  romantic: 'bg-rose-100 text-rose-500',
  casual: 'bg-cream-300 text-ink-600',
  adventure: 'bg-gold-100 text-gold-700',
  cozy: 'bg-forest-50 text-forest-600',
  fancy: 'bg-gold-200 text-gold-800',
}

const priceLabels = ['$', '$$', '$$$', '$$$$']

export default function PlansPage() {
  const [activeSection, setActiveSection] = useState('dates')
  const [events, setEvents] = useState([])
  const [dateIdeas, setDateIdeas] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState({ status: null, vibe: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Get events for next 60 days
        const today = new Date().toISOString().split('T')[0]
        const sixtyDays = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        
        const [eventsData, ideasData] = await Promise.all([
          getCalendarEvents(today, sixtyDays),
          getDateIdeas(filter)
        ])
        
        setEvents(eventsData || [])
        setDateIdeas(ideasData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
      setLoading(false)
    }
    fetchData()
  }, [filter])

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateDateIdea(id, { 
        status: newStatus,
        completed_on: newStatus === 'done' ? new Date().toISOString().split('T')[0] : null
      })
      setDateIdeas(prev => prev.map(idea => 
        idea.id === id ? { ...idea, status: newStatus } : idea
      ))
    } catch (error) {
      console.error('Error updating status:', error)
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    })
  }

  return (
    <div className="px-6 pt-12 pb-8">
      {/* Header */}
      <header className="mb-8 animate-fade-up">
        <h1 className="font-serif text-3xl text-forest">Plans</h1>
        <p className="text-small text-ink-400 mt-1">Our adventures, past and future</p>
      </header>

      {/* Section Tabs */}
      <div className="flex gap-2 mb-8 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        {[
          { id: 'dates', label: 'Date Ideas' },
          { id: 'calendar', label: 'Calendar' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            className={`
              px-5 py-2.5 rounded-full text-small font-medium transition-all duration-200
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

      {/* Date Ideas Section */}
      {activeSection === 'dates' && (
        <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6">
            <FilterButton 
              label="All" 
              active={!filter.status} 
              onClick={() => setFilter(prev => ({ ...prev, status: null }))} 
            />
            <FilterButton 
              label="Want to do" 
              active={filter.status === 'want_to_do'} 
              onClick={() => setFilter(prev => ({ ...prev, status: 'want_to_do' }))} 
            />
            <FilterButton 
              label="Planned" 
              active={filter.status === 'planned'} 
              onClick={() => setFilter(prev => ({ ...prev, status: 'planned' }))} 
            />
            <FilterButton 
              label="Done" 
              active={filter.status === 'done'} 
              onClick={() => setFilter(prev => ({ ...prev, status: 'done' }))} 
            />
          </div>

          {/* Add Button */}
          <button 
            onClick={() => setShowAddForm(true)}
            className="w-full py-4 border-2 border-dashed border-cream-300 rounded-xl text-ink-400 hover:border-forest-200 hover:text-forest transition-colors mb-6"
          >
            + Add date idea
          </button>

          {/* Ideas List */}
          <div className="space-y-4">
            {dateIdeas.map((idea, index) => (
              <div 
                key={idea.id} 
                className="card"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-serif text-lg text-forest">{idea.name}</h3>
                    {idea.location && (
                      <p className="text-small text-ink-400">{idea.location}</p>
                    )}
                  </div>
                  <span className="text-small text-gold-600 font-medium">
                    {priceLabels[idea.price_level - 1]}
                  </span>
                </div>

                {idea.description && (
                  <p className="text-small text-ink-500 mb-3">{idea.description}</p>
                )}

                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className={`tag ${vibeColors[idea.vibe]}`}>
                    {idea.vibe}
                  </span>
                  <span className="tag tag-forest capitalize">
                    {idea.date_type.replace('_', ' ')}
                  </span>
                </div>

                {idea.notes && (
                  <p className="text-tiny text-ink-400 italic mb-4">"{idea.notes}"</p>
                )}

                {/* Status Actions */}
                <div className="flex gap-2 pt-3 border-t border-cream-200">
                  <StatusButton 
                    label="Want to do" 
                    active={idea.status === 'want_to_do'}
                    onClick={() => handleStatusChange(idea.id, 'want_to_do')}
                  />
                  <StatusButton 
                    label="Planned" 
                    active={idea.status === 'planned'}
                    onClick={() => handleStatusChange(idea.id, 'planned')}
                  />
                  <StatusButton 
                    label="Done" 
                    active={idea.status === 'done'}
                    onClick={() => handleStatusChange(idea.id, 'done')}
                  />
                </div>
              </div>
            ))}

            {dateIdeas.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-ink-400">No date ideas yet</p>
                <p className="text-small text-ink-300 mt-1">Start adding some!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar Section */}
      {activeSection === 'calendar' && (
        <div className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
          {events.length > 0 ? (
            <div className="space-y-4">
              {events.map((event, index) => (
                <div 
                  key={event.id} 
                  className="card flex items-start gap-4"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex-shrink-0 w-14 text-center">
                    <p className="text-tiny text-ink-400 uppercase">
                      {new Date(event.start_date).toLocaleDateString('en-US', { month: 'short' })}
                    </p>
                    <p className="font-serif text-2xl text-forest">
                      {new Date(event.start_date).getDate()}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-ink-600">{event.title}</h3>
                    {event.description && (
                      <p className="text-small text-ink-400 mt-1">{event.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-tiny text-ink-300">
                      {event.start_time && <span>{event.start_time}</span>}
                      {event.location && <span>{event.location}</span>}
                      {event.is_recurring && <span className="tag tag-forest">Recurring</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-ink-400">No upcoming events</p>
              <p className="text-small text-ink-300 mt-1">Add something to look forward to</p>
            </div>
          )}
        </div>
      )}

      {/* Add Form Modal */}
      {showAddForm && (
        <AddDateIdeaForm 
          onClose={() => setShowAddForm(false)}
          onAdd={(idea) => {
            setDateIdeas(prev => [idea, ...prev])
            setShowAddForm(false)
          }}
        />
      )}
    </div>
  )
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-tiny font-medium whitespace-nowrap transition-all
        ${active 
          ? 'bg-forest text-cream-100' 
          : 'bg-cream-200 text-ink-500 hover:bg-cream-300'
        }
      `}
    >
      {label}
    </button>
  )
}

function StatusButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 py-2 rounded-lg text-tiny font-medium transition-all
        ${active 
          ? 'bg-forest text-cream-100' 
          : 'bg-cream-100 text-ink-400 hover:bg-cream-200'
        }
      `}
    >
      {label}
    </button>
  )
}

function AddDateIdeaForm({ onClose, onAdd }) {
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
    try {
      const idea = await addDateIdea(form)
      onAdd(idea)
    } catch (error) {
      console.error('Error adding idea:', error)
    }
    setLoading(false)
  }

  return (
    <div 
      className="fixed inset-0 bg-forest-900/40 backdrop-blur-sm z-50 flex items-end justify-center animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-cream rounded-t-3xl p-6 w-full max-w-lg max-h-[85vh] overflow-y-auto animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-xl text-forest">Add Date Idea</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-small font-medium text-ink-600 block mb-1">Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              className="input"
              placeholder="e.g., Sunset picnic at the park"
              required
            />
          </div>

          <div>
            <label className="text-small font-medium text-ink-600 block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="input min-h-[80px] resize-none"
              placeholder="What makes this special?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-small font-medium text-ink-600 block mb-1">Vibe</label>
              <select
                value={form.vibe}
                onChange={(e) => setForm(prev => ({ ...prev, vibe: e.target.value }))}
                className="input"
              >
                <option value="romantic">Romantic</option>
                <option value="casual">Casual</option>
                <option value="adventure">Adventure</option>
                <option value="cozy">Cozy</option>
                <option value="fancy">Fancy</option>
              </select>
            </div>

            <div>
              <label className="text-small font-medium text-ink-600 block mb-1">Price</label>
              <select
                value={form.price_level}
                onChange={(e) => setForm(prev => ({ ...prev, price_level: parseInt(e.target.value) }))}
                className="input"
              >
                <option value={1}>$ - Budget</option>
                <option value={2}>$$ - Moderate</option>
                <option value={3}>$$$ - Pricey</option>
                <option value={4}>$$$$ - Splurge</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-small font-medium text-ink-600 block mb-1">Type</label>
            <select
              value={form.date_type}
              onChange={(e) => setForm(prev => ({ ...prev, date_type: e.target.value }))}
              className="input"
            >
              <option value="dinner">Dinner</option>
              <option value="lunch">Lunch</option>
              <option value="cafe">Cafe</option>
              <option value="activity">Activity</option>
              <option value="day_trip">Day Trip</option>
              <option value="at_home">At Home</option>
            </select>
          </div>

          <div>
            <label className="text-small font-medium text-ink-600 block mb-1">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm(prev => ({ ...prev, location: e.target.value }))}
              className="input"
              placeholder="Address or area"
            />
          </div>

          <div>
            <label className="text-small font-medium text-ink-600 block mb-1">Notes</label>
            <input
              type="text"
              value={form.notes}
              onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
              className="input"
              placeholder="e.g., Make reservation first"
            />
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add Idea'}
          </button>
        </form>
      </div>
    </div>
  )
}
