export type Category =
  | "Alla"
  | "Allmänt"
  | "Till salu"
  | "Köpes"
  | "Tjänster"
  | "Evenemang"
  | "Hittade/Försvunna"
  | "Övrigt";

export interface Post {
  id: string | number;
  title: string;

  // ✅ kan saknas / kan vara annan sträng från backend
  category?: Exclude<Category, "Alla"> | string;

  // ✅ kan saknas när contentType är HtmlDashboardWidget
  description?: string;

  // ✅ HtmlDashboardWidget använder ofta html istället för description
  html?: string;

  imageUrl?: string | null;

  authorName?: string;
  authorAvatarUrl?: string | null;

  // ✅ backend kan ibland returnera owner/author också
  owner?: string;
  author?: string;

  createdAt?: string; // ISO string
  createdUtc?: string; // backend-variant
  publishedUtc?: string; // backend-variant
}

export interface CreatePostInput {
  title: string;

  // ✅ kan saknas för HtmlDashboardWidget om den inte har category-field
  category?: Exclude<Category, "Alla"> | string;

  // ✅ kan saknas för HtmlDashboardWidget (då skickas html)
  description?: string;

  // ✅ stöd för HtmlDashboardWidget
  html?: string;

  imageUrl?: string | null;
  authorName?: string;
}

export const CATEGORIES: Exclude<Category, "Alla">[] = [
  "Allmänt",
  "Till salu",
  "Köpes",
  "Tjänster",
  "Evenemang",
  "Hittade/Försvunna",
  "Övrigt",
];
