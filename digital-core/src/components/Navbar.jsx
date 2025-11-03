import { Link, NavLink } from 'react-router-dom'
import { useUser } from '../context/UserContext.jsx'

export default function Navbar() {
  const { user, logout } = useUser()

  return (
    <header className="bg-white shadow-soft">
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
        <Link to="/" className="font-semibold text-lg text-brand-700">Digital Core</Link>
        <ul className="flex items-center gap-4 text-sm">
          <li>
            <NavLink to="/" className={({isActive}) => `px-3 py-2 rounded-md ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:text-gray-900'}`}>Hem</NavLink>
          </li>
          <li>
            <NavLink to="/posts" className={({isActive}) => `px-3 py-2 rounded-md ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:text-gray-900'}`}>Inlägg</NavLink>
          </li>
          <li>
            <NavLink to="/login" className={({isActive}) => `px-3 py-2 rounded-md ${isActive ? 'bg-brand-50 text-brand-700' : 'text-gray-700 hover:text-gray-900'}`}>Logga in</NavLink>
          </li>
        </ul>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-gray-600">{user.name} • {user.role}</span>
              <button onClick={logout} className="text-sm px-3 py-1.5 rounded-md bg-gray-100 hover:bg-gray-200">Logga ut</button>
            </>
          ) : (
            <span className="text-sm text-gray-500">Inte inloggad</span>
          )}
        </div>
      </nav>
    </header>
  )
}
