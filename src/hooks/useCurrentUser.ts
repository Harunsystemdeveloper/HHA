import { useEffect, useState } from 'react';
import { getCurrentUser, type CurrentUser } from '../api/auth';

export default function useCurrentUser() {
  const [user, setUser] = useState<CurrentUser>({ isAuthenticated: false, username: null, roles: ['Anonymous'] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const u = await getCurrentUser();
      if (mounted) setUser(u);
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return { user, loading };
}

