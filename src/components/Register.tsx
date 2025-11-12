import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register as apiRegister } from "../api/auth"; // ✅ ändrat från ../utils/auth

export default function Register() {
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOk("");
    setIsLoading(true);
    try {
      await apiRegister(userName, email, phoneNumber, password);
      setOk("Konto skapat! Du kan nu logga in.");
      setTimeout(() => navigate("/login", { replace: true }), 1000);
    } catch (err: any) {
      setError(err.message || "Kunde inte skapa konto.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-white to-purple-50/40">
      <div className="mx-auto grid max-w-md place-items-center px-4 py-10">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent text-white shadow-soft">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" className="h-6 w-6">
              <path d="M3.75 6.75A2.25 2.25 0 016 4.5h12a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0118 16.5h-5.19l-3.44 2.296A1 1 0 018 17.92V16.5H6a2.25 2.25 0 01-2.25-2.25v-7.5z" />
            </svg>
          </div>
          <div className="leading-tight">
            <h1 className="text-xl font-semibold text-gray-900">Skapa konto</h1>
            <p className="text-sm text-gray-600">Bli en del av Digital Anslagstavla</p>
          </div>
        </div>

        <div className="w-full rounded-2xl border border-purple-100/70 bg-white/90 p-6 shadow-soft backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Användarnamn</label>
              <input
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:ring-2 ring-brand-300"
                placeholder="t.ex. hamze1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">E-post</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:ring-2 ring-brand-300"
                placeholder="namn@exempel.se"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Mobilnummer</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:ring-2 ring-brand-300"
                placeholder="070 123 45 67"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Lösenord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm focus:ring-2 ring-brand-300"
                placeholder="Minst 6 tecken"
              />
            </div>

            {error && <div className="text-red-600 text-sm">{error}</div>}
            {ok && <div className="text-green-600 text-sm">{ok}</div>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {isLoading ? "Skapar konto..." : "Registrera"}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-gray-500">
            Har du redan ett konto?{" "}
            <Link to="/login" className="text-brand-700 hover:underline">
              Logga in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
