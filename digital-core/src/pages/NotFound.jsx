export default function NotFound() {
  return (
    <div className="text-center py-16">
      <h1 className="text-2xl font-semibold">Sidan hittades inte</h1>
      <p className="mt-2 text-gray-600">Kontrollera adressen eller gå tillbaka till startsidan.</p>
      <a href="/" className="inline-block mt-4 px-4 py-2 rounded-md bg-gray-800 text-white">Hem</a>
    </div>
  )
}
