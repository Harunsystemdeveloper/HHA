// src/utils/auth.ts

export type AuthState = {
  isAuthenticated: boolean;
  user: any | null;
};

async function okOrThrow(res: Response) {
  if (res.ok) return res;

  let msg = `${res.status} ${res.statusText}`;
  try {
    const data = await res.json();
    msg = data?.error ?? JSON.stringify(data) ?? msg;
  } catch {
    // ibland kommer HTML (Orchard 404-sida), då låter vi msg vara
    try {
      const text = await res.text();
      if (text) msg = text.slice(0, 200);
    } catch { }
  }

  throw new Error(msg);
}

// Gör om svenskt nummer till E.164 (+46...)
function toE164Sweden(input: string) {
  const raw = (input ?? "").trim().replace(/\s+/g, "").replace(/-/g, "");
  if (!raw) return "";

  if (raw.startsWith("+")) return raw;
  if (raw.startsWith("00")) return "+" + raw.slice(2);
  if (raw.startsWith("0")) return "+46" + raw.slice(1);
  if (raw.startsWith("7")) return "+46" + raw;

  return raw;
}

/**
 * GET /api/auth/login
 * returnerar 200 om inloggad annars 401
 */
export async function checkAuth(): Promise<AuthState> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) return { isAuthenticated: false, user: null };

    const data = await res.json();
    return { isAuthenticated: true, user: data };
  } catch {
    return { isAuthenticated: false, user: null };
  }
}

/**
 * POST /api/auth/login
 */
export async function login(usernameOrEmail: string, password: string) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include", // ✅ superviktigt för cookies
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernameOrEmail, password }),
  });

  await okOrThrow(res);
}

/**
 * POST /api/auth/register
 * Backend tar: Username, Email, Password, FirstName?, LastName?, Phone?
 */
export async function register(
  username: string,
  email: string,
  phoneNumber: string,
  password: string,
  firstName?: string,
  lastName?: string
) {
  const phone = toE164Sweden(phoneNumber);

  const res = await fetch("/api/auth/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      email,
      password,
      phone,
      firstName: firstName ?? null,
      lastName: lastName ?? null,
    }),
  });

  await okOrThrow(res);
}

/**
 * DELETE /api/auth/login
 */
export async function logout() {
  try {
    const res = await fetch("/api/auth/login", {
      method: "DELETE",
      credentials: "include",
    });
    await okOrThrow(res);
    return true;
  } catch {
    return false;
  }
}
