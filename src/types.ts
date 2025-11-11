export type Category =
  | 'Alla'
  | 'Allmänt'
  | 'Till salu'
  | 'Köpes'
  | 'Tjänster'
  | 'Evenemang'
  | 'Hittade/Försvunna'
  | 'Övrigt';

export interface Post {
  id: string | number;
  title: string;
  category: Exclude<Category, 'Alla'> | string;
  description: string;
  imageUrl?: string | null;
  authorName?: string;
  authorAvatarUrl?: string | null;
  createdAt?: string; // ISO string
}

export interface CreatePostInput {
  title: string;
  category: Exclude<Category, 'Alla'> | string;
  description: string;
  imageUrl?: string | null;
  authorName?: string;
}

export const CATEGORIES: Exclude<Category, 'Alla'>[] = [
  'Allmänt',
  'Till salu',
  'Köpes',
  'Tjänster',
  'Evenemang',
  'Hittade/Försvunna',
  'Övrigt',
];

