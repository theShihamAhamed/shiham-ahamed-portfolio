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

For the root manual cache command, add these server/operator-only values to the
ignored `apps/frontend/.env.local` file:

```env
MANUAL_REVALIDATE_URL=http://localhost:3000/api/revalidate
REVALIDATE_SECRET=<matching-local-secret>
```

With the public frontend running, `npm run cache:revalidate` invalidates every
tag in the shared `PUBLIC_CACHE_GROUPS.all` collection. The script prints its
target but never the secret. Pointing it at production performs a real
production invalidation; automatic CRUD invalidation remains separate.

## Run

From the repository root:

```bash
npm run dev:frontend
```

Real portfolio records and media are created through the protected admin
dashboard and backend API. Do not run a seed command; no seed command is part
of the workspace anymore.

## Currently Building and certifications

Currently Building cards always show the presentation-owned `In progress`
badge. Current focus, Topics (received through `techStack`), and Highlights are
rendered only when populated, so a title-and-description-only record remains a
complete public card.

Certification cards keep their title, provider, note, certificate preview, and
optional Verify action in a responsive top section. Optional Skills render
beneath that section across the full card width; the certificate button remains
keyboard accessible and has an explicit pointer affordance.

## Checks

```bash
npm run lint:frontend
npm run typecheck:frontend
npm run test:frontend
npm run build:frontend
```
