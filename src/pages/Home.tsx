import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPosts, deletePost } from "../api/posts";
import PostCard from "../components/PostCard";
import type { Category, Post } from "../types";
import EmptyState from "../components/EmptyState";
import SearchBar from "../components/SearchBar";
import FilterChips from "../components/FilterChips";
import { demoPosts } from "../mock/postsDemo";
import useCurrentUser from "../hooks/useCurrentUser";

const ALL: Category = "Alla";

// ✅ helper: gör om okända format (string/object/textfield) till text
function toPlainText(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") return value;

  // Orchard kan ge TextField som { text: "..." }
  if (typeof value === "object") {
    const v = value as any;

    if (typeof v.text === "string") return v.text;
    if (typeof v.html === "string") return v.html;
    if (typeof v.value === "string") return v.value;
    if (typeof v.content === "string") return v.content;
    if (typeof v.body === "string") return v.body;
    if (typeof v.description === "string") return v.description;
  }

  try {
    return String(value);
  } catch {
    return "";
  }
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  const [query, setQuery] = useState(() => localStorage.getItem("da_lastQuery") || "");
  const [active, setActive] = useState<Category>(() => (localStorage.getItem("da_lastCategory") as Category) || ALL);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPosts();
        if (mounted) {
          setPosts(data);
          setUsingDemo(false);
        }
      } catch (e) {
        // Undvik att visa felruta – visa demo-inlägg direkt vid API-fel
        if (mounted) {
          setPosts(demoPosts);
          setUsingDemo(true);
          setError("");
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

    const toText = (v: unknown) => toPlainText(v).toLowerCase();

    return posts.filter((p) => {
      const byCat = active === ALL || (p as any).category === active;

      // ✅ robust: klarar flera fältnamn och flera format
      const title = toText((p as any).title ?? (p as any).displayText ?? (p as any).name);
      const desc = toText(
        (p as any).description ??
        (p as any).Description ??
        (p as any).body ??
        (p as any).content ??
        (p as any).html ??
        (p as any).Html
      );
      const author = toText((p as any).authorName ?? (p as any).author ?? (p as any).owner);

      const byText = !q || title.includes(q) || desc.includes(q) || author.includes(q);
      return byCat && byText;
    });
  }, [posts, query, active]);

  // Persist filters locally so they survive reloads
  useEffect(() => {
    try {
      localStorage.setItem("da_lastQuery", query);
      localStorage.setItem("da_lastCategory", active);
    } catch { }
  }, [query, active]);

  async function handleDelete(id: string | number) {
    const ok = window.confirm("Ta bort detta inlägg?");
    if (!ok) return;
    try {
      setDeletingId(id);
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => (p as any).id !== id));
    } catch (e) {
      alert("Kunde inte ta bort inlägget");
    } finally {
      setDeletingId(null);
    }
  }

  const isAdmin = user.roles?.some((r) => /admin/i.test(r));
  function isOwner(p: Post) {
    const username = user.username?.toLowerCase() || "";
    const byAuthorName = (((p as any).authorName || "") as string).toLowerCase() === username;
    const anyOwner = (((p as any).owner || (p as any).author || "") as string).toLowerCase() === username;
    return !!username && (byAuthorName || anyOwner);
  }

  return (
    <div className="space-y-6">
      {/* Search + action */}
      <div className="rounded-2xl border border-purple-200/60 bg-white/60 p-3 shadow-soft">
        <SearchBar value={query} onChange={setQuery} />
        <div className="mt-3 flex justify-end">
          <button
            onClick={() => navigate("/create")}
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

        {!loading && posts.length === 0 && !usingDemo && (
          <div className="mt-3">
            <button
              onClick={() => {
                setPosts(demoPosts);
                setUsingDemo(true);
                setError("");
              }}
              className="rounded-md bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
            >
              Visa demo-inlägg
            </button>
          </div>
        )}
      </section>

      {/* Status */}
      {loading && (
        <div className="rounded-xl bg-white/60 p-3 text-sm text-gray-700 shadow-soft">Laddar…</div>
      )}

      {/* Counter */}
      {!loading && !error && (
        <div className="rounded-xl bg-white/60 p-3 text-sm text-gray-700 shadow-soft">
          Visar {filtered.length} inlägg
        </div>
      )}

      {/* Grid */}
      {!loading &&
        !error &&
        (filtered.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => {
              const allow = isAdmin || isOwner(p);

              // ✅ Här är FIXEN: mappa fälten robust så description alltid kommer med
              const id = (p as any).id ?? (p as any).contentItemId ?? (p as any).contentItemID;
              const title = toPlainText((p as any).title ?? (p as any).displayText ?? "Untitled");
              const category = toPlainText((p as any).category ?? (p as any).Category ?? "Övrigt");
              const description = (p as any).description ?? (p as any).Description ?? (p as any).body ?? (p as any).content;
              const html = (p as any).html ?? (p as any).Html;

              const authorName = toPlainText((p as any).authorName ?? (p as any).author ?? (p as any).owner ?? "Anonym");
              const createdAt =
                toPlainText((p as any).createdAt ?? (p as any).publishedUtc ?? (p as any).createdUtc ?? (p as any).modifiedUtc) || undefined;

              const imageUrl = (p as any).imageUrl ?? (p as any).image ?? null;

              return (
                <PostCard
                  key={id}
                  id={id}
                  title={title}
                  category={category}
                  description={description}
                  html={html}
                  authorName={authorName}
                  createdAt={createdAt}
                  imageUrl={imageUrl}
                  onDelete={allow ? () => handleDelete(id) : undefined}
                  deleting={deletingId === id}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState />
        ))}
    </div>
  );
}
