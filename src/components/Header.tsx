import { Link, NavLink } from "react-router-dom";
import useCurrentUser from "../hooks/useCurrentUser";
import { logout } from "../api/auth";

export default function Header() {
  const { user } = useCurrentUser();
  const isAuth = !!user?.isAuthenticated;
  const isAdmin = Array.isArray(user?.roles) && user.roles.includes("Admin");

  return (
    <header className="sticky top-0 z-10 border-b border-purple-100/60 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent text-white shadow-soft">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M3.75 6.75A2.25 2.25 0 016 4.5h12a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0118 16.5h-5.19l-3.44 2.296A1 1 0 018 17.92V16.5H6a2.25 2.25 0 01-2.25-2.25v-7.5z" />
            </svg>
          </div>
          <div className="leading-tight">
            <div className="text-lg font-semibold text-gray-900">
              Digital Anslagstavla
            </div>
            <div className="text-sm text-gray-600">Din lokala community ✨</div>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="hidden items-center gap-2 md:flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              "rounded-lg px-3 py-2 text-sm " +
              (isActive
                ? "bg-brand-600 text-white"
                : "text-gray-700 hover:bg-gray-100")
            }
          >
            Hem
          </NavLink>

          {isAuth && (
            <>
              <NavLink
                to="/create"
                className={({ isActive }) =>
                  "rounded-lg px-3 py-2 text-sm " +
                  (isActive
                    ? "bg-brand-600 text-white"
                    : "text-gray-700 hover:bg-gray-100")
                }
              >
                Skapa inlägg
              </NavLink>

              <NavLink
                to="/my-posts"
                className={({ isActive }) =>
                  "rounded-lg px-3 py-2 text-sm " +
                  (isActive
                    ? "bg-brand-600 text-white"
                    : "text-gray-700 hover:bg-gray-100")
                }
              >
                Mina inlägg
              </NavLink>
            </>
          )}

          {isAdmin && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                "rounded-lg px-3 py-2 text-sm " +
                (isActive
                  ? "bg-brand-600 text-white"
                  : "text-gray-700 hover:bg-gray-100")
              }
            >
              Admin
            </NavLink>
          )}
        </nav>

        {/* Auth / Actions */}
        <div className="flex items-center gap-2">
          {isAuth ? (
            <>
              <span className="hidden sm:inline rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                Inloggad som <strong>{user?.username ?? "Användare"}</strong>
                {isAdmin ? " · Admin" : ""}
              </span>
              <button
                onClick={async () => {
                  await logout();
                  window.location.replace("/");
                }}
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
              >
                Logga ut
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 hover:bg-gray-100"
              >
                Logga in
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
              >
                Registrera
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
