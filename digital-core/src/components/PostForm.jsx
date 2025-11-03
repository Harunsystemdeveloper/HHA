import { useState } from 'react'
import { usePostsStore } from '../store/usePostsStore.js'

export default function PostForm({ onDone }) {
  const { createPost, loading } = usePostsStore()
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('Arbete')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      await createPost({ title, category, body })
      onDone?.()
      setTitle(''); setCategory('Arbete'); setBody('')
    } catch (err) {
      setError('Misslyckades att spara inlägget')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 bg-white p-4 rounded-xl shadow-soft">
      <div>
        <label className="block text-sm text-gray-600">Titel</label>
        <input value={title} onChange={e=>setTitle(e.target.value)} required className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200" />
      </div>
      <div>
        <label className="block text-sm text-gray-600">Kategori</label>
        <select value={category} onChange={e=>setCategory(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200">
          <option>Arbete</option>
          <option>Idéer</option>
          <option>Personligt</option>
        </select>
      </div>
      <div>
        <label className="block text-sm text-gray-600">Innehåll</label>
        <textarea value={body} onChange={e=>setBody(e.target.value)} rows={6} className="mt-1 w-full px-3 py-2 rounded-md border border-gray-200" />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button disabled={loading} className="px-4 py-2 rounded-md bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50">{loading ? 'Sparar...' : 'Spara inlägg'}</button>
      </div>
    </form>
  )
}
