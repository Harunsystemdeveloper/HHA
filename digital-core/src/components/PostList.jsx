import { useEffect, useMemo, useState } from 'react'
import PostCard from './PostCard.jsx'
import { usePostsStore } from '../store/usePostsStore.js'

export default function PostList({ onSelect }) {
  const { posts, loadPosts, loading, error } = usePostsStore()
  const [q, setQ] = useState('')
  const [cat, setCat] = useState('Alla')

  useEffect(() => { loadPosts() }, [loadPosts])

  const categories = useMemo(() => {
    const set = new Set(posts.map(p => p.category || 'Standard'))
    return ['Alla', ...Array.from(set)]
  }, [posts])

  const filtered = posts.filter(p => {
    const okCat = cat === 'Alla' || (p.category || 'Standard') === cat
    const okQ = !q || p.title.toLowerCase().includes(q.toLowerCase())
    return okCat && okQ
  })

  if (loading && posts.length === 0) return <p>Laddar...</p>
  if (error) return <p className="text-red-600">Misslyckades att hämta inlägg</p>

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Sök..." className="w-full sm:w-1/2 px-3 py-2 bg-white rounded-md border border-gray-200" />
        <select value={cat} onChange={e=>setCat(e.target.value)} className="px-3 py-2 bg-white rounded-md border border-gray-200">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(p => (
          <PostCard key={p.id || p.contentItemId} post={p} onClick={() => onSelect?.(p)} />
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="text-sm text-gray-500">Inga inlägg matchar filtret.</p>
      )}
    </div>
  )
}
