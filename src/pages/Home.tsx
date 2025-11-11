import { useState } from 'react';

const CATEGORIES = [
  'Alla',
  'Allmänt',
  'Till salu',
  'Köpes',
  'Tjänster',
  'Evenemang',
  'Hittade/Försvunna',
  'Övrigt',
] as const;

export default function Home() {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<(typeof CATEGORIES)[number]>('Alla');

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="rounded-2xl border border-purple-200/60 bg-white/60 p-3 shadow-soft">
        <div className="relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök inlägg..."
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 pr-24 text-[15px] shadow-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700">
            Sök
          </button>
        </div>
      </div>

      {/* Filters */}
      <section className="rounded-2xl border border-purple-200/60 bg-white/60 p-4 shadow-soft">
        <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
          <span>🛠️</span>
          <span>Filtrera efter kategori</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              className={`chip ${active === c ? 'chip-active' : 'chip-inactive'}`}
              onClick={() => setActive(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Counter + grid placeholder (will be data-driven later) */}
      <div className="rounded-xl bg-white/60 p-3 text-sm text-gray-700 shadow-soft">
        Visar 0 inlägg
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Cards kommer här när API kopplas */}
      </div>
    </div>
  );
}

