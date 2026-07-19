# Post-Deployment Smoke Test

Run this checklist after each staged deployment. Record result, observed URL,
timestamp, evidence, issue, and whether rollback is required for every section.

## Public

- [ ] Home loads with populated content and no console/runtime error.
- [ ] Hero CTA hierarchy is clear: View Projects is primary, Contact Me is secondary at rest, and Resume is tertiary; the three actions appear as one centered group.
- [ ] After a hard refresh, all three actions share a 44px interaction height; Contact Me is approximately 176px wide on desktop, full width below 640px, and has a restrained bordered resting surface rather than a competing solid-white surface.
- [ ] Hovering Contact Me reveals its transparent/glass surface and verified aurora; every teal, blue, purple, pink, and amber region travels during a six-second stationary hover, exit pauses motion, and re-hover resumes it without button translation or scale.
- [ ] Contact Me focus-visible shows the same aurora plus a clear focus ring; keyboard order is View Projects → Contact Me → Resume, reduced-motion output is static, touch behavior is usable, light/dark themes remain readable, and the glow does not overlap neighboring CTAs.
- [ ] At 320px, 375px, 640px, 768px, and desktop widths, the action group remains aligned, usable, and free of horizontal overflow.
- [ ] Projects page loads and filters by canonical project type.
- [ ] Project cards link to valid visible slugs.
- [ ] Completed, in-progress, planned, hidden, and unknown-slug behavior is correct.
- [ ] Project detail renders safe media, technologies, timeline, and sanitized GitHub README-style case-study content.
- [ ] Empty projects, certifications, achievements, currently-building, and settings states are intentional.
- [ ] A minimum Currently Building record with only Title and Description renders a balanced card with the fixed `In progress` badge and no empty optional wrappers.
- [ ] Full Currently Building cards conditionally render Current focus, Topics, and Highlights in stored order; hidden-item filtering and display ordering remain correct.
- [ ] Currently Building cards retain animation/hover behavior and have no overflow at mobile, tablet, or desktop widths in light and dark themes.
- [ ] Certification Skills span the full card width below the top content row across responsive widths, including long titles, notes, and many skills.
- [ ] The certificate preview button shows a pointer cursor, is reachable by Tab, opens with Enter/Space, closes with Escape or its close button, and restores focus without adding a pointer cursor to non-interactive card areas.
- [ ] About page, skills, institution/profile assets, and quick navigation work.
- [ ] Contact validation, honeypot, success, failure, and configured links work.
- [ ] sitemap.xml contains only public visible routes/projects.
- [ ] robots.txt has the expected production policy.
- [ ] Canonical, Open Graph, Twitter/X, favicon, and JSON-LD metadata are correct.
- [ ] Public pages work at mobile, tablet, and desktop widths.
- [ ] Light and dark themes work.
- [ ] Record any Lighthouse or performance observations.

## Admin

- [ ] Admin login succeeds with the operator account.
- [ ] Invalid credentials produce a generic failure.
- [ ] Refresh session persists and logout clears the refresh cookie.
- [ ] Unauthenticated protected routes redirect or reject safely.
- [ ] Create, edit, delete, and slug-change project flows work.
- [ ] Known and custom technology flows work.
- [ ] Media upload, replacement, removal, retry, and confirmation work.
- [ ] Case-study Edit/Preview tabs, safe README HTML, code-copy controls, edit/clear flow, and validation errors work.
- [ ] Certifications, achievements, currently-building, and site settings CRUD work.
- [ ] Currently Building creation succeeds with only Title and Description and separately with every optional field populated.
- [ ] A legacy Currently Building record containing stored status can be edited without exposing status; Current focus, Link, all Topics, and all Highlights can each be cleared.
- [ ] Currently Building visibility toggles, pointer/keyboard reorder, filtered reorder restriction, optional-field guidance, and mobile form/list layouts work.
- [ ] Admin routes remain noindex.
- [ ] Failed API/backend connections remain usable and sanitized.

## Backend

- [ ] GET /api/health returns stable liveness data without secrets.
- [ ] GET /api/health/ready returns the expected ready/not-ready status.
- [ ] Render startup uses the pinned Node 20.20.2 build/runtime configuration and `/api/health/ready` becomes ready after cold start.
- [ ] Allowed CORS origin succeeds with credentials.
- [ ] Denied CORS origin is rejected.
- [ ] With `ALLOW_VERCEL_PREVIEW_ORIGINS=false`, an unconfigured Vercel preview origin is rejected while exact origins continue to work.
- [ ] During an approved enabled window, two HTTPS Vercel preview origins pass preflight while HTTP, custom-port, bare-provider, deceptive-suffix, malformed, and unrelated origins remain denied.
- [ ] Cookie attributes match the selected domain mode.
- [ ] Provider-domain mode uses the exact admin origin, `SameSite=None`, `Secure=true`, and no cookie domain.
- [ ] Custom-domain mode uses `SameSite=Lax`, `Secure=true`, and no cookie domain unless explicitly required.
- [ ] Login, refresh, logout, and revoked-session behavior is correct.
- [ ] Login, page refresh, token refresh, and logout remain correct after the selected cookie mode is configured.
- [ ] Any preview refresh failure is classified as CORS or browser third-party-cookie policy rather than conflating the two.
- [ ] Login, refresh, admin, and upload rate limits respond safely.
- [ ] JSON, multipart, and upload-size limits are enforced.
- [ ] Provider failures return sanitized errors.
- [ ] SIGTERM/SIGINT shutdown closes the server and database cleanly.

## Integration

- [ ] From a non-production operator environment, `npm run cache:revalidate` reports every shared all-group tag without exposing its secret; no production target is used without approval.
- [ ] An admin project write appears publicly after bounded revalidation.
- [ ] Project slug changes invalidate both old and new detail URLs.
- [ ] Home/list/detail cache refreshes after relevant mutations.
- [ ] Revalidation retries transient network/408/429/5xx failures with bounded backoff and does not retry ordinary 4xx responses.
- [ ] An invalidation failure leaves the database mutation intact, returns structured cache-invalidation metadata, and exposes no URL secret in response or logs.
- [ ] ImageKit media is delivered and cleanup behavior is correct.
- [ ] Contact delivery reaches the controlled test recipient through Resend.
- [ ] No secrets appear in browser output, network responses, or logs.

## Evidence record

| Area | Result | Observed URL | Timestamp | Evidence | Issue | Rollback required |
| --- | --- | --- | --- | --- | --- | --- |
| Public |  |  |  |  |  |  |
| Admin |  |  |  |  |  |  |
| Backend |  |  |  |  |  |  |
| Integration |  |  |  |  |  |  |
