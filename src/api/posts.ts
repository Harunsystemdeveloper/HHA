import { api, handleError } from "./client";
import type { Post, CreatePostInput } from "../types";

const CONTENT_TYPE = import.meta?.env?.VITE_CONTENT_TYPE || "Post";

function normalizeList(payload: any): Post[] {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.value)) return payload.value;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function normalizeSingle(payload: any): Post {
  // om backend skulle wrapa objektet
  return (payload?.item ?? payload?.data ?? payload) as Post;
}

export async function getPosts(): Promise<Post[]> {
  try {
    const { data } = await api.get<any>(`/api/${CONTENT_TYPE}`);
    return normalizeList(data);
  } catch (e) {
    // ✅ VIKTIGT: kasta vidare så Home/MyPosts kan hantera (demo / error)
    const msg = handleError(e);
    console.error("getPosts failed:", msg);
    throw new Error(msg);
  }
}

export async function getPost(id: string | number): Promise<Post> {
  const { data } = await api.get<any>(`/api/${CONTENT_TYPE}/${id}`);
  return normalizeSingle(data);
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const { data } = await api.post<any>(`/api/${CONTENT_TYPE}`, input);
  return normalizeSingle(data);
}

export async function deletePost(id: string | number): Promise<void> {
  await api.delete(`/api/${CONTENT_TYPE}/${id}`);
}

export async function updatePost(
  id: string | number,
  payload: Partial<CreatePostInput & Record<string, unknown>>
): Promise<Post> {
  const { data } = await api.put<any>(`/api/${CONTENT_TYPE}/${id}`, payload);
  return normalizeSingle(data);
}
