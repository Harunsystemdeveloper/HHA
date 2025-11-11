import { Link } from 'react-router-dom';

type Props = {
  title?: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
};

export default function EmptyState({
  title = 'Inga inlägg att visa',
  description = 'Justera sökningen eller skapa ett nytt inlägg.',
  actionHref = '/create',
  actionLabel = 'Skapa inlägg',
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white/60 p-10 text-center shadow-soft">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
          <path d="M12 4.5c-4.694 0-8.5 2.239-8.5 5 0 1.652 1.232 3.12 3.152 4.047-.089.538-.399 1.368-1.215 2.254-.226.24-.058.62.268.62 1.32 0 2.465-.502 3.217-.92 1.01.202 2.093.314 3.078.314 4.694 0 8.5-2.239 8.5-5s-3.806-5-8.5-5z"/>
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
      <Link
        to={actionHref}
        className="mt-4 inline-flex items-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        {actionLabel}
      </Link>
    </div>
  );
}

