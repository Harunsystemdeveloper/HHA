type Props = {
  category: string;
  className?: string;
};

const styles: Record<string, string> = {
  'Allmänt': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  'Till salu': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Köpes': 'bg-amber-50 text-amber-800 ring-amber-600/20',
  'Tjänster': 'bg-rose-50 text-rose-700 ring-rose-600/20',
  'Evenemang': 'bg-violet-50 text-violet-700 ring-violet-600/20',
  'Hittade/Försvunna': 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  'Övrigt': 'bg-gray-100 text-gray-700 ring-gray-500/20',
};

export default function CategoryBadge({ category, className = '' }: Props) {
  const color = styles[category] || 'bg-brand-50 text-brand-700 ring-brand-600/20';
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${color} ${className}`}
    >
      {category}
    </span>
  );
}

