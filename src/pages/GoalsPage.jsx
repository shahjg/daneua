import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'

export default function GoalsPage() {
  const { user, supabase } = useAuth()
  const [goals, setGoals] = useState([])
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [newGoal, setNewGoal] = useState({ title: '', description: '', target: 100 })
  const [editingGoal, setEditingGoal] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    loadGoals()
  }, [])

  const showToast = (message, type = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const loadGoals = async () => {
    if (!supabase) return
    const { data } = await supabase.from('goals').select('*').order('created_at', { ascending: false })
    if (data) setGoals(data)
  }

  const addGoal = async () => {
    if (!newGoal.title.trim() || !supabase) return
    
    await supabase.from('goals').insert({
      title: newGoal.title.trim(),
      description: newGoal.description.trim(),
      target: newGoal.target,
      progress: 0,
      created_by: user.id
    })
    
    setNewGoal({ title: '', description: '', target: 100 })
    setShowAddGoal(false)
    loadGoals()
    showToast('Goal added!', 'success')
  }

  const updateGoal = async () => {
    if (!editingGoal || !supabase) return
    
    await supabase.from('goals').update({
      title: editingGoal.title,
      description: editingGoal.description,
      target: editingGoal.target,
      progress: editingGoal.progress
    }).eq('id', editingGoal.id)
    
    setEditingGoal(null)
    loadGoals()
    showToast('Updated!', 'success')
  }

  const updateProgress = async (goal, newProgress) => {
    if (!supabase) return
    const clampedProgress = Math.max(0, Math.min(goal.target, newProgress))
    await supabase.from('goals').update({ progress: clampedProgress }).eq('id', goal.id)
    loadGoals()
  }

  const deleteGoal = async (id) => {
    if (!supabase) return
    await supabase.from('goals').delete().eq('id', id)
    setShowDeleteModal(null)
    setEditingGoal(null)
    loadGoals()
    showToast('Goal deleted', 'success')
  }

  return (
    <div className="min-h-screen bg-cream-100">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 left-4 right-4 z-50 p-4 rounded-xl shadow-card ${toast.type === 'success' ? 'bg-forest text-cream-100' : 'bg-ink-700 text-white'}`}>
          {toast.message}
        </div>
      )}

      <div className="p-6">
        <h1 className="font-serif text-display-sm text-forest mb-2">Goals</h1>
        <p className="text-body text-ink-500 mb-6">Track what matters to us</p>

        <button
          onClick={() => setShowAddGoal(true)}
          className="w-full bg-forest text-cream-100 py-4 rounded-xl font-medium mb-6"
        >
          + Add Goal
        </button>

        <div className="space-y-4 pb-24">
          {goals.map(goal => {
            const percentage = goal.target > 0 ? Math.round((goal.progress / goal.target) * 100) : 0
            const isComplete = percentage >= 100
            
            return (
              <div key={goal.id} className="bg-white rounded-2xl p-5 shadow-soft">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-serif text-title-sm text-forest">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-body-sm text-ink-500 mt-1">{goal.description}</p>
                    )}
                  </div>
                  <button onClick={() => setEditingGoal(goal)} className="text-ink-400 p-1">✏️</button>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-body-sm text-ink-500 mb-1">
                    <span>{goal.progress} / {goal.target}</span>
                    <span>{percentage}%</span>
                  </div>
                  <div className="h-3 bg-cream-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${isComplete ? 'bg-gold' : 'bg-forest'}`}
                      style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                  </div>
                </div>

                {/* Quick Progress Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => updateProgress(goal, goal.progress - 1)}
                    className="flex-1 py-2 bg-cream-100 rounded-lg text-body-sm text-ink-600"
                  >
                    - 1
                  </button>
                  <button
                    onClick={() => updateProgress(goal, goal.progress + 1)}
                    className="flex-1 py-2 bg-forest text-cream-100 rounded-lg text-body-sm"
                  >
                    + 1
                  </button>
                  <button
                    onClick={() => updateProgress(goal, goal.progress + 10)}
                    className="flex-1 py-2 bg-forest text-cream-100 rounded-lg text-body-sm"
                  >
                    + 10
                  </button>
                </div>

                {isComplete && (
                  <div className="mt-3 text-center">
                    <span className="text-gold text-2xl">🎉</span>
                    <p className="text-body-sm text-gold-400 font-medium">Goal Complete!</p>
                  </div>
                )}
              </div>
            )
          })}

          {goals.length === 0 && (
            <div className="text-center py-12">
              <p className="text-4xl mb-4">🎯</p>
              <p className="text-body text-ink-500">No goals yet. Set one together!</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Goal Modal */}
      {showAddGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-4">Add Goal</h3>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-body-sm text-ink-500 mb-1 block">Goal Title</label>
                <input
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="What do you want to achieve?"
                  className="w-full p-4 bg-cream-50 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>
              
              <div>
                <label className="text-body-sm text-ink-500 mb-1 block">Description (optional)</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Why is this important?"
                  className="w-full p-4 bg-cream-50 rounded-xl text-body resize-none h-20 focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>
              
              <div>
                <label className="text-body-sm text-ink-500 mb-1 block">Target Number</label>
                <input
                  type="number"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: parseInt(e.target.value) || 0 })}
                  min="1"
                  className="w-full p-4 bg-cream-50 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setShowAddGoal(false)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={addGoal} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Add Goal</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Goal Modal */}
      {editingGoal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-title text-forest mb-4">Edit Goal</h3>
            
            <div className="space-y-4 mb-4">
              <div>
                <label className="text-body-sm text-ink-500 mb-1 block">Goal Title</label>
                <input
                  value={editingGoal.title}
                  onChange={(e) => setEditingGoal({ ...editingGoal, title: e.target.value })}
                  className="w-full p-4 bg-cream-50 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>
              
              <div>
                <label className="text-body-sm text-ink-500 mb-1 block">Description</label>
                <textarea
                  value={editingGoal.description || ''}
                  onChange={(e) => setEditingGoal({ ...editingGoal, description: e.target.value })}
                  className="w-full p-4 bg-cream-50 rounded-xl text-body resize-none h-20 focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>
              
              <div>
                <label className="text-body-sm text-ink-500 mb-1 block">Target Number</label>
                <input
                  type="number"
                  value={editingGoal.target}
                  onChange={(e) => setEditingGoal({ ...editingGoal, target: parseInt(e.target.value) || 0 })}
                  min="1"
                  className="w-full p-4 bg-cream-50 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>
              
              <div>
                <label className="text-body-sm text-ink-500 mb-1 block">Current Progress</label>
                <input
                  type="number"
                  value={editingGoal.progress}
                  onChange={(e) => setEditingGoal({ ...editingGoal, progress: parseInt(e.target.value) || 0 })}
                  min="0"
                  className="w-full p-4 bg-cream-50 rounded-xl text-body focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
              </div>
            </div>
            
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteModal(editingGoal.id)} className="py-3 px-4 bg-rose-100 text-rose-600 rounded-xl">Delete</button>
              <button onClick={() => setEditingGoal(null)} className="flex-1 py-3 bg-cream-200 rounded-xl text-ink-600">Cancel</button>
              <button onClick={updateGoal} className="flex-1 py-3 bg-forest text-cream-100 rounded-xl">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="font-serif text-title text-forest mb-2">Delete Goal?</h3>
            <p className="text-body text-ink-500 mb-6">This cannot be undone.</p>
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
