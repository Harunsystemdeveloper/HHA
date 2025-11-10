export default function Header() {
  return (
    <header className="sticky top-0 z-10 border-b border-purple-100/60 bg-white/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent text-white shadow-soft">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
            <path d="M3.75 6.75A2.25 2.25 0 016 4.5h12a2.25 2.25 0 012.25 2.25v7.5A2.25 2.25 0 0118 16.5h-5.19l-3.44 2.296A1 1 0 018 17.92V16.5H6a2.25 2.25 0 01-2.25-2.25v-7.5z"/>
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-lg font-semibold text-gray-900">Digital Anslagstavla</div>
          <div className="text-sm text-gray-600">Din lokala community ✨</div>
        </div>
      </div>
    </header>
  );
}

