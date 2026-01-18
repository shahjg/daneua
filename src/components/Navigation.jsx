const navItems = [
  { id: 'mood', label: 'Mood', icon: '💭' },
  { id: 'growth', label: 'Learn', icon: '📚' },
  { id: 'live', label: 'Live', icon: '📡' },
  { id: 'vault', label: 'Vault', icon: '🔐' },
]

export default function Navigation({ currentPage, setCurrentPage }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-ivory/95 backdrop-blur-md border-t border-evergreen-100 safe-area-pb">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`
              flex flex-col items-center justify-center py-2 px-4 rounded-xl
              transition-all duration-200
              ${currentPage === item.id 
                ? 'text-evergreen bg-evergreen-100' 
                : 'text-evergreen-400 hover:text-evergreen-600'
              }
            `}
          >
            <span className="text-xl mb-1">{item.icon}</span>
            <span className={`text-xs font-medium ${
              currentPage === item.id ? 'text-evergreen-700' : ''
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
