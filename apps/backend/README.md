# Portfolio Backend

Express, TypeScript, MongoDB/Mongoose, Zod, JWT auth, and ImageKit-backed media services for the portfolio admin and public frontend.

## Setup

```powershell
cd apps/backend
npm install
Copy-Item .env.example .env
```

Update `.env` with real values, then make sure MongoDB is running.

```powershell
npm run dev
```

The API defaults to `http://localhost:5000`.

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `NODE_ENV` | `development`, `test`, or `production`. |
| `PORT` | API port. Defaults to `5000`. |
| `MONGO_URI` | MongoDB connection string. |
| `ADMIN_FRONTEND_ORIGINS` | Comma-separated exact browser origins allowed for credentialed admin CORS. |
| `ALLOW_VERCEL_PREVIEW_ORIGINS` | Temporary opt-in for valid HTTPS `*.vercel.app` origins. Defaults to `false`. |
| `PUBLIC_FRONTEND_URL` | Canonical public frontend URL used by deployment operations. |
| `ADMIN_EMAIL` | Single admin login email. |
| `ADMIN_PASSWORD_HASH` | Bcrypt hash for the single admin password. |
| `JWT_ACCESS_SECRET` | Access token secret, at least 32 characters. |
| `JWT_REFRESH_SECRET` | Refresh token secret, at least 32 characters. |
| `ACCESS_TOKEN_EXPIRES_IN` | Access token lifetime, for example `15m`. |
| `REFRESH_TOKEN_EXPIRES_IN` | Refresh token lifetime, for example `7d`. |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key for frontend/admin usage. |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key used by backend uploads/deletes. |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint. |
| `MAX_UPLOAD_SIZE_MB` | Max image upload size in MB. |
| `FRONTEND_REVALIDATE_URL` | Public frontend cache-revalidation endpoint. |
| `FRONTEND_REVALIDATE_SECRET` | Server-only bearer secret shared with the public frontend. |
| `AUTH_COOKIE_SAME_SITE` | `lax`, `strict`, or `none`; use `none` only for cross-site provider-domain testing. |
| `AUTH_COOKIE_SECURE` | Must be `true` in production and whenever SameSite is `none`. |
| `AUTH_COOKIE_DOMAIN` | Optional hostname-only cookie domain. |
| `TRUST_PROXY` | Whether the deployed Render proxy is trusted for secure-cookie and client-IP handling. |

Exact origins in `ADMIN_FRONTEND_ORIGINS` are always allowed. Setting
`ALLOW_VERCEL_PREVIEW_ORIGINS=true` additionally allows any valid HTTPS
subdomain with the exact `.vercel.app` hostname boundary. This broad,
credentialed policy is an intentional temporary preview convenience and
affects every request handled by the backend process, including production
traffic. It should later be replaced with a narrower project/account matcher.
The backend never uses `Access-Control-Allow-Origin: *`.

Preview CORS does not change refresh-cookie behavior. A Vercel admin calling a
Render provider domain generally needs `AUTH_COOKIE_SAME_SITE=none`,
`AUTH_COOKIE_SECURE=true`, and no cookie domain. Browser third-party-cookie
blocking can still prevent session restoration even when CORS succeeds.

Generate strong JWT secrets:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Generate `ADMIN_PASSWORD_HASH`:

```powershell
node -e "const bcrypt=require('bcryptjs'); bcrypt.hash(process.argv[1], 12).then(console.log)" "your-admin-password"
```

## Health Check

```powershell
Invoke-RestMethod http://localhost:5000/api/health
```

Render readiness checks should use `GET /api/health/ready`; it returns a
non-2xx response until the MongoDB connection is ready. The liveness endpoint
does not expose credentials, versions, or internal paths.

Expected shape:

```json
{
  "success": true,
  "data": {
    "status": "ok",
    "uptime": 123,
    "timestamp": "2026-06-01T00:00:00.000Z"
  }
}
```

## Auth Flow

The backend uses a single-admin auth system.

1. `POST /api/auth/login` with email and password.
2. Use `data.accessToken` as `Authorization: Bearer <token>` for admin routes.
3. Refresh token is set and consumed only as an httpOnly `refreshToken` cookie.
4. `POST /api/auth/refresh` rotates the refresh session and returns a new access token.
5. `POST /api/auth/logout` revokes the current refresh session and clears the cookie.
6. `GET /api/auth/me` verifies the access token and returns safe admin info.

PowerShell example:

```powershell
$login = Invoke-RestMethod `
  -Method Post `
  -Uri http://localhost:5000/api/auth/login `
  -ContentType "application/json" `
  -Body '{"email":"admin@example.com","password":"your-admin-password"}' `
  -SessionVariable session

$token = $login.data.accessToken
Invoke-RestMethod `
  -Uri http://localhost:5000/api/auth/me `
  -Headers @{ Authorization = "Bearer $token" } `
  -WebSession $session
```

