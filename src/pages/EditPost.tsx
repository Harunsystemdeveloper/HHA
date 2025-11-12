import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getPost, updatePost } from '../api/posts';
import { CATEGORIES, type CreatePostInput, type Post } from '../types';
import useCurrentUser from '../hooks/useCurrentUser';

export default function EditPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const contentType = (import.meta as any).env?.VITE_CONTENT_TYPE || 'Post';

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [details, setDetails] = useState<string | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [form, setForm] = useState<CreatePostInput>({
    title: '',
    category: CATEGORIES[0],
    description: '',
    imageUrl: '',
    authorName: '',
  });

  const isPet = useMemo(() => String(contentType).toLowerCase() === 'pet', [contentType]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!id) return;
      setLoading(true);
      setError('');
      setDetails(null);
      try {
        const data = await getPost(id);
        if (!mounted) return;
        setPost(data);
        setForm({
          title: data.title || '',
          category: (data.category as any) || (isPet ? (data as any).species || '' : CATEGORIES[0]),
          description: data.description || '',
          imageUrl: data.imageUrl || '',
          authorName: data.authorName || (data as any).author || (data as any).owner || '',
        });
      } catch (e) {
        if (mounted) setError('Kunde inte ladda inlägget');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id, isPet]);

  const isAdmin = user.roles?.some((r) => /admin/i.test(r));
  const isOwner = useMemo(() => {
    if (!user.username || !post) return false;
    const uname = user.username.toLowerCase();
    const byAuthorName = (post.authorName || '').toLowerCase() === uname;
    const anyOwner = ((post as any).owner || (post as any).author || '').toLowerCase() === uname;
    return byAuthorName || anyOwner;
  }, [user.username, user.roles, post]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;
    setError('');
    setDetails(null);
    try {
      let payload: any = { ...form };
      if (isPet) {
        payload = { title: form.title, species: form.category };
      }
      await updatePost(id, payload);
      navigate('/');
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.error) {
        setError(data.error || 'Kunde inte spara ändringarna');
        const extras: string[] = [];
        if (Array.isArray(data.invalidFields) && data.invalidFields.length) extras.push(`Ogiltiga fält: ${data.invalidFields.join(', ')}`);
        if (Array.isArray(data.validFields) && data.validFields.length) extras.push(`Tillåtna fält: ${data.validFields.join(', ')}`);
        if (extras.length) setDetails(extras.join(' • '));
      } else {
        setError('Kunde inte spara ändringarna');
      }
    }
  }

  if (loading) return <div>Laddar…</div>;
  if (!post) return <div className="text-sm text-gray-600">Inlägget kunde inte hittas.</div>;

  const cannotEdit = !(isAdmin || isOwner);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-semibold">Redigera inlägg</h1>

      {cannotEdit && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Du saknar rättigheter att redigera detta inlägg. Försök som ägare eller admin.
        </div>
      )}

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
            disabled={cannotEdit}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:opacity-60"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">{isPet ? 'Art (species)' : 'Kategori'}</label>
          <select
            disabled={cannotEdit}
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:opacity-60"
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
              disabled={cannotEdit}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:opacity-60"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        )}

        {!isPet && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Bild‑URL (valfritt)</label>
            <input
              disabled={cannotEdit}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 disabled:opacity-60"
              value={form.imageUrl ?? ''}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </div>
        )}

        <div className="flex items-center gap-2 pt-2">
          <button
            type="submit"
            disabled={cannotEdit}
            className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-white shadow-soft hover:bg-brand-700 disabled:opacity-50"
          >
            Spara
          </button>
          <Link to="/" className="text-sm text-gray-700 hover:text-gray-900">Avbryt</Link>
        </div>
      </form>
    </div>
  );
}

