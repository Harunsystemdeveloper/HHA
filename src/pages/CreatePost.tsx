import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPost } from "../api/posts";
import { CATEGORIES, type CreatePostInput } from "../types";
import useCurrentUser from "../hooks/useCurrentUser";

export default function CreatePost() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();

  const contentType = (import.meta as any).env?.VITE_CONTENT_TYPE || "Post";

  const contentTypeLower = useMemo(() => String(contentType ?? "").toLowerCase(), [contentType]);
  const isPet = contentTypeLower === "pet";
  const isHtmlWidget = contentTypeLower === "htmldashboardwidget";

  const [form, setForm] = useState<CreatePostInput>({
    title: "",
    category: CATEGORIES[0],
    description: "",
    imageUrl: "",
    authorName: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [details, setDetails] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setDetails(null);

    try {
      // ✅ sätt authorName smart
      const effectiveAuthor =
        form.authorName?.trim() ||
        (user?.isAuthenticated ? user.username : "") ||
        localStorage.getItem("da_authorName") ||
        "Anonym";

      // ✅ se till att kategori alltid finns (för filter/UI)
      const effectiveCategory = (form.category?.toString().trim() || "Övrigt") as string;

      // spara lokalt (för MyPosts-filter)
      try {
        localStorage.setItem("da_authorName", effectiveAuthor);
      } catch { }

      let payload: any = { ...form };

      // ✅ PET-logik (behåll)
      if (isPet) {
        payload = { title: form.title, species: effectiveCategory };
      } else if (isHtmlWidget) {
        // ✅ HtmlDashboardWidget: bädda in meta så du alltid kan visa/filtera
        const safeTitle = form.title?.trim() || "Untitled";
        const safeDesc = form.description?.trim() || "";

        payload = {
          title: safeTitle,

          // försök även skicka "category/authorName" (om contentType har fälten)
          // FieldValidator/RESERVED_FIELDS avgör om det accepteras.
          category: effectiveCategory,
          authorName: effectiveAuthor,

          html: `
            <div data-category="${effectiveCategory}" data-author="${effectiveAuthor}">
              <h2>${safeTitle}</h2>
              ${safeDesc ? `<p>${safeDesc}</p>` : `<p>Ingen beskrivning</p>`}
              <p><small>Kategori: ${effectiveCategory} • Skapad av: ${effectiveAuthor}</small></p>
            </div>
          `.trim(),
        };
      } else {
        // ✅ vanliga posts: skicka fälten normalt
        payload.category = effectiveCategory;
        payload.authorName = effectiveAuthor;
      }

      await createPost(payload);
      navigate("/");
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : "";
      const data = err?.response?.data;

      if (msg.toLowerCase().includes("runtime binding")) {
        setError("Backend kraschade (null reference). Kontrollera content type + payload.");
        setDetails(msg);
      } else if (data?.error) {
        setError(data.error || "Kunde inte skapa inlägg");
        const extras: string[] = [];
        if (Array.isArray(data.invalidFields) && data.invalidFields.length) {
          extras.push(`Ogiltiga fält: ${data.invalidFields.join(", ")}`);
        }
        if (Array.isArray(data.validFields) && data.validFields.length) {
          extras.push(`Tillåtna fält: ${data.validFields.join(", ")}`);
        }
        if (extras.length) setDetails(extras.join(" • "));
      } else {
        setError("Kunde inte skapa inlägg");
        if (msg) setDetails(msg);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-2xl font-semibold">Skapa inlägg</h1>

      <div className="mb-4 text-xs text-gray-500">
        ContentType: <span className="font-mono">{String(contentType)}</span>
      </div>

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

        {/* ✅ kategori ska ALLTID finnas */}
        <div>
          <label className="block text-sm font-medium text-gray-700">{isPet ? "Art (species)" : "Kategori"}</label>
          <select
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            value={String(form.category ?? "Övrigt")}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {(isPet ? ["dog", "cat", "other"] : CATEGORIES).map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* beskrivning */}
        {!isPet && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Beskrivning</label>
            <textarea
              required={false}
              rows={6}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              value={form.description ?? ""}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
        )}

        {/* Bild URL bara för vanliga Post */}
        {!isPet && !isHtmlWidget && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Bild-URL (valfritt)</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
              value={form.imageUrl ?? ""}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">Namn (visas på inlägget)</label>
          <input
            className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
            value={form.authorName ?? ""}
            onChange={(e) => setForm({ ...form, authorName: e.target.value })}
            placeholder={user?.isAuthenticated ? `Default: ${user.username}` : "Skriv namn (valfritt)"}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-white shadow-soft hover:bg-brand-700 disabled:opacity-50"
          >
            {submitting ? "Skickar…" : "Publicera"}
          </button>
        </div>
      </form>
    </div>
  );
}
