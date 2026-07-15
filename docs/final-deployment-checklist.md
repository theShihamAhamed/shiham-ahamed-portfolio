# Final Deployment Checklist

This checklist contains external actions that were intentionally not performed
during Phase 10. Do not place credentials in this file.

## Before deployment

- [ ] Confirm the intended release commit and review the release-readiness report.
- [ ] Confirm Node 20 or a newer supported LTS is selected for all providers.
- [ ] Confirm the root lockfile is the only lockfile and CI is green.
- [ ] Record the operator and change window.
- [ ] Prepare rollback targets for both Vercel projects and Render.

## MongoDB Atlas

- [ ] Create or verify least-privilege application users.
- [ ] Configure network access for the selected Vercel and Render egress model.
- [ ] Verify required indexes and connection limits.
- [ ] Enable and test the selected backup/restore capability.
- [ ] Store public-read and backend connection strings only in server environments.

## ImageKit

- [ ] Configure the ImageKit project and upload folders.
- [ ] Set the public key and endpoint in the approved admin/backend environments.
- [ ] Store the private key only in the backend secret store.
- [ ] Verify allowed JPEG, PNG, WebP, size, count, replacement, and removal behavior.

## Resend

- [ ] Verify the sender domain and from address.
- [ ] Configure the API key only in the public frontend server environment.
- [ ] Configure contact recipient/from variables.
- [ ] Plan a controlled test recipient and confirm no test sends use unintended recipients.

## Public Vercel project

- [ ] Create the project with the public frontend root and root install context.
- [ ] Configure NEXT_PUBLIC_SITE_URL with the final HTTPS public URL.
- [ ] Configure server-only MongoDB, revalidation, and optional Resend variables.
- [ ] Confirm preview canonical/indexing policy.
- [ ] Build and inspect the public deployment.

## Admin Vercel project

- [ ] Create the project with the admin frontend root and root install context.
- [ ] Configure NEXT_PUBLIC_API_BASE_URL with the selected HTTPS API URL.
- [ ] Confirm no MongoDB, JWT, ImageKit private, or revalidation secrets are present.
- [ ] Verify the noindex response and build.

## Render backend

- [ ] Create the backend service from render.yaml or equivalent settings.
- [ ] Confirm the exact build command is `npm ci --include=dev && npm run build:packages && npm run build:backend`.
- [ ] Confirm `NODE_VERSION=20.20.2` is set before `NODE_ENV=production`.
- [ ] Configure the exact ADMIN_FRONTEND_ORIGINS list.
- [ ] For the current provider-domain deployment, set the exact admin Vercel origin with no wildcard or trailing slash and use `AUTH_COOKIE_SAME_SITE=none`.
- [ ] For the future custom-domain deployment, use `https://admin.shihamahamed.dev` and `AUTH_COOKIE_SAME_SITE=lax` instead.
- [ ] Configure production MongoDB, admin hash, JWT, ImageKit, and revalidation secrets.
- [ ] Set both `FRONTEND_REVALIDATE_URL=https://<public-host>/api/revalidate` and a matching `FRONTEND_REVALIDATE_SECRET` of at least 32 characters; never set only one.
- [ ] Set AUTH_COOKIE_SAME_SITE and AUTH_COOKIE_SECURE for the selected domain mode.
- [ ] Set TRUST_PROXY=true behind Render.
- [ ] Confirm health check path /api/health/ready.
- [ ] Confirm the backend starts from the workspace command `npm run start --workspace=@portfolio/backend`.
- [ ] Verify the compiled start command and logs without secret values.

## Domains and DNS

- [ ] Configure the approved public, admin, and API domains.
- [ ] Add DNS records and verify TLS certificates.
- [ ] Confirm the final origins exactly match CORS and cookie configuration.
- [ ] Confirm no provider-domain wildcard is permitted.

## Authentication

- [ ] Prepare the first admin bcrypt hash locally through the approved operator process.
- [ ] Store ADMIN_EMAIL and ADMIN_PASSWORD_HASH only in Render secret storage.
- [ ] Verify login, refresh, invalid credentials, revocation, and logout clearing.
- [ ] Verify custom-domain SameSite=Lax mode or provider-domain SameSite=None/Secure mode.
- [ ] Repeat login, page refresh, token refresh, and logout verification after changing cookie mode or domains.
- [ ] Rotate the initial operator credential if required by policy.

## Initial admin setup

- [ ] Confirm there is no public registration route.
- [ ] Sign in with the operator-created account.
- [ ] Do not run seeds or create demo records.
- [ ] Add only approved real portfolio content.

## Content upload

- [ ] Create or edit a project through the admin workflow.
- [ ] Verify canonical type/status/date/technology contracts.
- [ ] Upload approved media and verify replacement/removal.
- [ ] Author and preview bounded case-study content.
- [ ] Verify empty states remain safe before content is added.

## Cache revalidation

- [ ] Verify the exact frontend/backend revalidation URL and shared secret.
- [ ] Test project create/update/delete and slug-change invalidation.
- [ ] Test certification, achievement, currently-building, and settings updates.
- [ ] Confirm old and new project slugs are invalidated.
- [ ] Confirm failures are bounded, retry only transient failures, do not expose secrets, and report that the mutation succeeded when cache refresh is unconfirmed.
- [ ] Confirm sitemap and public fallback TTL behavior is one day (86400 seconds).

## SEO verification

- [ ] Verify canonical URLs on the final domain.
- [ ] Verify sitemap excludes hidden projects, admin routes, and API routes.
- [ ] Verify robots behavior for production and preview.
- [ ] Verify Open Graph, Twitter/X, JSON-LD, favicon, and social asset responses.
- [ ] Verify admin pages send noindex/nofollow.

## Security verification

- [ ] Confirm HTTPS everywhere.
- [ ] Confirm exact-origin CORS allowed/denied behavior.
- [ ] Confirm Secure/httpOnly cookie attributes.
- [ ] Confirm request, upload, rate-limit, and error-sanitization behavior.
- [ ] Review headers and make the final deployed CSP decision.
- [ ] Run the final dependency audit and record accepted findings.

## Post-deployment smoke test

- [ ] Execute docs/post-deployment-smoke-test.md.
- [ ] Record URLs, timestamps, evidence, issues, and rollback decision.

## Rollback readiness

- [ ] Identify the previous Vercel deployments and Render deploy.
- [ ] Confirm environment values can be restored from provider secret stores.
- [ ] Confirm MongoDB backup/restore evidence.
- [ ] Confirm ImageKit recovery/re-upload procedure.
- [ ] Define the rollback owner and communication path.
