import { api } from './client';
import type { Post, CreatePostInput } from '../types';

const CONTENT_TYPE = (import.meta as any).env?.VITE_CONTENT_TYPE || 'Post';

export async function getPosts(): Promise<Post[]> {
  const { data } = await api.get<Post[]>(`/api/${CONTENT_TYPE}`);
  return data;
}

export async function getPost(id: string | number): Promise<Post> {
  const { data } = await api.get<Post>(`/api/${CONTENT_TYPE}/${id}`);
  return data;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const { data } = await api.post<Post>(`/api/${CONTENT_TYPE}`, input);
  return data;
}

export async function deletePost(id: string | number): Promise<void> {
  await api.delete(`/api/${CONTENT_TYPE}/${id}`);
}

export async function updatePost(
  id: string | number,
  payload: Partial<CreatePostInput & Record<string, unknown>>
): Promise<Post> {
  const { data } = await api.put<Post>(`/api/${CONTENT_TYPE}/${id}`, payload);
  return data;
}
