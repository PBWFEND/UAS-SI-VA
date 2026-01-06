import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Menu from './pages/Menu'
import Orders from './pages/Orders'
import Header from './components/Header'
import Sidebar from './components/Sidebar'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuthenticated(!!token)
    setLoading(false)
  }, [])

  const PrivateRoute = ({ children }) => {
    if (loading) {
      return <div className="flex justify-center items-center h-screen">Loading...</div>
    }
    return isAuthenticated ? children : <Navigate to="/login" />
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route path="/" element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/menu" element={
          <PrivateRoute>
            <Layout>
              <Menu />
            </Layout>
          </PrivateRoute>
        } />
        <Route path="/orders" element={
          <PrivateRoute>
            <Layout>
              <Orders />
            </Layout>
          </PrivateRoute>
        } />
      </Routes>
    </Router>
  )
}

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default App