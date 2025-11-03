import { useEffect } from 'react'
import { usePostsStore } from '../store/usePostsStore.js'

export default function Dashboard() {
  const { loadStats, stats, loading, error } = usePostsStore()

  useEffect(() => { loadStats() }, [loadStats])

  if (loading && !stats) return <p>Laddar...</p>
  if (error) return <p className="text-red-600">Misslyckades att hämta statistik</p>

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card title="Totalt antal inlägg" value={stats?.totalPosts ?? 0} />
      <Card title="Antal kategorier" value={stats?.categories ?? 0} />
      <Card title="Denna vecka" value={stats?.thisWeek ?? 0} />
      <Card title="Fästa inlägg" value={stats?.pinned ?? 0} />
    </section>
  )
}

function Card({ title, value }) {
  return (
    <div className="bg-white shadow-soft rounded-xl p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="mt-2 text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  )
}
