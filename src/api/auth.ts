export type CurrentUser = {
  isAuthenticated: boolean;
  username: string | null;
  roles: string[];
};

export async function getCurrentUser(): Promise<CurrentUser> {
  try {
    const res = await fetch('/api/auth/login', {
      credentials: 'include',
    });
    if (!res.ok) return { isAuthenticated: false, username: null, roles: ['Anonymous'] };
    const data = await res.json();
    return {
      isAuthenticated: Boolean(data?.isAuthenticated),
      username: (data?.username ?? null) as string | null,
      roles: Array.isArray(data?.roles) ? data.roles : [],
    };
  } catch {
    return { isAuthenticated: false, username: null, roles: ['Anonymous'] };
  }
}

