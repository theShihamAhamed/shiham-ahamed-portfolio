# Dependency security review

Reviewed 2026-07-14 with `npm.cmd audit --json`. No `npm audit fix` or automatic
upgrade was run.

| Package | Severity | Direct/transitive | Used in production? | Fix available | Breaking risk | Decision |
| --- | --- | --- | --- | --- | --- | --- |
| `multer` | resolved | Direct backend dependency | Yes, protected uploads | Updated to 2.2.0 | Low; upload behavior retested | Resolved through the narrow 2.2.0 update. |
| `next` | moderate via PostCSS | Direct frontend/admin dependency | Yes | No safe non-breaking audit fix reported | Moderate | Keep patched 16.2.6 versions; re-evaluate the transitive PostCSS advisory before deployment. |
| `postcss` | moderate | Transitive through Next | Build-time | Audit suggests a major Next-era fix | Indirect | Do not force an unrelated override; track for the next compatible Next release. |
| `esbuild` | low | Transitive backend development dependency | No production runtime use | Yes | Low | Keep under review; development-server-only Windows file-read risk does not justify a broad upgrade in this phase. |

The follow-up audit report contains 1 low and 2 moderate findings, with no
high or critical findings. Production mitigations include protected upload routes,
bounded multipart/file limits, exact CORS, authenticated admin operations,
and no development server in production. Remaining audit status must be
rechecked before deployment after the narrow dependency updates.

## Phase 10 audit recheck - 2026-07-15

`npm.cmd audit --json` was rechecked after the Phase 9 dependency updates and
workspace repair. The result remains one low and two moderate findings, with
zero high or critical findings. `npm.cmd outdated --json` returned no outdated
package records. No force-fix, credential operation, or production dependency
change was performed.
