import CategoryBadge from "./CategoryBadge";
import { Link } from "react-router-dom";

type PostCardProps = {
  id: string | number;
  title: string;
  category?: string; // ✅ ändrat: optional
  description?: string; // ✅ kan saknas
  html?: string; // ✅ stöd för HtmlDashboardWidget
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

  // ✅ om description saknas men html finns: gör en enkel preview
  const rawText = (description ?? html ?? "Ingen beskrivning").toString();
  const safeDescription = rawText.trim() || "Ingen beskrivning";

  const safeCategory = (category ?? "Övrigt").toString().trim() || "Övrigt";

  return (
    <article className="card overflow-hidden">
      {imageUrl ? <img src={imageUrl} alt="" className="h-40 w-full object-cover" /> : null}

      <div className="p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <h3 className="text-[17px] font-semibold leading-snug text-gray-900">{title}</h3>

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
          {safeDescription.length > 140 ? safeDescription.slice(0, 140) + "…" : safeDescription}
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
