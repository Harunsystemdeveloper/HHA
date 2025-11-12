import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login as apiLogin } from "../api/auth";

interface LoginProps {
  onLoginSuccess?: () => void; // valfri
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      await apiLogin(username, password);
      onLoginSuccess?.();
      navigate("/", { replace: true });
    } catch {
      setError("Fel användarnamn eller lösenord.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-white to-purple-50/40">
      <div className="mx-auto grid max-w-md place-items-center px-4 py-10">
        {/* Header/brand */}
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent text-white shadow-soft">
            {/* Ikon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6"
              aria-hidden="true"
            >
              <path d="M3.75 6.75A2.25 2.25 0 016 4.5h12a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0118 16.5h-5.19l-3.44 2.296A1 1 0 018 17.92V16.5H6a2.25 2.25 0 01-2.25-2.25v-7.5z" />
            </svg>
          </div>
          <div className="leading-tight">
            <h1 className="text-xl font-semibold text-gray-900">Logga in</h1>
            <p className="text-sm text-gray-600">Välkommen tillbaka till din community</p>
          </div>
        </div>

        {/* Card */}
        <div className="w-full rounded-2xl border border-purple-100/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="mb-1 block text-sm font-medium text-gray-800">
                Användarnamn eller e-post
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none ring-brand-300 placeholder:text-gray-400 focus:ring-2"
                placeholder="t.ex. tom eller tom@exempel.se"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-800">
                Lösenord
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none ring-brand-300 placeholder:text-gray-400 focus:ring-2"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-50"
            >
              {isLoading ? "Loggar in…" : "Logga in"}
            </button>
          </form>

          {/* Hjälprad */}
          <div className="mt-4 space-y-1 text-center text-xs text-gray-500">
            <p>
              Standardkonto: <span className="font-medium text-gray-700">tom</span> /{" "}
              <span className="font-medium text-gray-700">Abcd1234!</span>
            </p>
            <p>
              Inget konto?{" "}
              <Link to="/register" className="font-medium text-brand-700 hover:underline">
                Skapa konto
              </Link>{" "}
              (kommer snart)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
