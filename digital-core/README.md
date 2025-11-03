# Digital Core (React + Vite)

En modern, responsiv dashboard/anslagstavla som pratar med Orchard Core CMS via REST API eller GraphQL.

## Kom igång

1. Klona repo och gå till mappen `digital-core`.
2. Skapa en `.env` baserat på `.env.example` och ange `VITE_ORCHARD_BASE_URL`.
3. Installera beroenden:
   ```bash
   npm install
   ```
4. Starta dev-servern:
   ```bash
   npm run dev
   ```

## Arkitektur

- `src/components/` UI-komponenter (Navbar, Dashboard, PostList, PostCard, PostForm)
- `src/pages/` Sidor (Home, Posts, Login, NotFound)
- `src/context/` UserContext för användare/roller (mockad auth som standard)
- `src/store/` Zustand store för inläggsdata
- `src/services/` API-klient mot Orchard Core (REST via Axios). Anpassa content-typ och endpoints.

## API mot Orchard Core

Standardinställning använder REST:
- Bas-URL från `VITE_ORCHARD_BASE_URL`
- Hämtning av innehåll via t.ex. `/api/content?contentType=<TYPE>`
- Skapa/uppdatera/ta bort via `/api/content` (kräver autentisering och rättigheter)

Justera `VITE_ORCHARD_POST_TYPE` efter din content-typ i Orchard.

## Roller och autentisering

- Mockad inloggning i `UserContext` och `services/auth.js`.
- Roller: `admin` och `user`.
- Admin kan skapa/redigera/ta bort inlägg. User kan läsa.

## Design

- Tailwind CSS, ljus bakgrund (#f9fafb), mjuka skuggor, rundade hörn.
- Färgade taggar för kategorier.

## Fel- och laddningshantering

- Centralt i `services/api.js` via Axios interceptors.
- UI visar "Laddar..." och felmeddelanden när fetch misslyckas.

## Bygga och köra

- Production build: `npm run build`
- Förhandsgranska: `npm run preview`

## Kommentarer

Koden är kommenterad på svenska för tydlighet. Anpassa gärna API-anrop och content-typer efter din Orchard Core-installation.
