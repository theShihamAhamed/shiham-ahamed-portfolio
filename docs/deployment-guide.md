# Deployment guide

This guide prepares the portfolio for deployment; it does not deploy services,
change DNS, create accounts, or configure MongoDB Atlas/ImageKit remotely.

## Architecture

- Public frontend: Vercel, Next.js, server-only MongoDB reads, public pages,
  metadata, sitemap, robots, and the authenticated cache-revalidation route.
- Admin frontend: Vercel, Next.js browser client calling the backend API. It has
  no MongoDB access and exposes only `NEXT_PUBLIC_API_BASE_URL`.
- Backend: Render, Express authentication/CRUD/uploads/revalidation caller.
- Data/media/email: MongoDB Atlas, ImageKit, and Resend respectively.

Public reads intentionally bypass Render so Render sleep/wake behavior does not
make public pages depend on the API process. The public frontend still needs a
MongoDB connection for its server-side repositories.

## Recommended domains

The preferred future arrangement is:

```txt
https://shihamahamed.dev          public frontend
https://admin.shihamahamed.dev    admin frontend
https://api.shihamahamed.dev      backend API
```

These are recommendations, not configured domains. Temporary Vercel and
Render provider domains are supported through explicit environment values.
Custom subdomains are cross-origin but generally same-site, so `SameSite=Lax`
is the recommended production cookie mode. Provider-domain testing can require
`SameSite=None` and `Secure=true`; both modes are environment-driven.

## Prerequisites and services

Create or verify accounts for Vercel, Render, MongoDB Atlas, ImageKit, and
Resend. Configure billing, network access, verified sender domains, backups,
and access control in those providers separately. Never commit provider keys.

## Vercel projects

Create two Vercel projects from the same repository:

| Project | Root directory | Framework | Build command | Required public variable |
| --- | --- | --- | --- | --- |
| Public | `apps/frontend` | Next.js | `npm run build --workspace=@portfolio/frontend` | `NEXT_PUBLIC_SITE_URL` |
| Admin | `apps/admin-frontend` | Next.js | `npm run build --workspace=@portfolio/admin` | `NEXT_PUBLIC_API_BASE_URL` |

Use Node 20 or a newer supported LTS. Configure the repository root as the
install context when the Vercel project UI permits it; the repository has one
root lockfile. Public server-only values belong only to the public project:
`MONGO_URI`, `REVALIDATE_SECRET`, and optional Resend variables. The admin
project must never receive MongoDB, JWT, ImageKit private, or revalidation
secrets.

Preview deployments should use explicit preview origins and a non-production
canonical URL policy. Do not allow arbitrary `*.vercel.app` origins.

## Render backend

The checked-in `render.yaml` is a reproducibility template with `sync: false`
for secrets. It uses repository root context, Node 20-compatible commands,
`npm ci`, `npm run build:packages`, `npm run build:backend`, and
`npm run start --workspace=@portfolio/backend`. Configure the exact admin origin
list, public URL, secrets, ImageKit values, and matching revalidation values in
Render. The health check is `/api/health/ready`.

The free plan may sleep after inactivity. Expect cold-start latency and avoid
using Render as the public read path. `TRUST_PROXY=true` is required behind the
Render proxy; local development remains false.

## Cookie and CORS modes

Set `ADMIN_FRONTEND_ORIGINS` to comma-separated exact origins, including
protocol and port where applicable. Credentials are enabled only for those
origins. Wildcards and arbitrary provider subdomains are not accepted.

For custom-domain mode use `AUTH_COOKIE_SAME_SITE=lax`,
`AUTH_COOKIE_SECURE=true`, and leave `AUTH_COOKIE_DOMAIN` empty unless a shared
cookie domain is actually required. For cross-site provider testing use
`AUTH_COOKIE_SAME_SITE=none` and `AUTH_COOKIE_SECURE=true`.

## MongoDB Atlas

Allow only the required Vercel/Render egress strategy, create least-privilege
users where practical, and store each deployment's connection string only in
its server environment. Public reads and backend writes may use separate
read/readWrite users even though both contracts are named `MONGO_URI`.
Verify indexes and Atlas backup limitations before production. No MongoDB URI
is browser-exposed.

## ImageKit and Resend

The ImageKit public key and URL endpoint may be used by the admin upload flow;
the private key remains backend-only. Allowed uploads are JPEG, PNG, or WebP,
with the configured maximum size and bounded gallery count. Replacement and
deletion are backend operations.

Resend requires a verified sender/domain. `RESEND_API_KEY`,
`CONTACT_TO_EMAIL`, and `CONTACT_FROM_EMAIL` belong only to the public frontend
server. Contact validation, honeypot handling, and in-memory throttling are
already present; do not send live mail during preparation.

## Initial admin account

There is no public registration or default password. Prepare one bcrypt hash
locally, set `ADMIN_EMAIL` and `ADMIN_PASSWORD_HASH` in Render, and rotate the
credential through the operator's secret-management process after first use if
required. Do not create an account or print the password in this phase.

## Content, cache, and smoke checklist

After deployment configuration exists, Phase 10 should verify:

1. `/api/health` and `/api/health/ready` behavior.
2. Admin login, refresh-cookie persistence, logout, and denied origins.
3. Project upload/create/edit/replacement and media cleanup.
4. Public empty states and real visible content.
5. Admin mutation followed by bounded public cache revalidation.
6. Canonical metadata, `/sitemap.xml`, `/robots.txt`, and social previews.
7. Contact form validation, rate limiting, and verified Resend delivery.

## Rollback and recovery

Use the previous Vercel deployment or Render deploy for application rollback.
Keep environment values versioned in the provider secret stores, not Git.
MongoDB backups/exports and ImageKit asset recovery depend on the selected
provider tier and must be confirmed rather than assumed. Restore content from
MongoDB backups and re-upload missing ImageKit media only through the admin
workflow. Schema changes must remain backward-compatible until a migration
plan exists.

## Troubleshooting

- Public pages unavailable: inspect the public `MONGO_URI`, Atlas network
  access, and the public server logs.
- Admin login blocked: compare the exact admin origin, cookie mode, secure flag,
  proxy trust, API URL, and browser credentials behavior.
- Stale public content: inspect the revalidation URL/secret pair and the
  operation-specific endpoint response; do not use arbitrary tag invalidation.
- Upload failures: check ImageKit keys, folder permissions, MIME/size limits,
  and the backend logs without printing request bodies or keys.

## Free-plan limitations

Render free-plan sleep, cold starts, limited in-memory rate-limit state, and
provider quotas are operational limitations. They are not substitutes for
production monitoring, distributed throttling, guaranteed uptime, or backups.
