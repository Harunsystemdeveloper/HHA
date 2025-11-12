import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getPosts, deletePost } from '../api/posts';
import PostCard from '../components/PostCard';
import type { Category, Post } from '../types';
import { CATEGORIES as CAT_LIST } from '../types';
import EmptyState from '../components/EmptyState';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import { demoPosts } from '../mock/postsDemo';

const ALL: Category = 'Alla';
const CATEGORIES: Category[] = [ALL, ...CAT_LIST];

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState(() => localStorage.getItem('da_lastQuery') || '');
  const [active, setActive] = useState<Category>(() => (localStorage.getItem('da_lastCategory') as Category) || ALL);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getPosts();
        if (mounted) setPosts(data);
      } catch (e) {
        // Undvik att visa felruta – visa demo‑inlägg direkt
        if (mounted) {
          setPosts(demoPosts);
          setUsingDemo(true);
          setError('');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const byCat = active === ALL || p.category === active;
      const byText =
        !q ||
        p.title?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.authorName?.toLowerCase().includes(q);
      return byCat && byText;
    });
  }, [posts, query, active]);

  // Persist filters locally so they survive reloads
  useEffect(() => {
    try {
      localStorage.setItem('da_lastQuery', query);
      localStorage.setItem('da_lastCategory', active);
    } catch {}
  }, [query, active]);

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

  return (
    <div className="space-y-6">
      {/* Search + action */}
      <div className="rounded-2xl border border-purple-200/60 bg-white/60 p-3 shadow-soft">
        <SearchBar value={query} onChange={setQuery} />
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => navigate('/create')}
            className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm font-medium text-brand-700 shadow-sm hover:bg-brand-50"
          >
            + Skapa inlägg
          </button>
        </div>
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-purple-200/60 bg-white/60 p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <span>🛠️</span>
          <span>Filtrera efter kategori</span>
        </div>
        <FilterChips active={active} onChange={setActive} />
        {(!loading && posts.length === 0 && !usingDemo) && (
          <div className="mt-3">
            <button
              onClick={() => { setPosts(demoPosts); setUsingDemo(true); setError(''); }}
              className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Visa demo‑inlägg
            </button>
          </div>
        )}
      </section>

      {/* Status */}
      {loading && (
        <div className="rounded-xl bg-white/60 p-3 text-sm text-gray-700 shadow-soft">Laddar…</div>
      )}
      {/* Error banner borttagen: vi visar demo‑inlägg istället vid fel */}

      {/* Counter */}
      {!loading && !error && (
        <div className="rounded-xl bg-white/60 p-3 text-sm text-gray-700 shadow-soft">
          Visar {filtered.length} inlägg
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <PostCard
                key={p.id}
                {...p}
                onDelete={() => handleDelete(p.id)}
                deleting={deletingId === p.id}
              />
            ))}
          </div>
        ) : (
          <EmptyState />
        )
      )}
    </div>
  );
}
