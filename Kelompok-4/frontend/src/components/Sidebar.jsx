import { NavLink } from 'react-router-dom'

const Sidebar = () => {
  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/menu', label: 'Kelola Menu', icon: '🍽️' },
    { path: '/orders', label: 'Kelola Pesanan', icon: '📋' },
  ]

  return (
    <div className="bg-gray-800 text-white w-64 space-y-6 py-7 px-2">
      <div className="text-center">
        <h2 className="text-2xl font-bold">UMKM Manager</h2>
        <p className="text-gray-400 text-sm mt-2">Management System</p>
      </div>
      
      <nav className="space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
        <div className="text-center text-sm text-gray-400">
          Sistem Menu & Pesanan
        </div>
        <div className="text-center text-xs text-gray-500 mt-1">
          v1.0.0
        </div>
      </div>
    </div>
  )
}

export default Sidebar