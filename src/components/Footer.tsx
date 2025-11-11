export default function Footer() {
  return (
    <footer className="mt-10 border-t border-purple-100/60 bg-white/70">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-600">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Digital Anslagstavla</span>
          <span className="text-gray-500">Byggd med React + Vite + Orchard Core</span>
        </div>
      </div>
    </footer>
  );
}

