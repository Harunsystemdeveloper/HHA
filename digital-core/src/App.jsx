import { Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Posts from './pages/Posts.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import { UserProvider, useUser } from './context/UserContext.jsx'
import './index.css'

// Enkel skyddad route för admins
function AdminRoute({ children }) {
  const { user } = useUser()
  if (!user || user.role !== 'admin') return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <UserProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Navbar />
        <main className="max-w-6xl mx-auto p-4 sm:p-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/new" element={<AdminRoute><Posts createMode /></AdminRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </UserProvider>
  )
}
