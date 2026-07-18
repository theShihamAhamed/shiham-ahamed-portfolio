# Portfolio Admin Frontend

Next.js admin workspace for managing portfolio projects, currently-building
items, certifications, and achievements. The app talks to the Express backend
through the API base URL configured below.

## Setup

Install dependencies:

```bash
npm install
```

Create local environment config:

```txt
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Use `.env.local` for local values. `.env.example` documents the expected
browser-exposed API origin. Content and media are managed through this
dashboard; no seed data is required.

## Run

Start the admin frontend:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000/admin
```

If another frontend is already using port `3000`, Next.js may choose another
port. Add that exact origin to the backend `ADMIN_FRONTEND_ORIGINS` list.

## Auth

The backend uses single-admin authentication:

- Login posts email/password to `/api/auth/login`.
- The access token is stored in memory only.
- The refresh token is stored in an httpOnly cookie by the backend.
- On protected app load, the frontend calls `/api/auth/refresh` with
  `credentials: "include"` before redirecting to login.
- Logout calls `/api/auth/logout`, clears the frontend session, and redirects
  to `/admin/login`.

Because the access token is memory-only, a page refresh relies on the refresh
cookie. If the refresh cookie is missing or expired, protected routes redirect
to login.

Vercel preview deployments still require backend CORS and cookie configuration.
Keep permanent origins in `ADMIN_FRONTEND_ORIGINS`; the backend's temporary
`ALLOW_VERCEL_PREVIEW_ORIGINS=true` mode additionally accepts valid HTTPS
`*.vercel.app` origins for the entire shared backend process. Provider-domain
refresh cookies generally require `SameSite=None`, `Secure=true`, and no cookie
domain. Browser third-party-cookie blocking is separate from CORS and can still
prevent session restoration after a reload.

## Admin Routes

```txt
/admin
/admin/login
/admin/projects
/admin/projects/new
/admin/projects/[id]/edit
/admin/currently-building
/admin/currently-building/new
/admin/currently-building/[id]/edit
/admin/certifications
/admin/certifications/new
/admin/certifications/[id]/edit
/admin/achievements
/admin/achievements/new
/admin/achievements/[id]/edit
```

## Modules

Projects:

- Create projects with required thumbnail and gallery images.
- Edit metadata separately from media.
- Replace thumbnail and architecture image.
- Add/delete/reorder gallery images.
- Toggle featured and visibility.
- Reorder projects only when no search/filter is active.

Currently Building:

- Manage active-work title, description, status, focus, stack, and highlights.
- Toggle visibility and reorder the full unfiltered list.

Certifications:

- Certification image is required.
- Create uploads the image first, then submits certification metadata.
- Edit allows image replacement only; there is no standalone image delete.
- Deleting the certification removes the image through backend cleanup.

Achievements:

- Manage title, note, event, result, date, year, icon, visibility, and order.
- No image upload is used for achievements.

## ImageKit Notes

Image upload controls call backend-protected upload/media endpoints. Public
serializers omit ImageKit `fileId`; admin serializers include `fileId` so the
admin UI can replace, delete, and reorder media safely.

The backend must have valid ImageKit variables configured for real upload and
replacement testing:

```txt
IMAGEKIT_PUBLIC_KEY
IMAGEKIT_PRIVATE_KEY
IMAGEKIT_URL_ENDPOINT
MAX_UPLOAD_SIZE_MB
```

## Checks

Run before release:

```bash
npm run lint
npm run build
npm audit
```

Do not run `npm audit fix --force` without reviewing the dependency impact.

## Known Limitations

- The admin frontend assumes the backend is running and reachable through
  `NEXT_PUBLIC_API_BASE_URL`.
- Access tokens are intentionally not persisted; refresh cookies are required
  for session continuity after reload.
- Drag/drop reorder is disabled while search or filters are active because the
  backend expects the complete ordered ID set.
- Browser QA should still be run against real ImageKit credentials before
  production deployment.
