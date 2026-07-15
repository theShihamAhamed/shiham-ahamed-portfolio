# Portfolio Architecture Decisions

This is the append-only decision record for the complete refactor. Approved entries are not proposals; superseding a decision requires a new ADR that links to the old one.

## ADR-001 — Keep public MongoDB reads in the Vercel frontend

- **Status:** Approved
- **Date:** 2026-07-12
- **Phase:** 0; implemented/refined in Phases 2 and 7
- **Context:** Render's free plan can sleep when idle, so routing public visitors through the backend can add wake-up latency. Vercel server code can read Atlas without exposing credentials to browsers.
- **Decision:** Public reads remain in Vercel server-side code. Browser/client code never accesses MongoDB. The public frontend receives a read-focused server data layer using shared DB models.
- **Alternatives considered:** Route all reads through Render; duplicate data in a separate service; expose client-side DB access.
- **Consequences:** Public reads avoid Render wake latency; the frontend needs server-only credentials, connection reuse, caching, and strict boundaries; backend remains needed for writes.
- **Risks:** Accidental client bundling/credential exposure, excess Atlas connections, or stale cache.
- **Follow-up actions:** Extract `@portfolio/db`, enforce server-only imports, document Vercel env, verify caching/revalidation and Atlas access.

## ADR-002 — Use separate shared and database packages

- **Status:** Approved
- **Date:** 2026-07-12
- **Phase:** 1–2
- **Context:** Browser-safe contracts are duplicated across apps while Mongoose models are duplicated between server runtimes; combining them would risk sending server code to browsers.
- **Decision:** `@portfolio/shared` is browser-safe. `@portfolio/db` is server-only. Mongoose must not enter client bundles. DB may depend on shared; shared must not depend on DB/app code.
- **Alternatives considered:** One combined common package; continued duplication; backend-only DB ownership.
- **Consequences:** Clear boundaries and reuse with separate build/export discipline.
- **Risks:** Misconfigured exports, circular dependencies, or client imports of server entry points.
- **Follow-up actions:** Create package skeletons, conditional/server-only exports, lint/boundary checks, and bundle verification.

## ADR-003 — Use npm workspaces

- **Status:** Approved
- **Date:** 2026-07-12
- **Phase:** 1
- **Context:** The repository currently has three installs/lockfiles and root prefix-delegation scripts.
- **Decision:** Use npm workspaces, one root lockfile, and package-local declarations for every directly imported dependency. Do not put all dependencies only in root.
- **Alternatives considered:** Keep independent installs; pnpm; Yarn; Nx/Turborepo.
- **Consequences:** One reproducible dependency graph and root orchestration while package ownership remains explicit.
- **Risks:** Hoisting assumptions, lockfile churn, deployment-root resolution, or missing direct declarations.
- **Follow-up actions:** Implement and validate the workspace only in Phase 1.

## ADR-004 — Backend remains the write and admin owner

- **Status:** Approved
- **Date:** 2026-07-12
- **Phase:** All implementation phases
- **Context:** Admin actions require a single protected authority even though public reads bypass Render.
- **Decision:** Authentication, mutations, uploads, protected CRUD, validation/protected operations, and frontend cache revalidation remain backend responsibilities. Admin never writes directly to MongoDB.
- **Alternatives considered:** Admin server actions writing directly; public frontend owning mutations; splitting write ownership.
- **Consequences:** Centralized authorization/validation/audit surface; admin operations may experience Render wake latency, which is acceptable for protected workflows.
- **Risks:** Cookie/CORS configuration, backend availability, and missed cache invalidation.
- **Follow-up actions:** Preserve API boundaries; finalize domain/cookie/CORS and verify revalidation.

## ADR-005 — Store case-study MDX in MongoDB

- **Status:** Approved
- **Date:** 2026-07-12
- **Phase:** 6
- **Context:** Current project data can reference raw GitHub MDX, creating runtime availability/versioning and authoring dependencies.
- **Decision:** Remove runtime dependence on GitHub raw files; author MDX directly in admin; store it in MongoDB; render through a controlled frontend mapping. Keep external article URL separate.
- **Alternatives considered:** Keep GitHub raw URLs; bundle local MDX; adopt a separate CMS.
- **Consequences:** Unified admin content management and database availability, with a new safe editor/render pipeline.
- **Risks:** Unsafe MDX execution, malformed content, preview mismatch, or large documents.
- **Follow-up actions:** Define validation/restrictions, editor/preview, component allowlist, fallbacks, and theme QA.

## ADR-006 — Remove stored project year

- **Status:** Approved
- **Date:** 2026-07-12
- **Phase:** 3
- **Context:** Projects currently store `year` alongside month dates, allowing inconsistent values. There is no production data requiring migration.
- **Decision:** Derive displayed project year from `startDate`; use month-level `YYYY-MM` dates; remove stored/manual project year. No migration/backward compatibility is required.
- **Alternatives considered:** Keep synchronized year; compute only in some views; full day-level dates.
- **Consequences:** One time source and simpler validation; sorting/display/forms must be updated together.
- **Risks:** Stale year references or incorrect ongoing/date-range behavior.
- **Follow-up actions:** Search every layer, update schema/contracts/forms/serializers/UI, and test date relationships.

## ADR-007 — Use canonical project and technology slugs

- **Status:** Approved
- **Date:** 2026-07-12
- **Phase:** 3 and 5
- **Context:** Free-text labels/colors drift and are unstable persistence identifiers.
- **Decision:** Persist stable project/known-technology slugs. Resolve labels and theme styles from shared registries. Continue supporting a validated custom-technology fallback.
- **Alternatives considered:** Persist display labels; duplicate maps per app; disallow custom technologies.
- **Consequences:** Consistent rendering/validation and easier label/style evolution; registries become governed shared contracts.
- **Risks:** Alias/slug collision, inaccessible colors, or custom/known ambiguity.
- **Follow-up actions:** Define registry invariants, alias resolution, safe styles, selectors, fallback schema, and tests.