## ImageKit Setup

Set these values in `.env`:

```txt
IMAGEKIT_PUBLIC_KEY=
IMAGEKIT_PRIVATE_KEY=
IMAGEKIT_URL_ENDPOINT=
MAX_UPLOAD_SIZE_MB=8
```

Allowed upload folder keys are intentionally limited:

| Folder key | ImageKit folder |
| --- | --- |
| `projects-thumbnails` | `/portfolio/projects/thumbnails` |
| `projects-gallery` | `/portfolio/projects/gallery` |
| `projects-architecture` | `/portfolio/projects/architecture` |
| `certifications` | `/portfolio/certifications` |

Uploads use multipart form data and accept only JPEG, PNG, and WebP files. SVG and non-image uploads are rejected.

Image asset shape:

```json
{
  "url": "https://ik.imagekit.io/example/image.jpg",
  "fileId": "imagekit_file_id",
  "alt": "Descriptive alt text",
  "width": 1200,
  "height": 800,
  "name": "image.jpg"
}
```

Public serializers omit ImageKit `fileId`. Admin serializers include `fileId` where media exists.

## Route Summary

Public routes do not require auth. Admin routes require `Authorization: Bearer <accessToken>`.

### Public Routes

| Method | Route |
| --- | --- |
| `GET` | `/api/health` |
| `GET` | `/api/projects/visible` |
| `GET` | `/api/projects/featured` |
| `GET` | `/api/projects/slug/:slug` |
| `GET` | `/api/currently-building/visible` |
| `GET` | `/api/certifications/visible` |
| `GET` | `/api/achievements/visible` |

### Auth Routes

| Method | Route | Notes |
| --- | --- | --- |
| `POST` | `/api/auth/login` | Public, rate limited. |
| `POST` | `/api/auth/refresh` | Uses the httpOnly refresh cookie only. |
| `POST` | `/api/auth/logout` | Revokes and clears the httpOnly refresh cookie. |
| `GET` | `/api/auth/me` | Requires access token. |

### Upload Admin Routes

| Method | Route |
| --- | --- |
| `POST` | `/api/uploads/image` |
| `POST` | `/api/uploads/images` |
| `DELETE` | `/api/uploads/image/:fileId` |

### Project Admin Routes

| Method | Route |
| --- | --- |
| `GET` | `/api/projects?search=&status=&projectType=&isFeatured=&isVisible=` |
| `GET` | `/api/projects/:id` |
| `POST` | `/api/projects` |
| `PATCH` | `/api/projects/:id` |
| `DELETE` | `/api/projects/:id` |
| `PATCH` | `/api/projects/:id/featured` |
| `PATCH` | `/api/projects/:id/visibility` |
| `PATCH` | `/api/projects/reorder` |
| `PATCH` | `/api/projects/:id/thumbnail` |
| `PATCH` | `/api/projects/:id/architecture-image` |
| `DELETE` | `/api/projects/:id/architecture-image` |
| `POST` | `/api/projects/:id/gallery` |
| `DELETE` | `/api/projects/:id/gallery/:imageFileId` |
| `PATCH` | `/api/projects/:id/gallery/reorder` |

Project field usage:

| Field | Usage |
| --- | --- |
| `shortDescription` | Project cards, project-detail hero, and SEO metadata. |
| `overview` | Deeper project-detail explanation. |
| `highlights` | Key feature bullets. |

Project content-density limits are centralized in `@portfolio/shared` and enforced by admin forms, API schemas, and the database model:

- `shortDescription`: at most 220 characters; 120–180 is recommended.
- `overview`: 1–3 paragraphs, at most 650 characters each; 2–3 is recommended.
- `highlights`: 1–7 items, at most 220 characters each; about 5 is recommended.
- Architecture summary: at most 450 characters; 2–3 concise sentences are recommended.
- Architecture points: at most 5 items and 180 characters each; 3–5 is recommended.

The removed project `description` property is not accepted by strict create/update schemas and has no compatibility alias. Previously stored copies are ignored by serializers; no migration or production-data mutation is required. Audit older project content against the new limits before editing and resaving it.

Project slugs are generated from `title` on create unless a valid unique slug is supplied. Slugs can be edited manually later, but changing `title` does not auto-change the slug.

### Currently-Building Admin Routes

| Method | Route |
| --- | --- |
| `GET` | `/api/currently-building?search=&isVisible=` |
| `GET` | `/api/currently-building/:id` |
| `POST` | `/api/currently-building` |
| `PATCH` | `/api/currently-building/:id` |
| `DELETE` | `/api/currently-building/:id` |
| `PATCH` | `/api/currently-building/:id/visibility` |
| `PATCH` | `/api/currently-building/reorder` |

