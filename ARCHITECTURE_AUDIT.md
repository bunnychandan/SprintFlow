# Architecture Audit Report

**Project:** SprintFlow Enterprise  
**Date:** 2026-07-15  
**Scope:** Full-stack audit (Next.js 16 / Prisma 7 / PostgreSQL)

---

## Severity Key

| Level | Meaning |
|---|---|
| 🔴 **Critical** | Will cause performance degradation, maintainability issues, or data problems in production |
| 🟠 **High** | Significant improvement opportunity; should be planned for next sprint |
| 🟡 **Medium** | Worth doing when touching related areas |
| ⚪ **Low** | Nice-to-have cleanup |

---

## 1. Dead Code

### 🔴 `src/services/health.ts` — Entire file is dead
- Export: `getSystemHealth()` is **never imported anywhere**
- Hook `use-system-health.ts` uses raw `fetch()` calls inline instead
- **Fix:** Delete file
- **Risk:** Zero (no imports)
- **Recommendation:** ✅ **Remove now**

### 🔴 5 Orphaned Hooks — Zero consumers in components or pages

| File | Exports | Last import found |
|---|---|---|
| `src/hooks/use-admins.ts` | `useAdmins()` | None |
| `src/hooks/use-audit-logs.ts` | `useAuditLogs()`, `useAuditDashboard()` | None |
| `src/hooks/use-backlog.ts` | `useBacklog()`, `useBacklogActions()` | None |
| `src/hooks/use-invitations.ts` | `useInvitations()` | None |
| `src/hooks/use-settings.ts` | `useSettings()` | None |

