import { useState, useEffect } from 'react'
import { getGoals, addGoal, updateGoal, addMilestone, toggleMilestone } from '../lib/supabase'

export default function GoalsPage() {
  const [goals, setGoals] = useState([])
  const [filter, setFilter] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [expandedGoal, setExpandedGoal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoals()
  }, [filter])

  const fetchGoals = async () => {
    setLoading(true)
    try {
      const owner = filter === 'all' ? null : filter
      const data = await getGoals(owner)
      setGoals(data || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
    }
    setLoading(false)
  }

  const handleToggleMilestone = async (goalId, milestoneId, currentState) => {
    try {
      await toggleMilestone(milestoneId, !currentState)
      
      // Update local state
      setGoals(prev => prev.map(goal => {
        if (goal.id !== goalId) return goal
        
        const updatedMilestones = goal.milestones.map(m => 
          m.id === milestoneId ? { ...m, is_completed: !currentState } : m
        )
        
        // Calculate new progress
        const completed = updatedMilestones.filter(m => m.is_completed).length
        const total = updatedMilestones.length
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0
        
        return { ...goal, milestones: updatedMilestones, progress }
      }))
    } catch (error) {
      console.error('Error toggling milestone:', error)
    }
  }

  const handleCompleteGoal = async (goalId) => {
    try {
      await updateGoal(goalId, { status: 'completed', progress: 100 })
      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? { ...goal, status: 'completed', progress: 100 } : goal
      ))
    } catch (error) {
      console.error('Error completing goal:', error)
    }
  }

  return (
    <div className="px-6 pt-12 pb-8">
      {/* Header */}
      <header className="mb-8 animate-fade-up">
        <h1 className="font-serif text-3xl text-forest">Goals</h1>
        <p className="text-small text-ink-400 mt-1">Track what matters</p>
      </header>

      {/* Filters */}
      <div className="flex gap-2 mb-8 animate-fade-up" style={{ animationDelay: '0.05s' }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'dane', label: 'Mine' },
          { id: 'shah', label: "Shah's" },
          { id: 'shared', label: 'Shared' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id)}
            className={`
              px-4 py-2 rounded-full text-small font-medium transition-all duration-200
              ${filter === tab.id 
                ? 'bg-forest text-cream-100' 
                : 'bg-cream-200 text-ink-500 hover:bg-cream-300'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add Button */}
      <button 
        onClick={() => setShowAddForm(true)}
        className="w-full py-4 border-2 border-dashed border-cream-300 rounded-xl text-ink-400 hover:border-forest-200 hover:text-forest transition-colors mb-6 animate-fade-up"
        style={{ animationDelay: '0.1s' }}
      >
        + Add goal
      </button>

      {/* Goals List */}
      <div className="space-y-4">
        {goals.map((goal, index) => (
          <div 
            key={goal.id} 
            className={`card transition-all duration-200 ${goal.status === 'completed' ? 'opacity-60' : ''}`}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            {/* Header */}
            <div 
              className="flex items-start justify-between cursor-pointer"
              onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`tag ${
                    goal.owner === 'dane' ? 'tag-rose' : 
                    goal.owner === 'shah' ? 'tag-forest' : 'tag-gold'
                  }`}>
                    {goal.owner === 'dane' ? 'Mine' : goal.owner === 'shah' ? 'Shah' : 'Shared'}
                  </span>
                  {goal.status === 'completed' && (
                    <span className="tag tag-forest">Complete</span>
                  )}
                </div>
                <h3 className={`font-serif text-lg text-forest ${
                  goal.status === 'completed' ? 'line-through' : ''
                }`}>
                  {goal.title}
                </h3>
                {goal.description && (
                  <p className="text-small text-ink-400 mt-1">{goal.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-small font-medium text-forest">{goal.progress}%</span>
                <svg 
                  className={`w-5 h-5 text-ink-300 transition-transform ${
                    expandedGoal === goal.id ? 'rotate-180' : ''
                  }`} 
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar mt-4">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${goal.progress}%` }}
              />
            </div>

            {/* Expanded Content */}
            {expandedGoal === goal.id && (
              <div className="mt-6 pt-4 border-t border-cream-200 animate-fade-up">
                {/* Target Date */}
                {goal.target_date && (
                  <p className="text-small text-ink-400 mb-4">
                    Target: {new Date(goal.target_date).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                )}

                {/* Milestones */}
                {goal.milestones && goal.milestones.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-tiny text-ink-400 font-medium uppercase tracking-wider">Milestones</p>
                    {goal.milestones.map((milestone) => (
                      <div 
                        key={milestone.id}
                        className="flex items-center gap-3"
                      >
                        <button
                          onClick={() => handleToggleMilestone(goal.id, milestone.id, milestone.is_completed)}
                          className={`
                            w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all
                            ${milestone.is_completed 
                              ? 'bg-forest border-forest' 
                              : 'border-cream-400 hover:border-forest-300'
                            }
                          `}
                        >
                          {milestone.is_completed && (
                            <svg className="w-full h-full text-cream p-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                              <path d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                        <span className={`text-body ${
                          milestone.is_completed ? 'text-ink-400 line-through' : 'text-ink-600'
                        }`}>
                          {milestone.title}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Complete Button */}
                {goal.status !== 'completed' && (
                  <button 
                    onClick={() => handleCompleteGoal(goal.id)}
                    className="btn-secondary w-full mt-6"
                  >
                    Mark as Complete
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

        {goals.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-ink-400">No goals yet</p>
            <p className="text-small text-ink-300 mt-1">Add your first goal to get started</p>
          </div>
        )}
      </div>

      {/* Add Form Modal */}
      {showAddForm && (
        <AddGoalForm 
          onClose={() => setShowAddForm(false)}
          onAdd={(goal) => {
            setGoals(prev => [goal, ...prev])
            setShowAddForm(false)
          }}
        />
      )}
    </div>
  )
}

function AddGoalForm({ onClose, onAdd }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    owner: 'dane',
    target_date: '',
  })
  const [milestones, setMilestones] = useState([''])
  const [loading, setLoading] = useState(false)

  const handleAddMilestone = () => {
    setMilestones(prev => [...prev, ''])
  }

  const handleMilestoneChange = (index, value) => {
    setMilestones(prev => prev.map((m, i) => i === index ? value : m))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return

    setLoading(true)
    try {
      const goal = await addGoal({
        ...form,
        target_date: form.target_date || null,
      })

      // Add milestones
      const validMilestones = milestones.filter(m => m.trim())
      for (const title of validMilestones) {
        await addMilestone(goal.id, title)
      }

      // Fetch updated goal with milestones
      const updatedGoals = await getGoals()
      const newGoal = updatedGoals.find(g => g.id === goal.id)
      
      onAdd(newGoal)
    } catch (error) {
      console.error('Error adding goal:', error)
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
          <h2 className="font-serif text-xl text-forest">Add Goal</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-small font-medium text-ink-600 block mb-1">Goal</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="input"
              placeholder="What do you want to achieve?"
              required
            />
          </div>

          <div>
            <label className="text-small font-medium text-ink-600 block mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              className="input min-h-[80px] resize-none"
              placeholder="Why is this important?"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-small font-medium text-ink-600 block mb-1">Owner</label>
              <select
                value={form.owner}
                onChange={(e) => setForm(prev => ({ ...prev, owner: e.target.value }))}
                className="input"
              >
                <option value="dane">Mine</option>
                <option value="shah">Shah's</option>
                <option value="shared">Shared</option>
              </select>
            </div>

            <div>
              <label className="text-small font-medium text-ink-600 block mb-1">Target Date</label>
              <input
                type="date"
                value={form.target_date}
                onChange={(e) => setForm(prev => ({ ...prev, target_date: e.target.value }))}
                className="input"
              />
            </div>
          </div>

          {/* Milestones */}
          <div>
            <label className="text-small font-medium text-ink-600 block mb-2">Milestones (optional)</label>
            <div className="space-y-2">
              {milestones.map((milestone, index) => (
                <input
                  key={index}
                  type="text"
                  value={milestone}
                  onChange={(e) => handleMilestoneChange(index, e.target.value)}
                  className="input"
                  placeholder={`Step ${index + 1}`}
                />
              ))}
            </div>
            <button 
              type="button"
              onClick={handleAddMilestone}
              className="text-small text-forest font-medium mt-2 hover:text-forest-700"
            >
              + Add milestone
            </button>
          </div>

          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Adding...' : 'Add Goal'}
          </button>
        </form>
      </div>
    </div>
  )
}
