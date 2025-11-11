import { useEffect, useMemo, useState } from 'react';
import { getPosts } from '../api/posts';
import PostCard from '../components/PostCard';
import type { Category, Post } from '../types';
import { CATEGORIES as CAT_LIST } from '../types';

const ALL: Category = 'Alla';
const CATEGORIES: Category[] = [ALL, ...CAT_LIST];

export default function Home() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Category>(ALL);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="rounded-2xl border border-purple-200/60 bg-white/60 p-3 shadow-soft">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök inlägg..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-24 text-[15px] shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <button
            onClick={() => setQuery(query)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Sök
          </button>
        </div>
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-purple-200/60 bg-white/60 p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <span>🛠️</span>
          <span>Filtrera efter kategori</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${active === c ? 'chip-active' : 'chip-inactive'}`}
              onClick={() => setActive(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Status */}
      {loading && (
        <div className="rounded-xl bg-white/60 p-3 text-sm text-gray-700 shadow-soft">Laddar…</div>
      )}
      {error && !loading && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 shadow-soft">{error}</div>
      )}

      {/* Counter */}
      {!loading && !error && (
        <div className="rounded-xl bg-white/60 p-3 text-sm text-gray-700 shadow-soft">
          Visar {filtered.length} inlägg
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <PostCard key={p.id} {...p} />
          ))}
        </div>
      )}
    </div>
  );
}
