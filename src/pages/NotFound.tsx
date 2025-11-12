import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
          <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM9.75 9a1.5 1.5 0 113 0v3a1.5 1.5 0 11-3 0V9zm1.5 7.5a1.25 1.25 0 100-2.5 1.25 1.25 0 000 2.5z" clipRule="evenodd" />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold">Sidan kunde inte hittas</h1>
      <p className="mt-2 text-sm text-gray-600">Kontrollera adressen eller gå tillbaka till startsidan.</p>
      <div className="mt-4">
        <Link to="/" className="rounded-md bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">Till Hem</Link>
      </div>
    </div>
  );
}

