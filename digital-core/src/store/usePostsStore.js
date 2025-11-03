import { create } from 'zustand'
import * as api from '../services/api.js'

export const usePostsStore = create((set, get) => ({
  posts: [],
  stats: null,
  loading: false,
  error: '',

  loadPosts: async () => {
    set({ loading: true, error: '' })
    try {
      const data = await api.fetchPosts()
      set({ posts: data, loading: false })
    } catch (e) {
      set({ error: 'Kunde inte hämta inlägg', loading: false })
    }
  },

  loadStats: async () => {
    set({ loading: true, error: '' })
    try {
      const stats = await api.fetchStats()
      set({ stats, loading: false })
    } catch (e) {
      set({ error: 'Kunde inte hämta statistik', loading: false })
    }
  },

  createPost: async (payload) => {
    set({ loading: true, error: '' })
    try {
      const created = await api.createPost(payload)
      set({ posts: [created, ...get().posts], loading: false })
      return created
    } catch (e) {
      set({ error: 'Kunde inte spara inlägg', loading: false })
      throw e
    }
  }
}))
