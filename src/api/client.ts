import axios from 'axios';

// Use same-origin relative paths by default (proxied in Vite dev).
// If you later want to point to another origin, set Vite env `VITE_API_BASE_URL`.
const baseURL = (typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_API_BASE_URL) || '';

export const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

export function handleError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return (
      // Try common places first
      (error.response?.data as any)?.message ||
      error.response?.statusText ||
      error.message ||
      'Något gick fel'
    );
  }
  return 'Något gick fel';
}

