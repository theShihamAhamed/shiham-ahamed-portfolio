# Public portfolio frontend

Next.js public frontend. Public project, site-settings, currently-building,
certification, and achievement reads are performed server-side through the
repository layer and MongoDB. The app does not contain a static project/demo
fallback and does not require seed data; an empty database uses the intentional
loading, error, not-found, and empty states.

## Setup

Install from the repository root so the single root lockfile is used:

```bash
npm install
```

Copy `.env.example` to a local environment file and provide the server-only
MongoDB, contact, and cache-revalidation values. Never expose those values with
`NEXT_PUBLIC_`.

Set `NEXT_PUBLIC_SITE_URL` to the canonical public URL. It is intentionally
browser-readable and powers metadata, canonical links, sitemap, robots, and
structured data.

## Run

From the repository root:

```bash
npm run dev:frontend
```

Real portfolio records and media are created through the protected admin
dashboard and backend API. Do not run a seed command; no seed command is part
of the workspace anymore.

## Checks

```bash
npm run lint:frontend
npm run typecheck:frontend
npm run test:frontend
npm run build:frontend
```
