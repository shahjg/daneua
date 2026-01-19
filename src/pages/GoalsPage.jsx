import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import {
  getGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  addMilestone,
  toggleMilestone
} from '../lib/supabase'

export default function GoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [filter, setFilter] = useState('all')
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [expandedGoal, setExpandedGoal] = useState(null)
  const [celebrateGoal, setCelebrateGoal] = useState(null)
  const [loading, setLoading] = useState(true)

  const theirName = user?.role === 'shah' ? 'Dane' : 'Shahjahan'

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
      console.error('Error:', error)
    }
    setLoading(false)
  }

  const handleToggleMilestone = async (goalId, milestoneId, currentState) => {
    try {
      await toggleMilestone(milestoneId, !currentState)

      setGoals(prev => prev.map(goal => {
        if (goal.id !== goalId) return goal

        const updatedMilestones = goal.milestones.map(m =>
          m.id === milestoneId ? { ...m, is_completed: !currentState } : m
        )

        const completed = updatedMilestones.filter(m => m.is_completed).length
        const total = updatedMilestones.length
        const progress = total > 0 ? Math.round((completed / total) * 100) : 0

        return { ...goal, milestones: updatedMilestones, progress }
      }))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleCompleteGoal = async (goalId) => {
    try {
      await updateGoal(goalId, { status: 'completed', progress: 100 })
      setGoals(prev => prev.map(goal =>
        goal.id === goalId ? { ...goal, status: 'completed', progress: 100 } : goal
      ))
      setCelebrateGoal(goalId)
      setTimeout(() => setCelebrateGoal(null), 3000)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleDeleteGoal = async (goalId) => {
    if (!confirm('Delete this goal?')) return
    try {
      await deleteGoal(goalId)
      setGoals(prev => prev.filter(g => g.id !== goalId))
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleAddGoal = async (goalData, milestones) => {
    try {
      const newGoal = await addGoal({ ...goalData, owner: goalData.owner || user.role })

      for (const title of milestones.filter(m => m.trim())) {
        await addMilestone(newGoal.id, title)
      }

      await fetchGoals()
      setShowAddGoal(false)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const getOwnerLabel = (owner) => {
    if (owner === 'shared') return 'Shared'
    if (owner === user?.role) return 'Mine'
    return theirName
  }

  const getOwnerStyle = (owner) => {
    if (owner === 'shared') return 'tag-gold'
    if (owner === user?.role) return 'tag-forest'
    return 'tag-rose'
  }

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="bg-forest px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-display-sm text-cream-50 mb-2">Goals</h1>
          <p className="text-body text-cream-300">Track what matters most</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-cream px-6 py-4 sticky top-0 z-20 border-b border-cream-300">
        <div className="max-w-lg mx-auto flex justify-center gap-2 flex-wrap">
          {[
            { id: 'all', label: 'All' },
            { id: user?.role, label: 'Mine' },
            { id: user?.role === 'shah' ? 'dane' : 'shah', label: theirName },
            { id: 'shared', label: 'Shared' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`
                px-5 py-3 rounded-full text-body-sm font-medium transition-all
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
      </div>

      {/* Content */}
      <div className="bg-cream min-h-[60vh] px-6 py-8">
        <div className="max-w-lg mx-auto">
          {/* Add Button */}
          <button
            onClick={() => setShowAddGoal(true)}
            className="w-full mb-6 py-5 border-2 border-dashed border-forest-300 rounded-2xl text-forest hover:border-forest-400 hover:bg-forest-50 transition-all font-medium"
          >
            + Add goal
          </button>

          {/* Goals */}
          {loading ? (
            <p className="text-center py-12 text-ink-400">Loading...</p>
          ) : goals.length > 0 ? (
            <div className="space-y-6">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className={`bg-white rounded-3xl p-6 shadow-card transition-all relative group ${goal.status === 'completed' ? 'opacity-70' : ''} ${celebrateGoal === goal.id ? 'ring-4 ring-gold ring-offset-4' : ''}`}
                >
                  {/* Delete Button */}
                  <button
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="absolute top-4 right-4 w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 hover:bg-rose-200 z-10"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    {/* Progress Circle */}
                    <div className="flex-shrink-0">
                      <ProgressCircle progress={goal.progress || 0} size={64} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`tag ${getOwnerStyle(goal.owner)}`}>
                          {getOwnerLabel(goal.owner)}
                        </span>
                        {goal.status === 'completed' && (
                          <span className="tag tag-forest">Complete</span>
                        )}
                      </div>
                      <h3 className={`font-serif text-title-sm text-forest ${goal.status === 'completed' ? 'line-through' : ''}`}>
                        {goal.title}
                      </h3>
                      {goal.description && (
                        <p className="text-body-sm text-ink-400 mt-1">{goal.description}</p>
                      )}
                      {goal.target_date && (
                        <p className="text-caption text-ink-300 mt-2">
                          Target: {new Date(goal.target_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      )}
                    </div>

                    {/* Expand */}
                    <button
                      onClick={() => setExpandedGoal(expandedGoal === goal.id ? null : goal.id)}
                      className="p-2 text-ink-300 hover:text-ink-500"
                    >
                      <svg
                        className={`w-5 h-5 transition-transform ${expandedGoal === goal.id ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {expandedGoal === goal.id && (
                    <div className="mt-6 pt-6 border-t border-cream-200">
                      {/* Milestones */}
                      {goal.milestones && goal.milestones.length > 0 && (
                        <div className="space-y-3 mb-6">
                          <p className="section-label">Milestones</p>
                          {goal.milestones.map((milestone) => (
                            <button
                              key={milestone.id}
                              onClick={() => handleToggleMilestone(goal.id, milestone.id, milestone.is_completed)}
                              className="w-full flex items-center gap-3 text-left group"
                            >
                              <div className={`
                                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all
                                ${milestone.is_completed
                                  ? 'bg-forest border-forest'
                                  : 'border-cream-400 group-hover:border-forest-300'
                                }
                              `}>
                                {milestone.is_completed && (
                                  <svg className="w-4 h-4 text-cream" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                  </svg>
                                )}
                              </div>
                              <span className={`text-body ${milestone.is_completed ? 'text-ink-400 line-through' : 'text-ink-600'}`}>
                                {milestone.title}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Complete Button */}
                      {goal.status !== 'completed' && (
                        <button
                          onClick={() => handleCompleteGoal(goal.id)}
                          className="btn-gold w-full"
                        >
                          Mark as Complete 🎉
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <span className="text-5xl mb-4 block">🎯</span>
              <p className="text-body text-ink-400">No goals yet</p>
              <p className="text-body-sm text-ink-300 mt-1">Add your first one</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <AddGoalModal
          user={user}
          theirName={theirName}
          onClose={() => setShowAddGoal(false)}
          onAdd={handleAddGoal}
        />
      )}

      {/* Celebration Overlay */}
      {celebrateGoal && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-center">
            <span className="text-8xl block">🎉</span>
            <p className="font-serif text-display-sm text-forest mt-4">Goal Complete!</p>
          </div>
        </div>
      )}
    </div>
  )
}

function ProgressCircle({ progress, size = 64 }) {
  const strokeWidth = 4
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="stroke-cream-300"
          strokeWidth={strokeWidth}
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="stroke-forest transition-all duration-700 ease-out"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="none"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-serif text-title-sm text-forest">{progress}%</span>
      </div>
    </div>
  )
}

function AddGoalModal({ user, theirName, onClose, onAdd }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    owner: user?.role || 'dane',
    target_date: '',
  })
  const [milestones, setMilestones] = useState(['', ''])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setLoading(true)
    await onAdd(form, milestones)
    setLoading(false)
  }

  return (
    <div 
      className="fixed inset-0 bg-forest-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="bg-cream w-full max-w-md rounded-3xl shadow-elevated overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-forest">
          <h2 className="font-serif text-title text-cream-100">Add Goal</h2>
          <button onClick={onClose} className="p-2 text-cream-200 hover:text-cream-100 rounded-full hover:bg-forest-600">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="max-h-[50vh] overflow-y-auto p-5">
          <form id="goal-form" onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">What's the goal? *</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))}
                className="input"
                placeholder="Run a marathon, learn 50 words..."
                required
              />
            </div>

            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Why does it matter?</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                className="input min-h-[60px] resize-none"
                placeholder="Optional motivation..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-body-sm font-medium text-ink-600 block mb-1">Whose goal?</label>
                <select
                  value={form.owner}
                  onChange={(e) => setForm(p => ({ ...p, owner: e.target.value }))}
                  className="input"
                >
                  <option value={user?.role}>Mine</option>
                  <option value={user?.role === 'shah' ? 'dane' : 'shah'}>{theirName}'s</option>
                  <option value="shared">Shared</option>
                </select>
              </div>

              <div>
                <label className="text-body-sm font-medium text-ink-600 block mb-1">Target date</label>
                <input
                  type="date"
                  value={form.target_date}
                  onChange={(e) => setForm(p => ({ ...p, target_date: e.target.value }))}
                  className="input"
                />
              </div>
            </div>

            {/* Milestones */}
            <div>
              <label className="text-body-sm font-medium text-ink-600 block mb-1">Milestones</label>
              <div className="space-y-2">
                {milestones.map((m, i) => (
                  <input
                    key={i}
                    type="text"
                    value={m}
                    onChange={(e) => {
                      const updated = [...milestones]
                      updated[i] = e.target.value
                      setMilestones(updated)
                    }}
                    className="input"
                    placeholder={`Step ${i + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => setMilestones(prev => [...prev, ''])}
                className="text-body-sm text-forest font-medium mt-2 hover:text-forest-700"
              >
                + Add step
              </button>
            </div>
          </form>
        </div>

        {/* Fixed Footer - Always Visible */}
        <div className="p-5 bg-cream border-t border-cream-300">
          <button 
            type="submit" 
            form="goal-form" 
            className="w-full py-4 bg-forest text-cream-100 rounded-2xl font-semibold text-lg hover:bg-forest-600 transition-colors shadow-lg"
            disabled={loading}
          >
            {loading ? 'Creating...' : '🎯 Create Goal'}
          </button>
        </div>
      </div>
    </div>
  )
}
