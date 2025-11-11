import { getBadgeClasses } from '../styles/categoryStyles';

type Props = {
  category: string;
  className?: string;
};
export default function CategoryBadge({ category, className = '' }: Props) {
  const color = getBadgeClasses(category);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${color} ${className}`}
    >
      {category}
    </span>
  );
}