## Implementation review log

## ADR-008 - Canonical public cache invalidation operations

- **Status:** Approved
- **Date:** 2026-07-14
- **Phase:** 7
- **Context:** Public reads moved behind server-only repositories and now include slug-scoped project-detail cache entries. A free-form tag-array endpoint could not reliably invalidate both an old and new project slug and allowed callers to choose cache scope directly.
- **Decision:** Backend mutations send a strict shared `{ entity, action, slug?, previousSlug? }` operation. The frontend revalidation route validates that operation and derives the complete canonical tag set, including collection, featured, detail, and old/new slug tags for projects. Requests have a small body bound, timing-safe bearer comparison, and bounded backend timeout/failure handling.
- **Alternatives considered:** Continue sending arbitrary tag arrays; expose one revalidation endpoint per entity; use an external cache broker.
- **Consequences:** Cache ownership and invalidation semantics stay centralized and testable; project rename invalidation is explicit. Mutation responses do not wait indefinitely for public cache freshness.
- **Risks:** A deployment with missing or mismatched revalidation configuration will serve data until normal cache expiry; this is bounded and logged without exposing secrets.
- **Follow-up actions:** Verify deployed secret/origin configuration and run authenticated mutation-to-public-cache smoke tests during deployment readiness.

## ADR-009 - Environment-driven deployment security policy

- **Status:** Approved
- **Date:** 2026-07-14
- **Phase:** 9
- **Context:** The public frontend, admin frontend, and Render backend have different trust boundaries. Cookie attributes, exact CORS origins, canonical URLs, proxy behavior, and server-only secrets must vary between local development, custom-domain production, and temporary provider-domain testing.
- **Decision:** Keep public reads on Vercel and writes/auth/uploads on Render. Validate deployment-specific environment values at runtime; allow only exact configured admin origins; centralize refresh-cookie options; require secure cookies in production and whenever SameSite is `none`; trust the Render proxy only when explicitly enabled; use `NEXT_PUBLIC_SITE_URL` for canonical SEO URLs; keep admin secrets and backend private keys server-only.
- **Alternatives considered:** Hardcode one production domain; allow wildcard provider origins; always use SameSite=None; expose refresh tokens to browser JavaScript; route public reads through Render; infer canonical URLs from request headers.
- **Consequences:** The same code supports local, custom-domain, and provider-domain modes without silently weakening security. Deployment configuration must be completed accurately before launch, and preview origins must be explicitly managed.
- **Risks:** Incorrect provider origin/cookie settings can prevent admin login; in-memory rate limits are instance-local; final CSP and deployed browser behavior require Phase 10 verification.
- **Follow-up actions:** Configure exact provider values without committing them, verify health/readiness and authenticated cookie/CORS behavior, and complete deployed smoke tests in Phase 10.

- **2026-07-14 - Phase 5:** ADR-007 fully covers the canonical registry, stable known slugs, registry-resolved presentation metadata, and validated custom fallback. The discriminated union and neutral custom badge treatment were implemented under that decision; no additional ADR was required.

- **2026-07-13 — Phase 3:** ADR-006 and the project-type portion of ADR-007 were implemented and validated. Optional form end-date blanks normalize to absence/unset at the API/model boundary; this is a routine representation detail within the approved month-timeline contract, not a new material architecture decision. No ADR was added or superseded.
- **2026-07-13 — Phase 4:** Shared admin field composition, explicit create/edit adapters, admin-local upload preflight helpers, and reliable unload/explicit-cancel protection were implemented within ADR-003/004 and the Phase 3 contract. These are routine UI ownership/lifecycle choices, not a new persistence, service, or framework architecture; no ADR was added or superseded.
- **2026-07-14 - Phase 6:** ADR-005 was implemented. `caseStudyMdx` is stored as optional bounded project content; external article links remain independent; admin authoring uses controlled Markdown/MDX subset preview; public rendering compiles stored source only through GFM/slug plugins and mapped safe components; invalid/unsafe content receives a controlled fallback. Existing project cache tags already cover list, featured, and detail reads, so no new cache architecture was required. No migration or compatibility layer was added.

- **2026-07-14 - Phase 9:** ADR-009 was implemented and aggregate-validated. The deployment security policy remains preparation-only: no provider configuration, live domain change, credential operation, database operation, or Phase 10 QA was performed.

## ADR-010 - Node package module-resolution compatibility

- **Status:** Approved
- **Date:** 2026-07-15
- **Phase:** Pre-Phase 10 compatibility correction
- **Context:** TypeScript reports the legacy `node10` resolution mode from the Node package configs and will remove it in TypeScript 7. The packages already emit CommonJS consumed by Node and Next server code.
- **Decision:** Use `module: NodeNext` and `moduleResolution: NodeNext` for `@portfolio/shared`, `@portfolio/db`, and the backend. Keep package metadata without a `type` field so NodeNext emits CommonJS and preserve existing `main`, `types`, root-only `exports`, and backend `node dist/server.js` behavior. Keep Next.js applications on Bundler resolution.
- **Alternatives considered:** Suppress the warning with `ignoreDeprecations`; use `bundler` for Node packages; change package output to ESM; put NodeNext globally in the shared base config.
- **Consequences:** Node packages use a TypeScript 7-compatible resolution strategy without changing runtime format or public package boundaries. Effective configs, emitted output, exports, and runtime checks remain part of validation.
- **Follow-up actions:** Revisit package `type`/ESM adoption only as a separate architecture change; complete deployed and interactive verification in Phase 10.