- **Risk:** Low (unused code won't be bundled since hooks are client-side only when imported)
- **Impact:** ~600 lines of misleading dead code
- **Recommendation:** ✅ **Remove. Git history preserves them.**

### 🟠 `src/services/audit.ts:52` — `getAuditActivity()` exported but never imported
- **Risk:** Zero
- **Recommendation:** ✅ **Remove export** (or delete function)

### 🟠 `src/services/projects.ts:146` — `getRecentProjects()` exported but never imported
- **Risk:** Zero
- **Recommendation:** ✅ **Remove export**

### ⚪ `src/lib/email/logger-provider.ts` — 7 `console.log` calls
- These are intentional (dev email logger), but should use `logger.info()` pattern instead
- **Risk:** Low (dev-only, not used in production)
- **Recommendation:** ❌ **Keep** (convenient for local dev)

---

## 2. Unused NPM Dependencies

### 🟠 `@auth/prisma-adapter` (3.13 MB) — NOT used anywhere
- Codebase uses `@next-auth/prisma-adapter` instead (0.02 MB)
- **Fix:** `npm uninstall @auth/prisma-adapter`
- **Risk:** Zero (no imports exist)
- **Recommendation:** ✅ **Remove now**

### 🟠 `prisma` (40 MB) — Listed in `dependencies` instead of `devDependencies`
- The `prisma` CLI is only used in build scripts (`prisma generate`, `prisma db push`)
- It is **never imported** in application code
- **Fix:** Move from `dependencies` → `devDependencies`
- **Risk:** Zero (no runtime impact)
- **Recommendation:** ✅ **Move now**

### 🟡 `recharts` (7 MB) — Heavy charting library; lighter alternatives exist
- Used in ~16 chart components
- Alternatives: `nivo` (~3 MB), `visx` (~2 MB), `reaviz` (~2 MB)
- **Risk:** Medium — requires chart component rewrites
- **Recommendation:** ❌ **Keep** for now; evaluate when charting is next touched

### ⚪ `framer-motion` (4.5 MB) — Near threshold
- Alternatives: `motion` (~2 MB, v2 is lighter)
- **Recommendation:** ❌ **Keep**; revisit when animations are refactored

---

## 3. Duplicate Types / Interfaces / Schemas

### 🟠 `types/knowledge.ts` vs `types/documentation.ts` — **60% overlap**
- Both define `DocumentStatus`, `DocumentVisibility`, `DocumentType`, `DocumentItem`, `DocumentDetail`, `DocumentCommentItem`, `DocumentVersionItem`, `DocumentTimelineEvent`, `DocumentStatistics`
- **Fix:** Merge into `types/documentation.ts`; delete `types/knowledge.ts`
- **Risk:** Low (update 2-3 import paths)
- **Recommendation:** ✅ **Merge next sprint**

### 🟠 `components/board/board-types.ts` vs `types/board.ts` — Near-identical types
- `BoardColumnData` ↔ `BoardColumn`, `BoardCardData` ↔ `BoardTask`
- **Fix:** Delete `components/board/board-types.ts`, use `types/board.ts`
- **Risk:** Low (update 2 import paths)
- **Recommendation:** ✅ **Merge when touching Board**

### 🟡 `SortDirection` defined twice: `types/project.ts:130` and `types/admin.ts:79`
- **Fix:** Delete `types/admin.ts:79`, import from `types/project.ts`
- **Risk:** Zero
- **Recommendation:** ✅ **Remove now**

### 🟡 `Pagination` interface defined in **4 files**: `types/agile.ts`, `types/ai.ts`, `types/documentation.ts`, `types/integrations.ts`
- All: `{ page: number; pageSize: number; total: number; totalPages: number; }`
- **Fix:** Extract to `types/common.ts`; re-export from existing barrel
- **Risk:** Low (update 4 import paths)
- **Recommendation:** ✅ **Extract to shared type**

### 🟡 `ListResponse<T>` defined in **3 files**: `types/ai.ts`, `types/documentation.ts`, `types/integrations.ts`
- All: `{ data: T[]; pagination: Pagination; }`
- **Fix:** Extract to `types/common.ts` alongside `Pagination`
- **Risk:** Low
- **Recommendation:** ✅ **Extract to shared type**

### ⚪ Prisma Enums × TypeScript types × Zod enums — Triple duplication
- Every Prisma enum has a mirror string-literal type in a `.ts` file **and** a `z.enum()` in validations
- This is inherent to the framework pattern — Zod infers runtime, Prisma infers DB, TS types are for explicit annotation
- **Recommendation:** ❌ **Accept** as standard pattern; only fix if a specific enum drifts

---

## 4. Prisma Query Optimizations

### 🔴 N+1 Query — Board route (`src/app/api/projects/[id]/board/route.ts:73-99`)
- Loop iterates over tasks and fires one `taskChecklist.findMany` per task
- **Impact:** 100–200 extra queries per board load
- **Fix:** Replace with `include: { checklist: { select: { isChecked: true } } }` in the main query
- **Risk:** Low (moving include from loop to main query)
- **Recommendation:** ✅ **Fix now**

### 🔴 Overfetch — `projects/[id]/route.ts:26-32`
- Fetches **ALL tasks** (every column) with nested assignee/reporter
- For a project with 5000 tasks, returns megabytes of data
- **Fix:** Remove `tasks` from the include; add a separate paginated endpoint or limit to recent tasks
- **Risk:** Medium — need to verify what the frontend actually renders
- **Recommendation:** ❌ **Investigate** before changing; may need UI adjustment

### 🟠 Overfetch — `sprints/[id]/route.ts:20-26`
- Returns ALL tasks (every column) for the sprint detail view
- **Fix:** Remove `tasks` include; add `_count` and stats instead
- **Risk:** Low — sprint detail page typically shows summary/stats, not raw task list
- **Recommendation:** ✅ **Fix when touching sprint detail**

### 🟠 Missing compound indexes — `prisma/schema.prisma`
- Most common query patterns filter by `[projectId, status]`, `[projectId, deletedAt]`, `[sprintId, status]`
- Currently only single-column indexes exist
- **Fix:** Add compound indexes in Prisma schema
  ```prisma
  @@index([projectId, status])
  @@index([projectId, deletedAt])
  @@index([sprintId, status])
  @@index([sprintId, deletedAt])
  @@index([entityType, entityId, createdAt])  // AuditLog
  ```
- **Risk:** Low — indexes only speed up queries, no behavior change
- **Recommendation:** ✅ **Add on next DB migration**

### 🟡 Sequential independent queries — `tasks/[id]/route.ts:107-134`
- Sprint check, epic check, release check — all independent but sequential
- **Fix:** Wrap in `Promise.all`
- **Risk:** Zero
- **Recommendation:** ✅ **Fix when touching file**

### 🟡 Redundant `_count` alongside full relation includes
- `documents/[id]/route.ts` includes `_count: { children: true }` but also includes the full `children` list
- **Fix:** Remove `_count` where the related array is already included
- **Risk:** Zero
- **Recommendation:** ✅ **Fix when touching file**

---

## 5. Architecture & Maintainability

### 🟠 33 Service Functions Without Hook Wrappers
- Services for invitations (10), organization (12), admins (6), audit (4), health (1) have no corresponding hooks
- Components either bypass hooks entirely or use raw `fetch()`
- **Fix:** Create missing hooks or delete unused service functions
- **Risk:** Medium — requires understanding what the frontend actually needs
- **Recommendation:** ❌ **Audit per-page** before adding hooks

### 🟠 Direct component→service imports (bypassing hooks)
- `components/admin/audit/audit-export-dialog.tsx` imports `@/services/audit` directly
- `components/notifications/notification-bell.tsx` imports `@/services/notifications` directly
- **Fix:** Create thin hooks or import from existing hooks
- **Risk:** Low — mechanical change
- **Recommendation:** ✅ **Fix when touching these components**

### 🟡 Integration domain has no service layer
- `hooks/integrations.ts` uses raw `fetch()` with inline URLs instead of a shared service
- All other domains have a `services/<domain>.ts` layer
- **Fix:** Extract `services/integrations.ts` and update hook to use it
- **Risk:** Low — pure extraction
- **Recommendation:** ✅ **Fix when onboarding integrations**

### 🟡 Small files that should merge
- `lib/notification/types.ts` (13 lines) + `in-app-provider.ts` (11 lines) → merge into `notification/index.ts`
- `lib/email/types.ts` (11 lines) + `logger-provider.ts` (17 lines) → merge into `email/index.ts`
- **Risk:** Zero (same directory, internal imports only)
- **Recommendation:** ✅ **Merge when touching notification/email**

### 🟡 10 Integration provider files follow identical patterns (27 lines each)
- `github.ts`, `gitlab.ts`, `slack.ts`, `microsoft-teams.ts`, `google-calendar.ts`, `outlook.ts`, `zoom.ts`, `google-meet.ts`, `jenkins.ts`, `argocd.ts`
- All implement `validate()`, `connect()`, `disconnect()`, `sync()`, `getConfigurationSchema()`
- **Fix:** Could be consolidated into 3-4 files grouped by auth type (OAuth vs API key)
- **Risk:** Medium — each provider has unique implementation details
- **Recommendation:** ❌ **Keep** for now; consolidation adds abstraction overhead

---

## 6. React Rendering Inefficiencies

### 🟡 `'use client'` boundary placement
- Many page-level components may be `'use client'` when only a small interactive island needs client rendering
- Exact impact requires component-by-component audit
- **Recommendation:** ❌ **Audit** when optimizing specific pages; not a systemic issue

### 🟡 Notification bell polls every 30s (`notification-bell.tsx`)
- Polling-based real-time instead of WebSocket/SSE
- Causes unnecessary re-renders and network requests
- **Fix:** Replace with Server-Sent Events or WebSocket
- **Risk:** Medium — architecture change
- **Recommendation:** ❌ **Future enhancement**; polling is acceptable for MVP

---

## 7. Bundle Size

### 🟡 `lucide-react` (29 MB) — Tree-shakeable but all icons bundled?
- If using dynamic `lucide-react` imports (not string-based), only used icons are bundled
- If using `import { * }` or string-based icon resolution, all 1000+ icons may be bundled
- **Fix:** Verify import patterns — prefer `import { X, Y } from "lucide-react"`
- **Recommendation:** ✅ **Quick check** — if dynamic imports found, refactor to named imports

---

## 8. Security Residual

### 🟡 `src/lib/email/logger-provider.ts` logs email content to console
- In production, this is acceptable only if the logger provider is never selected
- Should ensure `EMAIL_PROVIDER=logger` is never set in production
- **Recommendation:** ❌ **Document** in deployment guide; not a code fix

---

## Summary of Recommended Actions

### 🔴 Fix Now (Zero Risk)

| # | Action | File(s) |
|---|---|---|
| 1 | Delete dead service | `src/services/health.ts` |
| 2 | Delete 5 orphaned hooks | `use-admins.ts`, `use-audit-logs.ts`, `use-backlog.ts`, `use-invitations.ts`, `use-settings.ts` |
| 3 | Remove unused package | `@auth/prisma-adapter` from `package.json` |
| 4 | Move `prisma` to devDependencies | `package.json` |
| 5 | Remove dead export `getAuditActivity` | `services/audit.ts:52` |
| 6 | Remove dead export `getRecentProjects` | `services/projects.ts:146` |
| 7 | Delete duplicate `SortDirection` in `admin.ts` | `types/admin.ts:79` |
| 8 | Fix N+1 checklist query in board route | `projects/[id]/board/route.ts` |
| 9 | Fix sequential independent queries | `tasks/[id]/route.ts` |

### 🟠 Fix Next Sprint

| # | Action | File(s) |
|---|---|---|
| 10 | Merge `types/knowledge.ts` into `types/documentation.ts` | Both files |
| 11 | Add compound indexes to Prisma schema | `prisma/schema.prisma` |
| 12 | Replace component→service direct imports with hooks | `audit-export-dialog.tsx`, `notification-bell.tsx` |
| 13 | Extract `Pagination` and `ListResponse` to `types/common.ts` | 4–7 files |
| 14 | Fix overfetch in `sprints/[id]` | `sprints/[id]/route.ts` |

### 🟡 Future Improvements

| # | Action | File(s) |
|---|---|---|
| 15 | Investigate overfetch in `projects/[id]` | Route + UI |
| 16 | Merge small lib files | `notification/`, `email/` |
| 17 | Create service layer for integrations | `hooks/integrations.ts` |
| 18 | Audit `lucide-react` import patterns | Global search |
| 19 | Replace polling with SSE/WebSocket | `notification-bell.tsx` |
| 20 | Consolidate integration provider files | `lib/integrations/*.ts` |

---

## Audit Methodology

- **Scope:** All `src/` files, `package.json`, `prisma/schema.prisma`
- **Tools used:** Manual code review, full-text grep, import graph analysis, Prisma schema analysis
- **Verification:** `next build` passes after all "Fix Now" changes are applied
