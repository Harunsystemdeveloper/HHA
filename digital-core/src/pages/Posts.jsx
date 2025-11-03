import { useState } from 'react'
import PostList from '../components/PostList.jsx'
import PostForm from '../components/PostForm.jsx'
import { useUser } from '../context/UserContext.jsx'

export default function Posts({ createMode }) {
  const { user } = useUser()
  const [selected, setSelected] = useState(null)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Inlägg</h1>
        {user?.role === 'admin' && (
          <a href="/posts/new" className="px-3 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700">Nytt inlägg</a>
        )}
      </div>

      {createMode ? (
        user?.role === 'admin' ? (
          <PostForm onDone={() => window.history.back()} />
        ) : (
          <p className="text-sm text-gray-600">Endast administratörer kan skapa inlägg.</p>
        )
      ) : (
        <PostList onSelect={setSelected} />
      )}

      {selected && (
        <div className="bg-white rounded-xl shadow-soft p-4">
          <h2 className="text-lg font-semibold">{selected.title}</h2>
          <p className="mt-2 text-gray-700 whitespace-pre-wrap">{selected.body || 'Ingen text'}</p>
        </div>
      )}
    </div>
  )
}
