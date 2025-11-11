export default function Footer() {
  const env = (import.meta as any).env || {};
  const email = (env.VITE_CONTACT_EMAIL as string) || 'info@anslagstavla.se';
  const phone = (env.VITE_CONTACT_PHONE as string) || '010-123 45 67';
  const address = (env.VITE_CONTACT_ADDRESS as string) || 'Storgatan 1, 123 45 Stockholm';
  const hours = (env.VITE_CONTACT_HOURS as string) || 'Mån-Fre 09:00-17:00';
  const url = (env.VITE_CONTACT_URL as string) || undefined;
  const contactHref = url ? url : `mailto:${email}`;
  return (
    <footer className="mt-10 border-t border-purple-100/60 bg-white/70">
      <div className="mx-auto max-w-6xl px-4 py-6 text-xs text-gray-600">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Digital Anslagstavla</span>
          <span className="text-gray-500">Byggd med React + Vite + Orchard Core</span>
        </div>
        <div className="mt-4 flex justify-end">
          <div className="text-right">
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Kontakt</div>
            <ul className="space-y-1">
              <li className="flex items-center justify-end gap-2">
                <a href={`mailto:${email}`} className="hover:text-brand-700">{email}</a>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-brand-50 text-brand-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M1.5 8.67V18A2.25 2.25 0 003.75 20.25h16.5A2.25 2.25 0 0022.5 18V8.67l-9.06 5.29a2.25 2.25 0 01-2.28 0L1.5 8.67z"/><path d="M22.5 6.75V6A2.25 2.25 0 0020.25 3.75H3.75A2.25 2.25 0 001.5 6v.75l10.2 5.96a.75.75 0 00.78 0L22.5 6.75z"/></svg>
                </span>
              </li>
              <li className="flex items-center justify-end gap-2">
                <a href={contactHref} className="hover:text-brand-700">{phone}</a>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-brand-50 text-brand-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M2.25 3.75A1.5 1.5 0 013.75 2.25h2.955c.66 0 1.24.43 1.42 1.065l.72 2.52a1.5 1.5 0 01-.435 1.53l-1.23 1.23a16.5 16.5 0 006.15 6.15l1.23-1.23a1.5 1.5 0 011.53-.435l2.52.72c.635.18 1.065.76 1.065 1.42V20.25a1.5 1.5 0 01-1.5 1.5H18A15.75 15.75 0 012.25 6V5.25a1.5 1.5 0 011.5-1.5z"/></svg>
                </span>
              </li>
              <li className="flex items-center justify-end gap-2">
                <span>{address}</span>
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-brand-50 text-brand-700">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path fillRule="evenodd" d="M11.47 3.84a.75.75 0 011.06 0l7.5 7.5a.75.75 0 01-1.06 1.06l-.22-.22V20a.75.75 0 01-.75.75H14a.75.75 0 01-.75-.75v-3.75H10.5V20a.75.75 0 01-.75.75H5a.75.75 0 01-.75-.75v-7.82l-.22.22a.75.75 0 01-1.06-1.06l7.5-7.5z" clipRule="evenodd"/></svg>
                </span>
              </li>
            </ul>
            <div className="mt-3 text-gray-700">
              <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Support</div>
              <div>{hours}</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
