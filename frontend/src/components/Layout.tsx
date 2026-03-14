import { NavLink, Outlet } from 'react-router-dom'
import { Users, Wrench, ClipboardList } from 'lucide-react'

const navItems = [
  { to: '/clients', label: 'Clients', icon: Users },
  { to: '/technicians', label: 'Technicians', icon: Wrench },
  { to: '/work-orders', label: 'Work Orders', icon: ClipboardList },
]

export default function Layout() {
  return (
    <div className="flex h-screen">
      <aside className="w-56 flex-shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col">
        <div className="px-4 py-5 border-b border-gray-200">
          <h1 className="text-sm font-semibold text-gray-900 leading-tight">
            Field Service Tracker
          </h1>
        </div>
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
