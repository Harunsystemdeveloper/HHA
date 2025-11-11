type Props = {
  message?: string;
};

export default function ConfigAlert({ message = 'Kunde inte hämta inlägg' }: Props) {
  const contentType = (import.meta as any).env?.VITE_CONTENT_TYPE || 'Post';

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-soft">
      <div className="font-medium">{message}</div>
      <ul className="mt-2 list-disc space-y-1 pl-5">
        <li>
          Kontrollera att <code className="rounded bg-white/70 px-1 py-0.5">VITE_CONTENT_TYPE</code> i din <code className="rounded bg-white/70 px-1 py-0.5">.env</code> matchar en innehållstyp i Orchard (nu: <span className="font-semibold">{contentType}</span>).
        </li>
        <li>Backend måste vara igång på <code className="rounded bg-white/70 px-1 py-0.5">http://localhost:5001</code> (Vite proxy hanterar /api).</li>
        <li>Behörigheter kan blockera läsning. Be en admin att tillåta GET för denna innehållstyp eller testa en publiktillgänglig typ.</li>
      </ul>
      <div className="mt-3 text-xs text-red-700/80">
        Tips: Lista innehållstyper (som admin): <code className="rounded bg-white/70 px-1 py-0.5">GET /api/system/content-types</code>
      </div>
    </div>
  );
}

