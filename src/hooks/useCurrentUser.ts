import { useEffect, useRef, useState } from "react";
import { getCurrentUser, logout as apiLogout, type CurrentUser } from "../api/auth";

const ANON: CurrentUser = {
  isAuthenticated: false,
  username: null,
  roles: ["Anonymous"],
};

export default function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser>(ANON);
  const [loading, setLoading] = useState(true);

  // ✅ riktig mounted-guard
  const mountedRef = useRef(true);

  async function refresh() {
    setLoading(true);
    try {
      const currentUser = await getCurrentUser();
      if (mountedRef.current) setUser(currentUser);
    } catch {
      if (mountedRef.current) setUser(ANON);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }

  useEffect(() => {
    mountedRef.current = true;
    refresh();
    return () => {
      mountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // även om logout misslyckas: nolla UI så användaren inte fastnar
    } finally {
      // ✅ direkt nolla + refresh för att synca med cookie/server
      if (mountedRef.current) setUser(ANON);
      await refresh();
    }
  };

  return { user, loading, logout, refresh };
}
