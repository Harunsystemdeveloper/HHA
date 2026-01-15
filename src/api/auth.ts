export type CurrentUser = {
  isAuthenticated: boolean;
  username: string | null;
  roles: string[];
};

async function readJsonSafe(res: Response): Promise<any | null> {
  try {
    const text = await res.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return { message: text };
    }
  } catch {
    return null;
  }
}

async function okOrThrow(res: Response) {
  if (res.ok) return res;

  const data = await readJsonSafe(res);
  const message =
    data?.error ||
    data?.message ||
    (data?.details ? JSON.stringify(data.details) : "") ||
    (data ? JSON.stringify(data) : "") ||
    `${res.status} ${res.statusText}`;

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
  const res = await fetch("/api/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ usernameOrEmail, password }),
  });

  await okOrThrow(res);
  // Backend returnerar user-info direkt, men vi behöver inte lita på den här.
  return true;
}

export async function logout() {
  const res = await fetch("/api/auth/login", {
    method: "DELETE",
    credentials: "include",
  });

  await okOrThrow(res);
  return true;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  try {
    const res = await fetch("/api/auth/login", { credentials: "include" });

    // ✅ Backend svarar alltid 200 med isAuthenticated true/false
    if (!res.ok) {
      return { isAuthenticated: false, username: null, roles: ["Anonymous"] };
    }

    const data = await readJsonSafe(res);

    // ✅ Om backend säger utloggad
    if (data?.isAuthenticated === false) {
      return { isAuthenticated: false, username: null, roles: ["Anonymous"] };
    }

    const name =
      (data?.username ?? data?.userName ?? data?.UserName ?? null) as
      | string
      | null;

    const rolesRaw = data?.roles ?? data?.Roles ?? [];
    const roles = Array.isArray(rolesRaw) ? rolesRaw.map((r: any) => String(r)) : [];

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
 * Backend: RegisterRequest(string Username, string Email, string Password, string? FirstName, string? LastName, string? Phone)
 */
export async function register(
  username: string,
  email: string,
  phoneNumber: string,
  password: string
) {
  const phone = toE164Sweden(phoneNumber);

  const payload = {
    Username: username,
    Email: email,
    Password: password,
    Phone: phone,
    FirstName: "",
    LastName: "",

    // fallback if binder expects camelCase
    username,
    email,
    password,
    phone,
    firstName: "",
    lastName: "",
  };

  const res = await fetch("/api/auth/register", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  await okOrThrow(res);
  const data = await readJsonSafe(res);
  return data;
}
