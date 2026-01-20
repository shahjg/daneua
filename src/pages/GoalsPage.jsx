import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'

export default function GoalsPage() {
  const { user } = useAuth()
  const [goals, setGoals] = useState([])
  const [showAdd, setShowAdd] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', description: '' })
  const [editingGoal, setEditingGoal] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)

  useEffect(() => {
    fetchGoals()
    const channel = supabase.channel('goals-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'goals' }, fetchGoals)
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  const fetchGoals = async () => {
    const { data } = await supabase.from('goals').select('*, milestones(*)').order('created_at', { ascending: false })
    setGoals(data || [])
  }

  const addGoal = async () => {
    if (!newGoal.title.trim()) return
    await supabase.from('goals').insert({ ...newGoal, created_by: user.role })
    setNewGoal({ title: '', description: '' })
    setShowAdd(false)
    fetchGoals()
  }

  const updateGoal = async () => {
    if (!editingGoal?.title.trim()) return
    await supabase.from('goals').update({ title: editingGoal.title, description: editingGoal.description }).eq('id', editingGoal.id)
    setEditingGoal(null)
    fetchGoals()
  }

  const deleteGoal = async (id) => {
    await supabase.from('milestones').delete().eq('goal_id', id)
    await supabase.from('goals').delete().eq('id', id)
    setShowDeleteModal(null)
    fetchGoals()
  }

  const toggleMilestone = async (milestone) => {
    await supabase.from('milestones').update({ completed: !milestone.completed }).eq('id', milestone.id)
    fetchGoals()
  }

  const addMilestone = async (goalId, title) => {
    if (!title.trim()) return
    await supabase.from('milestones').insert({ goal_id: goalId, title, completed: false })
    fetchGoals()
  }

  return (
    <div className="min-h-screen pb-28">
      <div className="bg-forest px-6 pt-14 pb-12">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="font-serif text-display-sm text-cream-50 mb-2">Goals</h1>
          <p className="text-body text-cream-300">Our dreams together</p>
        </div>
      </div>

      <div className="bg-cream px-6 py-8 min-h-[60vh]">
        <div className="max-w-lg mx-auto">
          <button onClick={() => setShowAdd(true)} className="w-full bg-forest text-cream-100 rounded-xl p-4 mb-6 font-medium">Add New Goal</button>

          {/* Add Goal Form */}
          {showAdd && (
            <div className="bg-white rounded-2xl p-6 shadow-card mb-6">
              <h3 className="font-serif text-title text-forest mb-4">New Goal</h3>
              <input
                type="text"
                value={newGoal.title}
                onChange={e => setNewGoal({ ...newGoal, title: e.target.value })}
                placeholder="Goal title..."
                className="w-full px-4 py-3 border border-cream-300 rounded-xl mb-3"
              />
              <textarea
                value={newGoal.description}
                onChange={e => setNewGoal({ ...newGoal, description: e.target.value })}
                placeholder="Description (optional)..."
                className="w-full px-4 py-3 border border-cream-300 rounded-xl mb-4 h-20 resize-none"
              />
              <div className="flex gap-3">
                <button onClick={() => { setShowAdd(false); setNewGoal({ title: '', description: '' }) }} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
                <button onClick={addGoal} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Create</button>
              </div>
            </div>
          )}

          {/* Goals List */}
          {goals.length === 0 ? (
            <p className="text-center text-ink-400 py-12">No goals yet. Start dreaming together.</p>
          ) : (
            <div className="space-y-4">
              {goals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => setEditingGoal(goal)}
                  onDelete={() => setShowDeleteModal(goal.id)}
                  onToggleMilestone={toggleMilestone}
                  onAddMilestone={addMilestone}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="font-serif text-title text-forest mb-4">Edit Goal</h3>
            <input
              type="text"
              value={editingGoal.title}
              onChange={e => setEditingGoal({ ...editingGoal, title: e.target.value })}
              className="w-full px-4 py-3 border border-cream-300 rounded-xl mb-3"
            />
            <textarea
              value={editingGoal.description || ''}
              onChange={e => setEditingGoal({ ...editingGoal, description: e.target.value })}
              className="w-full px-4 py-3 border border-cream-300 rounded-xl mb-4 h-20 resize-none"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(editingGoal.id)} className="py-3 px-4 bg-rose-100 text-rose-600 rounded-xl">Delete</button>
              <button onClick={() => setEditingGoal(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={updateGoal} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-2">Delete Goal?</h3>
            <p className="text-body text-ink-500 mb-6">This will also delete all milestones. This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={() => deleteGoal(showDeleteModal)} className="flex-1 py-3 bg-rose-500 text-white rounded-xl">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GoalCard({ goal, onEdit, onDelete, onToggleMilestone, onAddMilestone }) {
  const [showAddMilestone, setShowAddMilestone] = useState(false)
  const [newMilestone, setNewMilestone] = useState('')

  const completedCount = goal.milestones?.filter(m => m.completed).length || 0
  const totalCount = goal.milestones?.length || 0
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleAddMilestone = () => {
    onAddMilestone(goal.id, newMilestone)
    setNewMilestone('')
    setShowAddMilestone(false)
  }

  return (
    <div className="bg-white rounded-2xl p-5 shadow-card">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-serif text-title-sm text-forest">{goal.title}</h3>
          {goal.description && <p className="text-body-sm text-ink-400 mt-1">{goal.description}</p>}
        </div>
        <button onClick={onEdit} className="text-ink-300 hover:text-forest p-1">Edit</button>
      </div>

      {/* Progress Bar */}
      {totalCount > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-caption text-ink-400 mb-1">
            <span>{completedCount} of {totalCount} milestones</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-cream-200 rounded-full overflow-hidden">
            <div className="h-full bg-forest rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      {/* Milestones */}
      {goal.milestones?.length > 0 && (
        <div className="space-y-2 mb-4">
          {goal.milestones.map(milestone => (
            <button
              key={milestone.id}
              onClick={() => onToggleMilestone(milestone)}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 transition-colors ${milestone.completed ? 'bg-green-50' : 'bg-cream-100'}`}
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${milestone.completed ? 'bg-green-500 border-green-500' : 'border-cream-400'}`}>
                {milestone.completed && <span className="text-white text-xs">✓</span>}
              </div>
              <span className={`text-body-sm ${milestone.completed ? 'text-ink-400 line-through' : 'text-ink-600'}`}>{milestone.title}</span>
            </button>
          ))}
        </div>
      )}

      {/* Add Milestone */}
      {showAddMilestone ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newMilestone}
            onChange={e => setNewMilestone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAddMilestone()}
            placeholder="Milestone..."
            className="flex-1 px-3 py-2 border border-cream-300 rounded-lg text-body-sm"
            autoFocus
          />
          <button onClick={handleAddMilestone} className="px-3 py-2 bg-forest text-cream-100 rounded-lg text-body-sm">Add</button>
          <button onClick={() => { setShowAddMilestone(false); setNewMilestone('') }} className="px-3 py-2 bg-cream-200 text-ink-500 rounded-lg text-body-sm">x</button>
        </div>
      ) : (
        <button onClick={() => setShowAddMilestone(true)} className="text-body-sm text-forest font-medium">+ Add Milestone</button>
      )}
    </div>
  )
}
