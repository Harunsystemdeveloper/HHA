import type { Post } from '../types';

function gradientImage(from: string, to: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='320'>
    <defs>
      <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
        <stop offset='0%' stop-color='${from}'/>
        <stop offset='100%' stop-color='${to}'/>
      </linearGradient>
    </defs>
    <rect width='100%' height='100%' fill='url(#g)'/>
    <circle cx='120' cy='60' r='80' fill='rgba(255,255,255,0.15)'/>
    <circle cx='720' cy='280' r='100' fill='rgba(255,255,255,0.12)'/>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// Demo-inlägg för varje kategori (färgglada headerbilder via SVG‑gradienter)
export const demoPosts: Post[] = [
  {
    id: 'd1',
    title: 'Välkommen till tavlan!',
    category: 'Allmänt',
    description: 'Dela nyheter, tips och frågor med grannarna här.',
    authorName: 'Admin',
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    imageUrl: gradientImage('#60a5fa', '#a78bfa'), // blå → lila
  },
  {
    id: 'd2',
    title: 'Cykel i gott skick',
    category: 'Till salu',
    description: 'Damcykel 26”, servad i år. Pris 1200 kr.',
    authorName: 'Anna Karlsson',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    imageUrl: gradientImage('#34d399', '#10b981'), // gröna nyanser
  },
  {
    id: 'd3',
    title: 'Söker flyttlådor',
    category: 'Köpes',
    description: 'Behöver 5–10 välbehållna flyttlådor till helgen.',
    authorName: 'Per Johansson',
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    imageUrl: gradientImage('#fbbf24', '#f59e0b'), // gula/amber
  },
  {
    id: 'd4',
    title: 'Snabb hjälp med uppsättning av hylla',
    category: 'Tjänster',
    description: 'Har borrmaskin och vattenpass. Hör av dig!',
    authorName: 'Maria Svensson',
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    imageUrl: gradientImage('#fb7185', '#f472b6'), // rosa
  },
  {
    id: 'd5',
    title: 'Grannfest på lördag!',
    category: 'Evenemang',
    description: 'Korvgrillning i parken kl 15. Ta med filt.',
    authorName: 'Föreningen',
    createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(),
    imageUrl: gradientImage('#a78bfa', '#8b5cf6'), // lila
  },
  {
    id: 'd6',
    title: 'Hittat: Nyckelknippa vid porten',
    category: 'Hittade/Försvunna',
    description: 'Tre nycklar med röd bricka. Finns hos mig i lgh 2B.',
    authorName: 'Lars',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: gradientImage('#22d3ee', '#06b6d4'), // cyan
  },
  {
    id: 'd7',
    title: 'Låna slagborr?',
    category: 'Övrigt',
    description: 'Behöver låna slagborr i 1 timme på söndag.',
    authorName: 'Sara',
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    imageUrl: gradientImage('#94a3b8', '#64748b'), // grå/blå
  },
];
