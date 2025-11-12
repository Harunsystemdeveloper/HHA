// src/api/auth.ts
export type CurrentUser = {
  isAuthenticated: boolean;
  username: string | null;
  roles: string[];
};

function okOrThrow(res: Response) {
  if (!res.ok) throw new Error(res.statusText);
  return res;
}

export async function login(usernameOrEmail: string, password: string) {
  await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",                 // <-- viktigt för cookies
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernameOrEmail, password }),
  }).then(okOrThrow);
}

export async function logout() {
  await fetch("/api/auth/login", {
    method: "DELETE",
    credentials: "include",
  }).then(okOrThrow);
}

export async function getCurrentUser(): Promise<CurrentUser> {
  try {
    const res = await fetch("/api/auth/login", { credentials: "include" });
    if (!res.ok) {
      return { isAuthenticated: false, username: null, roles: ["Anonymous"] };
    }
    const data = await res.json();

    // Tålig mappning av fält från backend
    const isAuth =
      Boolean(data?.isAuthenticated) ||
      Boolean(data?.authenticated) ||
      Boolean(data?.userName) ||
      Boolean(data?.username);

    const name = (data?.username ?? data?.userName ?? null) as string | null;

    const roles: string[] = Array.isArray(data?.roles)
      ? data.roles
      : data?.role
        ? [data.role]
        : [];

    return { isAuthenticated: isAuth, username: name, roles };
  } catch {
    return { isAuthenticated: false, username: null, roles: ["Anonymous"] };
  }
}

/**
 * Registrera ny användare.
 * Justera body-fälten så de matchar din backend (userName vs username osv).
 * Vanligtvis är endpointen /api/auth/register.
 */
export async function register(
  userName: string,
  email: string,
  phoneNumber: string,
  password: string
) {
  await fetch("/api/auth/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userName, email, phoneNumber, password }),
  }).then(okOrThrow);
}
