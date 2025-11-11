import type { Category } from '../types';
import { CATEGORIES as CAT_LIST } from '../types';
import { getChipClasses } from '../styles/categoryStyles';

type Props = {
  active: Category;
  onChange: (c: Category) => void;
};

export default function FilterChips({ active, onChange }: Props) {
  const all: Category[] = ['Alla', ...CAT_LIST];
  return (
    <div className="flex flex-wrap gap-2">
      {all.map((c) => (
        <button
          key={c}
          className={getChipClasses(c, active === c)}
          onClick={() => onChange(c)}
        >
          {c}
        </button>
      ))}
    </div>
  );
}
