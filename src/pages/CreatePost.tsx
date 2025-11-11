import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPost } from '../api/posts';
import { CATEGORIES, type CreatePostInput } from '../types';

export default function CreatePost() {
  const navigate = useNavigate();
  const contentType = (import.meta as any).env?.VITE_CONTENT_TYPE || 'Post';

  const [form, setForm] = useState<CreatePostInput>({
    title: '',
    category: CATEGORIES[0],
    description: '',
    imageUrl: '',
    authorName: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [details, setDetails] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setDetails(null);
    try {
      // Build payload based on the target Orchard content type
      let payload: any = { ...form };

      // Special-case for the sample "Pet" type: it expects { title, species }
      if (String(contentType).toLowerCase() === 'pet') {
        payload = { title: form.title, species: form.category };
      }

      // Save author for My Posts convenience
      if (form.authorName) {
        try { localStorage.setItem('da_authorName', form.authorName); } catch {}
      }

      await createPost(payload);
      navigate('/');
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.error) {
        setError(data.error || 'Kunde inte skapa inlägg');
        const extras: string[] = [];
        if (Array.isArray(data.invalidFields) && data.invalidFields.length) {
          extras.push(`Ogiltiga fält: ${data.invalidFields.join(', ')}`);
        }
        if (Array.isArray(data.validFields) && data.validFields.length) {
          extras.push(`Tillåtna fält: ${data.validFields.join(', ')}`);
        }
        if (extras.length) setDetails(extras.join(' • '));
      } else {
        setError('Kunde inte skapa inlägg');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const isPet = String(contentType).toLowerCase() === 'pet';

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-semibold">Skapa inlägg</h1>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <div className="font-medium">{error}</div>
          {details && <div className="mt-1 text-xs text-red-700/90">{details}</div>}
        </div>
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
          <label className="block text-sm font-medium text-gray-700">
            {isPet ? 'Art (species)' : 'Kategori'}
          </label>
          <select
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {(isPet ? ['dog', 'cat', 'other'] : CATEGORIES).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {!isPet && (
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
        )}

        {!isPet && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Bild‑URL (valfritt)</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              value={form.imageUrl ?? ''}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </div>
        )}

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

