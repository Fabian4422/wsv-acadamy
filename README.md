# Weistropper SV Academy

Internes Trainingsportal für Jugendtrainer des Weistropper SV.

## Voraussetzungen

- Node.js 20+
- Supabase-Projekt mit Tabelle `exercises` und Auth

## Setup

1. Abhängigkeiten installieren:

```bash
npm install
```

2. Umgebungsvariablen anlegen – `.env.example` nach `.env.local` kopieren und Werte aus Supabase (Settings → API) eintragen:

```bash
cp .env.example .env.local
```

| Variable | Woher |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `anon` / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` key (nur Server, geheim halten) |

3. RLS-Policies in Supabase ausführen: Inhalt von [`supabase/policies.sql`](supabase/policies.sql) im SQL-Editor einfügen und ausführen.

4. Admin-Account einrichten (einmalig in Supabase → Authentication → Users):

   - **E-Mail** auf synthetische Adresse setzen, z. B. `fabian@users.wsv-academy.internal` (entspricht Nutzername `fabian`)
   - **User Metadata:** `{ "username": "fabian" }`
   - **App Metadata:** `{ "role": "admin" }` (für Admin-Rechte und RLS-Schreibzugriff erforderlich)

5. Dev-Server starten:

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000).

## Nutzung

- **Trainer:** Login mit Nutzername und Passwort, die der Admin übergibt. Keine öffentliche Registrierung, keine E-Mails vom System.
- **Admin:** Link „Admin“ in der Navigation → Trainer-Accounts mit Nutzername anlegen, Passwort einmalig kopieren und persönlich übergeben. Übungen anlegen/bearbeiten/löschen im Portal.

## Deploy (Vercel)

1. Repo mit Vercel verbinden.
2. Dieselben Env-Vars wie in `.env.local` in Vercel setzen (Production + Preview).
3. Deployen und Login sowie Admin-User-Anlage testen.

## Stack

- Next.js 16, React 19, Tailwind CSS 4
- Supabase Auth + Database
