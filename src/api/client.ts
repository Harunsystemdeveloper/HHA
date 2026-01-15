import axios from "axios";

// Use same-origin relative paths by default (proxied in Vite dev).
// If you later want to point to another origin, set Vite env `VITE_API_BASE_URL`.
const baseURL = import.meta?.env?.VITE_API_BASE_URL ?? "";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },

  // ✅ SUPER VIKTIGT: annars skickas inte auth-cookie -> 401/403 när du är inloggad
  withCredentials: true,
});

export function handleError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data: any = error.response?.data;

    return (
      data?.message ||
      data?.error ||
      (data?.details ? JSON.stringify(data.details) : "") ||
      error.response?.statusText ||
      error.message ||
      "Något gick fel"
    );
  }
  return "Något gick fel";
}