Currently Building requires only `title` and `description`. `currentFocus`,
`techStack`, `highlights`, `link`, and `isVisible` are optional. For this
content type, `techStack` is the compatibility property used for
general-purpose Topics such as technologies, platforms, development areas,
engineering concepts, or project categories. The strict API no longer accepts
`status`; public presentation owns the fixed `In progress` label.

### Certification Admin Routes

| Method | Route |
| --- | --- |
| `GET` | `/api/certifications?search=&isVisible=` |
| `GET` | `/api/certifications/:id` |
| `POST` | `/api/certifications` |
| `PATCH` | `/api/certifications/:id` |
| `DELETE` | `/api/certifications/:id` |
| `PATCH` | `/api/certifications/:id/image` |
| `PATCH` | `/api/certifications/:id/visibility` |
| `PATCH` | `/api/certifications/reorder` |

Certification images are required. There is no standalone delete-image route; replace the image or delete the certification.

### Achievement Admin Routes

| Method | Route |
| --- | --- |
| `GET` | `/api/achievements?search=&isVisible=` |
| `GET` | `/api/achievements/:id` |
| `POST` | `/api/achievements` |
| `PATCH` | `/api/achievements/:id` |
| `DELETE` | `/api/achievements/:id` |
| `PATCH` | `/api/achievements/:id/visibility` |
| `PATCH` | `/api/achievements/reorder` |

## Serialization Rules

Public serializers:

- Include visible content only.
- Omit ImageKit `fileId`.
- Omit `isVisible`.
- Omit `displayOrder`.

Admin serializers:

- Include `id`.
- Include `isVisible`.
- Include `displayOrder`.
- Include ImageKit `fileId` where media exists.

## Reorder Behavior

Top-level reorder endpoints accept a complete ordered set:

```json
{
  "orderedIds": ["64f000000000000000000001", "64f000000000000000000002"]
}
```

The backend validates that every ID is a valid ObjectId, IDs are unique, every ID exists, and the array contains every item in that collection exactly once. `displayOrder` is updated from the array index.

Project gallery reorder uses file IDs:

```json
{
  "orderedFileIds": ["image_file_1", "image_file_2"]
}
```

MongoDB transactions are used where appropriate. If the local MongoDB server does not support transactions, the backend retries the reorder without a transaction using the established fallback path.

## Example Create Bodies

### Project

```json
{
  "title": "Smart Healthcare Platform",
  "shortDescription": "A patient management dashboard for clinics.",
  "projectType": "full-stack-web-app",
  "status": "completed",
  "startDate": "2026-01",
  "endDate": "2026-06",
  "thumbnail": {
    "url": "https://ik.imagekit.io/example/thumb.jpg",
    "fileId": "thumb_file_id",
    "alt": "Healthcare platform dashboard"
  },
  "gallery": [
    {
      "url": "https://ik.imagekit.io/example/screen.jpg",
      "fileId": "screen_file_id",
      "alt": "Healthcare dashboard screen"
    }
  ],
  "techStack": [
    {
      "label": "React",
      "category": "Frontend"
    },
    {
      "label": "Node.js",
      "category": "Backend"
    }
  ],
  "overview": [
    "Built a case-study ready platform with role-based workflows."
  ],
  "highlights": [
    "Appointment scheduling",
    "Patient record management"
  ],
  "isFeatured": false,
  "isVisible": true
}
```

### Currently-Building Item

```json
{
  "title": "Exploring React Native with Expo",
  "description": "Learning mobile application development by building cross-platform interfaces and exploring Expo workflows."
}
```

Optional properties are `currentFocus`, `techStack` (displayed as Topics),
`highlights`, `link`, and `isVisible`. Topics and highlights may be omitted or
sent as empty arrays.

### Certification

```json
{
  "title": "MongoDB Developer Certification",
  "provider": "MongoDB",
  "note": "Covers schema design, querying, and application development.",
  "image": {
    "url": "https://ik.imagekit.io/example/cert.jpg",
    "fileId": "cert_file_id",
    "alt": "MongoDB certification"
  },
  "verifyUrl": "https://example.com/verify",
  "credentialId": "ABC-123",
  "date": "2026-06-01",
  "skills": ["MongoDB", "Mongoose"],
  "isVisible": true
}
```

### Achievement

```json
{
  "title": "Hackathon Winner",
  "note": "Won first place for a full-stack product prototype.",
  "event": "University Hackathon",
  "result": "1st Place",
  "date": "2026-06-01",
  "year": "2026",
  "icon": "trophy",
  "isVisible": true
}
```

## Quality Checks

```powershell
npm run typecheck
npm run build
```

## Notes for Future Cleanup

Some helper logic, especially optional MongoDB transaction fallback and simple serializer image helpers, is repeated across modules. It is intentionally left local for now because the modules are still small and the duplication is easy to understand. A later shared utility can be introduced if more modules need the same behavior.
