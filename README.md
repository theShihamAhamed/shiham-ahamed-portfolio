# Portfolio workspace

This repository is an npm workspace containing two Next.js frontends, an Express API, and two internal package foundations.

## Layout

```txt
apps/
  frontend/        Public portfolio (Next.js)
  admin-frontend/  Admin dashboard (Next.js)
  backend/         Protected API and mutation owner (Express)
packages/
  shared/          Browser-safe shared contracts and utilities
  db/              Server-only MongoDB/Mongoose code
docs/              Permanent refactor and deployment trackers
```

`@portfolio/shared` must remain safe for browser bundles. `@portfolio/db` is server-only: it may be consumed by the backend and by public frontend modules under `apps/frontend/lib/server/`, but never by the admin frontend or a client component.

## Install

Run installation from the repository root so npm uses the single root lockfile:

```sh
npm install
```

## Development

Run one application at a time from the repository root:

```sh
npm run dev:frontend
npm run dev:admin
npm run dev:backend
```

The development scripts build the required internal package foundations before starting the selected application.

## Content and media

Portfolio content is managed through the protected admin dashboard and stored
in MongoDB. No seed data is required. The public frontend reads visible data
server-side through its repository layer, so an empty database renders the
intentional empty states from the application. Upload real project, certificate,
achievement, and currently-building media through the admin flow; sample content
and sample project media are not part of the runtime.

Copy the relevant `.env.example` to a local environment file and fill in local
values without committing that file. The public frontend, admin frontend, and
backend examples document their own ownership and browser/server boundaries.

## Validation and builds

```sh
npm run lint
npm run typecheck
npm run build
npm run validate
```

Targeted scripts such as `lint:frontend`, `typecheck:admin`, `build:backend`, `build:shared`, and `build:db` are also available. Application packages retain their direct runtime dependencies; the root package only orchestrates workspace commands.

## Deployment preparation

Phase 9 deployment, security, SEO, CI, and operational setup is documented in
[docs/deployment-guide.md](docs/deployment-guide.md). It covers the Vercel
public/admin projects, Render backend, exact-origin CORS, cookie modes,
MongoDB/ImageKit/Resend preparation, health checks, rollback, and smoke tests.
It does not perform a live deployment or provision external services.

Phase 10 release gating and operator-owned prerequisites are recorded in
[docs/release-readiness-report.md](docs/release-readiness-report.md),
[docs/final-deployment-checklist.md](docs/final-deployment-checklist.md), and
[docs/post-deployment-smoke-test.md](docs/post-deployment-smoke-test.md).
