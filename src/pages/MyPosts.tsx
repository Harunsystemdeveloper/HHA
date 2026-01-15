import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getPosts, deletePost } from "../api/posts";
import type { Post } from "../types";
import PostCard from "../components/PostCard";
import EmptyState from "../components/EmptyState";
import useCurrentUser from "../hooks/useCurrentUser";

const LS_KEY = "da_authorName";

export default function MyPosts() {
  const { user } = useCurrentUser();

  const [myName, setMyName] = useState<string>("");
  const [editingName, setEditingName] = useState<string>("");

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // ✅ sätt initialt namn smart (men skriv inte över om användaren redan har valt något)
  useEffect(() => {
    const stored = localStorage.getItem(LS_KEY) || "";
    const fallback = stored || user.username || "";

    setMyName((prev) => (prev ? prev : fallback));
    setEditingName((prev) => (prev ? prev : fallback));
  }, [user.username]);

  // Fetch posts
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getPosts();
        if (mounted) setPosts(data);
      } catch {
        if (mounted) setError("Kunde inte hämta inlägg");
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

    const toText = (v: unknown) => String(v ?? "").trim().toLowerCase();

    return posts.filter((p) => {
      const authorName = toText((p as any).authorName);
      const owner = toText((p as any).owner);
      const author = toText((p as any).author);

      // matcha på vilken av dem som helst
      return authorName === name || owner === name || author === name;
    });
  }, [posts, myName]);

  const isAdmin = user.roles?.some((r) => /admin/i.test(r));

  function isOwner(p: Post) {
    const username = user.username?.toLowerCase() || "";
    if (!username) return false;

    const toText = (v: unknown) => String(v ?? "").trim().toLowerCase();

    const authorName = toText((p as any).authorName);
    const owner = toText((p as any).owner);
    const author = toText((p as any).author);

    return authorName === username || owner === username || author === username;
  }

  async function handleDelete(id: string | number) {
    const ok = window.confirm("Ta bort detta inlägg?");
    if (!ok) return;

    try {
      setDeletingId(id);
      await deletePost(id);
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Kunde inte ta bort inlägget");
    } finally {
      setDeletingId(null);
    }
  }

  function saveName() {
    const v = editingName.trim();
    setMyName(v);
    try {
      localStorage.setItem(LS_KEY, v);
    } catch { }
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
            type="button" // ✅ viktigt
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
        <div className="rounded-xl bg-white/60 p-3 text-sm text-gray-700 shadow-soft">
          Laddar…
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700 shadow-soft">
          {error}
        </div>
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
          Visar {mine.length} inlägg för{" "}
          <span className="font-medium">{myName}</span>
        </div>
      )}

      {!loading && !error && myName &&
        (mine.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((p) => {
              const allow = isAdmin || isOwner(p);
              return (
                <PostCard
                  key={p.id}
                  {...p}
                  onDelete={allow ? () => handleDelete(p.id) : undefined}
                  deleting={deletingId === p.id}
                />
              );
            })}
          </div>
        ) : (
          <EmptyState
            title="Inga inlägg hittades"
            description="Du har inte publicerat några inlägg ännu med detta namn."
            actionHref="/create"
            actionLabel="Skapa inlägg"
          />
        ))}
    </div>
  );
}
