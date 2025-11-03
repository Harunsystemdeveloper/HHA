import axios from 'axios'

const baseURL = import.meta.env.VITE_ORCHARD_BASE_URL || 'http://localhost:5000'
const POST_TYPE = import.meta.env.VITE_ORCHARD_POST_TYPE || 'Post'

const http = axios.create({ baseURL })

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('dc_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (res) => res,
  (err) => {
    return Promise.reject(err)
  }
)

export async function fetchPosts() {
  try {
    const res = await http.get(`/api/content?contentType=${encodeURIComponent(POST_TYPE)}`)
    const items = Array.isArray(res.data) ? res.data : (res.data?.items || [])
    return items.map(mapOrchardPost)
  } catch (e) {
    // Mock fallback om API inte svarar
    return [
      { id: '1', title: 'Välkommen till Digital Core', category: 'Arbete', body: 'Exempelinlägg', createdAt: new Date().toISOString() },
      { id: '2', title: 'Idéer för nästa sprint', category: 'Idéer', body: 'Brainstorming...', createdAt: new Date().toISOString() }
    ]
  }
}

export async function fetchStats() {
  const posts = await fetchPosts()
  const categories = new Set(posts.map(p => p.category || 'Standard'))
  const thisWeek = posts.filter(p => daysSince(p.createdAt) <= 7).length
  const pinned = posts.filter(p => p.pinned).length
  return { totalPosts: posts.length, categories: categories.size, thisWeek, pinned }
}

export async function createPost(payload) {
  try {
    const body = toOrchardPost(payload)
    const res = await http.post('/api/content', body)
    return mapOrchardPost(res.data)
  } catch (e) {
    // Mock när backenden saknas
    return { id: Math.random().toString(36).slice(2), ...payload, createdAt: new Date().toISOString() }
  }
}

function daysSince(dateStr) {
  const d = new Date(dateStr); const now = new Date()
  return Math.floor((now - d) / (1000*60*60*24))
}

function mapOrchardPost(item) {
  // Anpassa mappning beroende på din Orchard Core content definition
  return {
    id: item?.contentItemId || item?.id,
    title: item?.DisplayText || item?.title || 'Utan titel',
    category: item?.Category || item?.category || 'Standard',
    body: item?.MarkdownBodyPart?.Markdown || item?.body || '',
    createdAt: item?.CreatedUtc || item?.createdAt || new Date().toISOString(),
    pinned: item?.pinned || false
  }
}

function toOrchardPost(payload) {
  // Minimal exempelkropp; justera efter din content-type i Orchard
  return {
    contentType: POST_TYPE,
    DisplayText: payload.title,
    MarkdownBodyPart: { Markdown: payload.body },
    Category: payload.category
  }
}
