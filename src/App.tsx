import Header from './components/Header';
import { Link, NavLink, Outlet } from 'react-router-dom';
import './App.css';

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="border-b border-purple-100/60 bg-white/60">
        <nav className="mx-auto flex max-w-6xl gap-4 px-4 py-3 text-sm">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 ${isActive ? 'bg-brand-600 text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-white'}`
            }
          >
            Hem
          </NavLink>
          <NavLink
            to="/create"
            className={({ isActive }) =>
              `rounded-md px-3 py-1.5 ${isActive ? 'bg-brand-600 text-white' : 'text-gray-700 hover:text-gray-900 hover:bg-white'}`
            }
          >
            Skapa inlägg
          </NavLink>
        </nav>
      </div>
      <main className="mx-auto max-w-6xl p-4">
        <Outlet />
      </main>
    </div>
  );
}
