import CategoryBadge from "./CategoryBadge";
import { Link } from "react-router-dom";

const TITLE_DESC_SPLIT = "|||"; // ✅ samma delimiter som i CreatePost

type PostCardProps = {
  id: string | number;
  title: string;
  category?: string; // optional
  description?: unknown; // ✅ kan vara string eller { text: "" } osv
  html?: unknown; // ✅ kan vara html-string
  authorName?: string;
  authorAvatarUrl?: string | null;
  createdAt?: string; // ISO string
  imageUrl?: string | null;
  onDelete?: () => void;
  deleting?: boolean;
  editHref?: string;
};

function timeAgo(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  const ms = Date.now() - d.getTime();
  const m = Math.floor(ms / 60000);
  if (m < 1) return "just nu";
  if (m < 60) return `${m} min sedan`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} tim sedan`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days} d sedan`;
  return d.toLocaleDateString("sv-SE");
}

// ✅ gör om okända format till string
function valueToString(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string") return v;

  if (typeof v === "object") {
    const o = v as any;
    if (typeof o.text === "string") return o.text; // Orchard TextField { text: "..." }
    if (typeof o.html === "string") return o.html;
    if (typeof o.value === "string") return o.value;
  }

  try {
    return String(v);
  } catch {
    return "";
  }
}

// ✅ om det är html: ta bort taggar för preview
function stripHtml(input: string) {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export default function PostCard(props: PostCardProps) {
  const {
    title,
    category,
    description,
    html,
    authorName,
    authorAvatarUrl,
    createdAt,
    imageUrl,
    onDelete,
    deleting,
    editHref,
  } = props;

  const descStr = valueToString(description);
  const htmlStr = valueToString(html);

  // ✅ FIX: stöd för "Titel|||Beskrivning" (HtmlDashboardWidget)
  // Om description saknas men title är packad → plocka ut beskrivningen därifrån
  let displayTitle = title ?? "";
  let packedDesc = "";

  if ((!descStr || !descStr.trim()) && typeof displayTitle === "string" && displayTitle.includes(TITLE_DESC_SPLIT)) {
    const [t, ...rest] = displayTitle.split(TITLE_DESC_SPLIT);
    displayTitle = (t ?? "").trim() || displayTitle;
    packedDesc = rest.join(TITLE_DESC_SPLIT).trim();
  }

  // ✅ Prioritet: description → packedDesc (från title) → html → fallback
  const raw = (descStr || packedDesc || htmlStr || "Ingen beskrivning").trim();

  // ✅ Om råtexten ser ut som html, strip den för preview
  const safeDescription =
    raw.includes("<") && raw.includes(">")
      ? stripHtml(raw)
      : raw;

  const finalDescription = safeDescription.trim() || "Ingen beskrivning";
  const safeCategory = (category ?? "Övrigt").toString().trim() || "Övrigt";

  return (
    <article className="card overflow-hidden">
      {imageUrl ? <img src={imageUrl} alt="" className="h-40 w-full object-cover" /> : null}

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-semibold leading-snug text-gray-900">{displayTitle}</h3>

          <div className="ml-auto flex items-center gap-2">
            <CategoryBadge category={safeCategory} />

            {editHref && (
              <Link
                to={editHref}
                title="Redigera"
                className="rounded-md px-2 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50"
              >
                Redigera
              </Link>
            )}

            {onDelete && (
              <button
                title="Ta bort"
                type="button"
                disabled={deleting}
                onClick={onDelete}
                className="rounded-md px-2 py-1 text-xs font-medium text-rose-700 hover:bg-rose-50 disabled:opacity-50"
              >
                {deleting ? "Tar bort…" : "Ta bort"}
              </button>
            )}
          </div>
        </div>

        <p className="text-sm text-gray-700">
          {finalDescription.length > 140 ? finalDescription.slice(0, 140) + "…" : finalDescription}
        </p>

        <div className="mt-4 flex items-center gap-3 text-sm">
          {authorAvatarUrl ? (
            <img src={authorAvatarUrl} alt="avatar" className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
              {(authorName?.[0] ?? "A").toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <div className="truncate font-medium text-gray-900">{authorName || "Anonym"}</div>
            <div className="text-xs text-gray-500">{timeAgo(createdAt)}</div>
          </div>
        </div>
      </div>
    </article>
  );
}
