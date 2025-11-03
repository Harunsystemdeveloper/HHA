import { useState } from 'react'
import { useUser } from '../context/UserContext.jsx'

export default function Login() {
  const { login } = useUser()
  const [role, setRole] = useState('user')
  const [name, setName] = useState('Gäst')

  function handleSubmit(e) {
    e.preventDefault()
    login({ name, role })
  }

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-soft">
      <h1 className="text-xl font-semibold">Logga in (mock)</h1>
      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <div>
          <label className="block text-sm text-gray-600">Namn</label>
          <input value={name} onChange={e=>setName(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200" />
        </div>
        <div>
          <label className="block text-sm text-gray-600">Roll</label>
          <select value={role} onChange={e=>setRole(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200">
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div className="flex justify-end">
          <button className="px-4 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700">Logga in</button>
        </div>
      </form>
    </div>
  )
}
