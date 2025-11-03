import clsx from 'clsx'

const tagColors = {
  Arbete: 'bg-blue-100 text-blue-800',
  Idéer: 'bg-yellow-100 text-yellow-800',
  Personligt: 'bg-green-100 text-green-800',
  Standard: 'bg-gray-100 text-gray-800'
}

export default function PostCard({ post, onClick }) {
  const cat = post.category || 'Standard'
  return (
    <div onClick={onClick} className="bg-white rounded-xl shadow-soft p-4 hover:shadow-md transition cursor-pointer">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-gray-900 line-clamp-1">{post.title}</h3>
        <span className={clsx('text-xs px-2 py-1 rounded-full', tagColors[cat] || tagColors.Standard)}>{cat}</span>
      </div>
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{post.excerpt || post.body?.slice(0, 120)}</p>
      <p className="mt-3 text-xs text-gray-400">{new Date(post.createdAt || post.created || Date.now()).toLocaleDateString('sv-SE')}</p>
    </div>
  )
}
