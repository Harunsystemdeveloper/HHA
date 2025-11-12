import { useEffect, useState } from "react";
import { getCurrentUser, type CurrentUser } from "../api/auth";

/**
 * Hanterar nuvarande användare baserat på ditt auth-API.
 * 
 * CurrentUser från ../api/auth förväntas se ut så här:
 * {
 *   isAuthenticated: boolean;
 *   username: string | null;
 *   roles: string[]; // t.ex. ["Anonymous"], ["User"], ["Admin"]
 * }
 */

export default function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser>({
    isAuthenticated: false,
    username: null,
    roles: ["Anonymous"],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        if (mounted && currentUser) {
          setUser(currentUser);
        }
      } catch (error) {
        console.error("Fel vid hämtning av användare:", error);
        if (mounted) {
          setUser({
            isAuthenticated: false,
            username: null,
            roles: ["Anonymous"],
          });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, []);

  /**
   * Funktion för att logga ut användaren lokalt.
   * (När vi senare lägger till backend-logout så anropas den härifrån.)
   */
  const logout = () => {
    localStorage.removeItem("auth_token"); // eller anpassa efter din auth-struktur
    setUser({
      isAuthenticated: false,
      username: null,
      roles: ["Anonymous"],
    });
  };

  return { user, loading, logout };
}
