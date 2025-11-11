export type CategoryKey =
  | 'Allmänt'
  | 'Till salu'
  | 'Köpes'
  | 'Tjänster'
  | 'Evenemang'
  | 'Hittade/Försvunna'
  | 'Övrigt';

const badgeMap: Record<CategoryKey, string> = {
  'Allmänt': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  'Till salu': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'Köpes': 'bg-amber-50 text-amber-800 ring-amber-600/20',
  'Tjänster': 'bg-rose-50 text-rose-700 ring-rose-600/20',
  'Evenemang': 'bg-violet-50 text-violet-700 ring-violet-600/20',
  'Hittade/Försvunna': 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  'Övrigt': 'bg-gray-100 text-gray-700 ring-gray-500/20',
};

const chipMapInactive: Record<CategoryKey, string> = {
  'Allmänt': 'border-blue-200 hover:bg-blue-50',
  'Till salu': 'border-emerald-200 hover:bg-emerald-50',
  'Köpes': 'border-amber-200 hover:bg-amber-50',
  'Tjänster': 'border-rose-200 hover:bg-rose-50',
  'Evenemang': 'border-violet-200 hover:bg-violet-50',
  'Hittade/Försvunna': 'border-cyan-200 hover:bg-cyan-50',
  'Övrigt': 'border-gray-300 hover:bg-gray-50',
};

const chipMapActive: Record<CategoryKey, string> = {
  'Allmänt': 'bg-blue-600 text-white border-blue-600',
  'Till salu': 'bg-emerald-600 text-white border-emerald-600',
  'Köpes': 'bg-amber-500 text-white border-amber-500',
  'Tjänster': 'bg-rose-600 text-white border-rose-600',
  'Evenemang': 'bg-violet-600 text-white border-violet-600',
  'Hittade/Försvunna': 'bg-cyan-600 text-white border-cyan-600',
  'Övrigt': 'bg-gray-700 text-white border-gray-700',
};

export function getBadgeClasses(category: string): string {
  const key = category as CategoryKey;
  return badgeMap[key] || 'bg-brand-50 text-brand-700 ring-brand-600/20';
}

export function getChipClasses(category: string, active: boolean): string {
  const key = category as CategoryKey;
  const base = 'chip ';
  if (active) return base + (chipMapActive[key] || 'chip-active');
  return base + 'bg-white text-gray-700 ' + (chipMapInactive[key] || 'chip-inactive');
}

