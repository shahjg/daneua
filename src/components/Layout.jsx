import { Outlet, NavLink } from 'react-router-dom'

const navItems = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/learn', label: 'Learn', icon: '📚' },
  { path: '/us', label: 'Us', icon: '💑' },
  { path: '/plans', label: 'Plans', icon: '📅' },
  { path: '/goals', label: 'Goals', icon: '🎯' },
  { path: '/ideas', label: 'Ideas', icon: '💡' }
]

export default function Layout() {
  return (
    <div className="min-h-screen bg-cream-100 pb-20">
      <Outlet />
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-cream-200 px-2 py-1 safe-area-bottom z-50">
        <div className="flex justify-around max-w-lg mx-auto">
          {navItems.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
                  isActive ? 'text-forest bg-cream-200' : 'text-ink-400'
                }`
              }
            >
              <span className="text-lg">{icon}</span>
              <span className="text-caption mt-0.5">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
