# Digital Anslagstavla – Roller, innehållstyper och flöde (LR10/LR13/LR15)

Den här korta guiden beskriver hur du sätter upp roller/behörigheter i Orchard, skapar innehållstyper (content types), vilket publiceringsflöde som gäller, och hur React‑frontenden pratar med API:t.

## Roller och behörigheter

Mål: Två huvudsakliga roller – `User` och `Admin`.

- Admin
  - Full behörighet på alla innehållstyper: Create, Edit, Publish, Delete, Approve, Read.
  - Full åtkomst till REST API (GET/POST/PUT/DELETE) för alla typer.
- User
  - Kan skapa nytt innehåll (Create) för angivna typer.
  - Kan läsa (Read) alla publika poster.
  - Kan redigera och ta bort sina egna poster (Edit Own, Delete Own).
  - Kan INTE publicera – skapat innehåll hamnar som Draft tills Admin publicerar.

Steg (Orchard Admin):
1. Gå till Admin → Security → Roles.
2. Skapa eller kontrollera att rollerna `Admin`/`Administrator` och `User` finns.
3. För `User`, ge rättigheter per innehållstyp:
   - “Create” + “Edit Own” + “Delete Own” + “View Content”.
   - Avmarkera “Publish”/“Publish Own”.
4. För `Admin`, ge alla rättigheter.
5. Om REST‑behörighetsmodul finns: Admin → “Rest Permissions”. Lägg till regler:
   - GET: Anonymous (offentligt läsande) för de typer som ska synas i frontenden.
   - POST/PUT/DELETE: User/Admin enligt ovan.

## Innehållstyper (exempel för LR10/LR13)

Skapa minst tre content types; exempel:

1) Event
- Fält: `Title` (inbyggt), `HtmlBody` (HtmlBodyPart), `Category` (Text), `StartDate` (DateTime), `Location` (Text).

2) Announcement
- Fält: `Title`, `HtmlBody`, `Category` (Text).

3) Product
- Fält: `Title`, `Price` (Numeric), `Category` (Text), `Description` (Text/HtmlBody).

Steg (Orchard Admin):
1. Admin → Content → Content Types → “Create new type”.
2. Namnge t.ex. `Event` (Display Name = Event).
3. Lägg till önskade fält under “Add Field” (HtmlBody, Numeric (Price), Text (Category), DateTime etc.).
4. Kryssa i “Creatable” och “Listable” så de kan skapas och listas.
5. Upprepa för `Announcement` och `Product`.

REST‑åtkomst: Om ni använder vår generella REST, nås typerna som `/api/{ContentType}`
exempel: `/api/Event`, `/api/Announcement`, `/api/Product`.

## Publiceringsflöde

- User skapar nytt innehåll via POST `/api/{type}`.
  - Eftersom User saknar Publish, sparas posten som Draft (status blir “Draft” i svaret).
- Admin skapar nytt (eller godkänner/updaterar) och kan Publish – status blir “Published”.
- PUT/DELETE:
  - Ägare (Owner) får PUT/DELETE på sitt eget innehåll om “Edit/Delete Own” är aktiverat.
  - Admin får PUT/DELETE på allt.

Snabbtest (från README‑backendens auth‑endpoints):

1) Registrera User
```
POST /api/auth/register
{ "username": "user1", "email": "user1@example.com", "password": "Abcd1234!" }
```

2) Logga in User (samma browser/flik så att sessions‑cookies följer med)
```
POST /api/auth/login
{ "usernameOrEmail": "user1", "password": "Abcd1234!" }
```

3) Skapa post (User) – exempel för `Product`
```
POST /api/Product
{ "title": "Cykel", "price": 1200, "category": "Till salu", "description": "I gott skick" }
```
Svar innehåller status (t.ex. Draft).

4) Logga in Admin och skapa igen – bör bli `Published` (om Publish‑rätten finns).

5) PUT/DELETE: Testa PUT/DELETE på egen post (User) och på annan användares post (ska bli Forbid). Admin ska lyckas.

## Frontend – roller och ägarskap i UI

Backend har GET `/api/auth/login` som returnerar aktuell användare (motsvarar “/api/auth/me”). Exempel på svar (autentiserad):
```
{ "isAuthenticated": true, "username": "user1", "roles": ["User"] }
```

Frontendlogik:
- Läs aktuell användare vid uppstart och placera i global state (Context) eller enkel hook.
- Visa “Redigera/Ta bort” om något av följande gäller:
  - `user.roles` innehåller `Admin`/`Administrator`, eller
  - `post.owner === user.username` (beroende på backendfält; ofta `Owner`/`Author`).
- Dölj knappar för anonyma besökare.

Exempel (pseudo/TS):
```ts
// src/api/auth.ts
export type CurrentUser = { isAuthenticated: boolean; username: string | null; roles: string[] };
export async function getCurrentUser(): Promise<CurrentUser> {
  const res = await fetch('/api/auth/login');
  if (!res.ok) return { isAuthenticated: false, username: null, roles: ['Anonymous'] };
  return await res.json();
}

// beslut
const isAdmin = user.roles?.some(r => /admin/i.test(r));
const isOwner = post.authorName === user.username || post.owner === user.username;
const canEditOrDelete = isAdmin || isOwner;
```

I vår befintliga kod går det att skicka `onDelete`/`onEdit` till `PostCard` enbart när `canEditOrDelete` är true. Då syns knappen bara för ägare/Admin.

## Hur React pratar med API:t

- Bas: Axios/fetch mot Vite proxy (`/api/*` proxas till backend på `http://localhost:5001`).
- Typer: Frontend använder `VITE_CONTENT_TYPE` för att peka mot rätt innehållstyp (ex. `Product`).
- Endpoints:
  - Lista: `GET /api/{type}` – frontenden visar kort och filtrerar i klienten (kategori/sök).
  - Skapa: `POST /api/{type}` – frontenden skickar fält enligt typens schema.
  - Radera: `DELETE /api/{type}/{id}` – endast ägare/Admin.
  - Aktuell användare: `GET /api/auth/login` – (motsvarar “/me”).

Tips:
- För demo/offline visar frontenden färdiga “demo‑inlägg” när API inte svarar.
- I produktion, slå på GET för Anonymous på de typer som ska vara publika.

