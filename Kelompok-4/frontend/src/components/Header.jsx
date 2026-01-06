import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <header className="bg-white shadow">
      <div className="px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="text-xl font-bold text-gray-800">
            Sistem UMKM
          </div>
          <div className="ml-4 text-sm text-gray-500 hidden md:block">
            {user?.email}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:block">
            <div className="text-sm font-medium text-gray-700">{user?.name}</div>
            <div className="text-xs text-gray-500">{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="btn bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header