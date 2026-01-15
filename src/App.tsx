import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./App.css";

import type { CurrentUser } from "./api/auth";
import { getCurrentUser } from "./api/auth";

const anonymousUser: CurrentUser = {
  isAuthenticated: false,
  username: null,
  roles: ["Anonymous"],
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser>(anonymousUser);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const location = useLocation();

  // ✅ Refresha auth-status när route ändras (t.ex. efter login/logout)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsAuthLoading(true);
      try {
        const u = await getCurrentUser();
        if (!cancelled) setCurrentUser(u);
      } finally {
        if (!cancelled) setIsAuthLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      {/* ✅ Header får user + setter */}
      <Header
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        isAuthLoading={isAuthLoading}
      />

      <main className="mx-auto max-w-6xl p-4">
        <Outlet context={{ currentUser, setCurrentUser, isAuthLoading }} />
      </main>

      <Footer />
    </div>
  );
}
