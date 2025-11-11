import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getPosts, deletePost } from '../api/posts';
import type { Post } from '../types';
import PostCard from '../components/PostCard';
import EmptyState from '../components/EmptyState';

const LS_KEY = 'da_authorName';

export default function MyPosts() {
  const [myName, setMyName] = useState<string>('');
  const [editingName, setEditingName] = useState<string>('');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  useEffect(() => {
    // Load stored name
    const stored = localStorage.getItem(LS_KEY) || '';
    setMyName(stored);
    setEditingName(stored);

    // Fetch posts
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getPosts();
        if (mounted) setPosts(data);
      } catch (e) {
        if (mounted) setError('Kunde inte hämta inlägg');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const mine = useMemo(() => {
    const name = myName.trim().toLowerCase();
    if (!name) return [] as Post[];
    return posts.filter((p) => (p.authorName || '').toLowerCase() === name);
  }, [posts, myName]);

  async function handleDelete(id: string | number) {
    const ok = window.confirm('Ta bort detta inlägg?');
    if (!ok) return;
    try {
      setDeletingId(id);
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) {
      alert('Kunde inte ta bort inlägget');
    } finally {
      setDeletingId(null);
    }
  }

  function saveName() {
    const v = editingName.trim();
    setMyName(v);
    localStorage.setItem(LS_KEY, v);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-purple-200/60 bg-white/60 p-4 shadow-soft">
        <h1 className="text-xl font-semibold">Mina inlägg</h1>
        <p className="mt-1 text-sm text-gray-600">
          Ange ditt namn så filtrerar vi dina publicerade inlägg.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            placeholder="Ditt namn (samma som vid publicering)"
            className="w-full max-w-sm rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <button
            onClick={saveName}
            className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Spara
          </button>
          <Link
            to="/create"
            className="ml-auto rounded-md border border-brand-200 bg-white px-3 py-2 text-sm font-medium text-brand-700 shadow-sm hover:bg-brand-50"
          >
            + Skapa inlägg
          </Link>
        </div>
      </div>

      {loading && (
        <div className="rounded-xl bg-white/60 p-3 text-sm text-gray-700 shadow-soft">Laddar…</div>
      )}
      {error && !loading && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 shadow-soft">{error}</div>
      )}

      {!loading && !error && !myName && (
        <EmptyState
          title="Ange ditt namn"
          description="Skriv in ditt namn ovan (samma som du angav vid publicering) för att se dina inlägg."
          actionHref="/create"
          actionLabel="Skapa inlägg"
        />
      )}

      {!loading && !error && myName && (
        <div className="rounded-xl bg-white/60 p-3 text-sm text-gray-700 shadow-soft">
          Visar {mine.length} inlägg för <span className="font-medium">{myName}</span>
        </div>
      )}

      {!loading && !error && myName && (
        mine.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((p) => (
              <PostCard
                key={p.id}
                {...p}
                onDelete={() => handleDelete(p.id)}
                deleting={deletingId === p.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Inga inlägg hittades"
            description="Du har inte publicerat några inlägg ännu med detta namn."
            actionHref="/create"
            actionLabel="Skapa inlägg"
          />
        )
      )}
    </div>
  );
}

