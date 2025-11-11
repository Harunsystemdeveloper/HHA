import { api } from './client';
import type { Post, CreatePostInput } from '../types';

export async function getPosts(): Promise<Post[]> {
  const { data } = await api.get<Post[]>('/api/posts');
  return data;
}

export async function getPost(id: string | number): Promise<Post> {
  const { data } = await api.get<Post>(`/api/posts/${id}`);
  return data;
}

export async function createPost(input: CreatePostInput): Promise<Post> {
  const { data } = await api.post<Post>('/api/posts', input);
  return data;
}

export async function deletePost(id: string | number): Promise<void> {
  await api.delete(`/api/posts/${id}`);
}

