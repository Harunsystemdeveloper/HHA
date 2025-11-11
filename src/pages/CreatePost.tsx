import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api/posts';
import { CATEGORIES, type CreatePostInput } from '../types';

export default function CreatePost() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreatePostInput>({
    title: '',
    category: CATEGORIES[0],
    description: '',
    imageUrl: '',
    authorName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createPost(form);
      navigate('/');
    } catch (err) {
      setError('Kunde inte skapa inlägg');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-semibold">Skapa inlägg</h1>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Titel</label>
          <input
            required
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Kategori</label>
          <select
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Beskrivning</label>
          <textarea
            required
            rows={6}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Bild‑URL (valfritt)</label>
          <input
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            value={form.imageUrl ?? ''}
            onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Namn (visas på inlägget)</label>
          <input
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            value={form.authorName ?? ''}
            onChange={(e) => setForm({ ...form, authorName: e.target.value })}
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-white shadow-soft hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? 'Skickar…' : 'Publicera'}
          </button>
        </div>
      </form>
    </div>
  );
}

