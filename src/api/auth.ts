// src/api/auth.ts

export type CurrentUser = {
  isAuthenticated: boolean;
  username: string | null;
  roles: string[];
};

async function okOrThrow(res: Response) {
  if (res.ok) return res;

  let message = `${res.status} ${res.statusText}`;

  try {
    const text = await res.text();
    if (text) {
      try {
        const data = JSON.parse(text);
        message =
          data?.error ||
          data?.message ||
          (data?.details ? JSON.stringify(data.details) : "") ||
          JSON.stringify(data);
      } catch {
        message = text; // plain text
      }
    }
  } catch {
    // ignore
  }

  throw new Error(message);
}

// Gör om svenskt nummer till E.164 (+46...)
function toE164Sweden(input: string) {
  const raw = (input ?? "").trim().replace(/\s+/g, "").replace(/-/g, "");
  if (!raw) return null;

  if (raw.startsWith("+")) return raw;
  if (raw.startsWith("00")) return "+" + raw.slice(2);
  if (raw.startsWith("0")) return "+46" + raw.slice(1);
  if (raw.startsWith("7")) return "+46" + raw;

  return raw;
}

export async function login(usernameOrEmail: string, password: string) {
  await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
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
    const name = (data?.username ?? data?.userName ?? null) as string | null;
    const roles: string[] = Array.isArray(data?.roles) ? data.roles : [];

    return {
      isAuthenticated: true,
      username: name,
      roles: roles.length ? roles : ["Authenticated"],
    };
  } catch {
    return { isAuthenticated: false, username: null, roles: ["Anonymous"] };
  }
}

/**
 * Registrera ny användare (matchar backend RegisterRequest)
 * Backend: RegisterRequest(string Username, string Email, string Password, string? FirstName, string? LastName, string? Phone)
 */
export async function register(
  username: string,
  email: string,
  phoneNumber: string,
  password: string
) {
  const phone = toE164Sweden(phoneNumber);

  const res = await fetch("/api/auth/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },

    // Jag skickar med exakt samma property names som i C# recorden (snyggare för felsökning)
    body: JSON.stringify({
      Username: username,
      Email: email,
      Password: password,
      Phone: phone, // null om tom
      FirstName: "",
      LastName: "",
    }),
  });

  await okOrThrow(res);

  // Returnera svar (bra för debug)
  try {
    return await res.json();
  } catch {
    return null;
  }
}
