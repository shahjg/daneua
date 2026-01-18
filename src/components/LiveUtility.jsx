import { useState, useEffect } from 'react'
import { getTodos, toggleTodo, getCalendarEvents, subscribeToTodos } from '../lib/supabase'

export default function LiveUtility() {
  const [todos, setTodos] = useState([])
  const [events, setEvents] = useState([])
  const [activeSection, setActiveSection] = useState('todos')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        // Get todos
        const todoData = await getTodos()
        setTodos(todoData || [])

        // Get calendar events for next 30 days
        const today = new Date().toISOString().split('T')[0]
        const thirtyDays = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        const eventData = await getCalendarEvents(today, thirtyDays)
        setEvents(eventData || [])
      } catch (error) {
        console.error('Error fetching data:', error)
      }
      setLoading(false)
    }

    fetchData()

    // Subscribe to real-time todo updates
    const subscription = subscribeToTodos(() => {
      getTodos().then(data => setTodos(data || []))
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleToggleTodo = async (id, currentState) => {
    try {
      await toggleTodo(id, !currentState)
      // Optimistic update
      setTodos(prev => 
        prev.map(todo => 
          todo.id === id ? { ...todo, is_completed: !currentState } : todo
        )
      )
    } catch (error) {
      console.error('Error toggling todo:', error)
    }
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const date = new Date()
    date.setHours(parseInt(hours), parseInt(minutes))
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-heart-500 bg-heart-50'
      case 'high': return 'border-l-blush-400 bg-blush-50'
      case 'normal': return 'border-l-evergreen-400 bg-white'
      case 'low': return 'border-l-evergreen-200 bg-ivory-100'
      default: return 'border-l-evergreen-300 bg-white'
    }
  }

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'workout': return '💪'
      case 'travel': return '✈️'
      case 'date': return '💕'
      case 'reminder': return '⏰'
      case 'special': return '⭐'
      default: return '📅'
    }
  }

  const getEventColor = (type) => {
    switch (type) {
      case 'workout': return 'bg-evergreen-100 border-evergreen-400'
      case 'travel': return 'bg-blush-100 border-blush-400'
      case 'date': return 'bg-heart-100 border-heart-400'
      case 'special': return 'bg-ivory-300 border-evergreen-500'
      default: return 'bg-ivory-200 border-evergreen-300'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-evergreen animate-pulse-soft">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section Toggle */}
      <div className="flex bg-evergreen-100 rounded-xl p-1">
        <button
          onClick={() => setActiveSection('todos')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            activeSection === 'todos'
              ? 'bg-evergreen text-ivory shadow-soft'
              : 'text-evergreen-600 hover:text-evergreen-800'
          }`}
        >
          ✓ To-Dos
        </button>
        <button
          onClick={() => setActiveSection('calendar')}
          className={`flex-1 py-3 rounded-lg font-medium transition-all ${
            activeSection === 'calendar'
              ? 'bg-evergreen text-ivory shadow-soft'
              : 'text-evergreen-600 hover:text-evergreen-800'
          }`}
        >
          📅 Calendar
        </button>
      </div>

      {/* To-Do List */}
      {activeSection === 'todos' && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl text-evergreen-800">
              Reminders from Shah
            </h2>
            <span className="text-sm text-evergreen-500">
              {todos.filter(t => !t.is_completed).length} remaining
            </span>
          </div>

          {todos.length === 0 ? (
            <div className="text-center py-12 text-evergreen-400">
              <p className="text-4xl mb-4">✨</p>
              <p>No tasks right now. Enjoy your day!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todos.map((todo, index) => (
                <div
                  key={todo.id}
                  className={`
                    ${getPriorityColor(todo.priority)}
                    border-l-4 rounded-xl p-4 shadow-soft
                    transition-all duration-200
                    animate-slide-up
                    ${todo.is_completed ? 'opacity-60' : ''}
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleTodo(todo.id, todo.is_completed)}
                      className={`
                        w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5
                        transition-all duration-200
                        ${todo.is_completed 
                          ? 'bg-evergreen border-evergreen text-ivory' 
                          : 'border-evergreen-300 hover:border-evergreen-500'
                        }
                      `}
                    >
                      {todo.is_completed && (
                        <svg className="w-full h-full p-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className={`font-medium text-evergreen-800 ${
                        todo.is_completed ? 'line-through text-evergreen-500' : ''
                      }`}>
                        {todo.title}
                      </h3>
                      {todo.description && (
                        <p className="text-sm text-evergreen-500 mt-1">
                          {todo.description}
                        </p>
                      )}
                      {todo.due_date && (
                        <p className="text-xs text-evergreen-400 mt-2">
                          📅 {formatDate(todo.due_date)}
                          {todo.due_time && ` at ${formatTime(todo.due_time)}`}
                        </p>
                      )}
                    </div>

                    {/* Priority Badge */}
                    {todo.priority === 'urgent' && (
                      <span className="text-xs bg-heart-500 text-white px-2 py-1 rounded-full">
                        Urgent
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Calendar */}
      {activeSection === 'calendar' && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="font-display text-xl text-evergreen-800">
            Upcoming Events
          </h2>

          {events.length === 0 ? (
            <div className="text-center py-12 text-evergreen-400">
              <p className="text-4xl mb-4">📅</p>
              <p>No upcoming events</p>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className={`
                    ${getEventColor(event.event_type)}
                    border-l-4 rounded-xl p-4 shadow-soft
                    animate-slide-up
                  `}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <span className="text-2xl flex-shrink-0">
                      {getEventTypeIcon(event.event_type)}
                    </span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-evergreen-800">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-sm text-evergreen-500 mt-1">
                          {event.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-evergreen-500">
                        <span>📅 {formatDate(event.start_date)}</span>
                        {event.start_time && (
                          <span>⏰ {formatTime(event.start_time)}</span>
                        )}
                        {event.location && (
                          <span>📍 {event.location}</span>
                        )}
                        {event.is_recurring && (
                          <span className="bg-evergreen-200 text-evergreen-700 px-2 py-0.5 rounded-full">
                            🔄 {event.recurrence_rule}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PPL Legend */}
          <div className="mt-6 p-4 bg-evergreen-50 rounded-xl">
            <h4 className="text-sm font-medium text-evergreen-700 mb-2">
              💪 Shah's PPL Split
            </h4>
            <div className="grid grid-cols-3 gap-2 text-xs text-evergreen-600">
              <div className="text-center p-2 bg-white rounded-lg">
                <div className="text-lg">🏋️</div>
                <div>Push</div>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <div className="text-lg">💪</div>
                <div>Pull</div>
              </div>
              <div className="text-center p-2 bg-white rounded-lg">
                <div className="text-lg">🦵</div>
                <div>Legs</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
