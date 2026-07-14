# SprintFlow Enterprise — Technical Architecture & Engineering Blueprint

**Version:** 1.0.0
**Status:** Production Baseline
**Last Updated:** July 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Folder Structure](#3-folder-structure)
4. [Database Documentation](#4-database-documentation)
5. [Authentication](#5-authentication)
6. [Authorization Matrix](#6-authorization-matrix)
7. [API Documentation](#7-api-documentation)
8. [UI Architecture](#8-ui-architecture)
9. [Module Roadmap](#9-module-roadmap)
10. [Project Intelligence](#10-project-intelligence)
11. [Coding Standards](#11-coding-standards)
12. [Security Standards](#12-security-standards)
13. [Performance Strategy](#13-performance-strategy)
14. [Scalability Strategy](#14-scalability-strategy)
15. [Future Integrations](#15-future-integrations)
16. [Development Roadmap](#16-development-roadmap)
17. [Technical Debt Review](#17-technical-debt-review)

---

## 1. Project Overview

### 1.1 Project Vision

SprintFlow is a production-grade, enterprise Agile Delivery and Project Management Platform. It replaces spreadsheets and disconnected tools with a unified workspace for planning, tracking, and delivering software projects. The platform is designed from the ground up for security, performance, and scalability at enterprise scale.

### 1.2 Business Goals

- Provide a single source of truth for project, sprint, and task management
- Enable role-based access control with fine-grained permissions
- Deliver actionable project intelligence through real-time analytics
- Support enterprise authentication via Google OAuth with zero-trust principles
- Maintain a complete audit trail of every action for compliance
- Provide a foundation for AI-assisted project management

### 1.3 Target Users

| Role | System-Level | Description |
|------|-------------|-------------|
| SUPER_ADMIN | System | Full platform control, user management, configuration |
| ADMIN | System | User management, cross-project visibility, platform operations |
| USER | System | Project participation, task management, collaboration |
| PROJECT_MANAGER | Project | Project ownership, sprint planning, member management |
| SCRUM_MASTER | Project | Sprint lifecycle, task board management, team facilitation |
| DEVELOPER | Project | Task execution, status updates, time tracking |
| TESTER | Project | QA verification, bug reporting, test execution |
| BUSINESS_ANALYST | Project | Requirements gathering, story creation, backlog grooming |
| VIEWER | Project | Read-only visibility into project artifacts |

### 1.4 Enterprise Use Cases

- Multi-project portfolio management with cross-project visibility
- Sprint planning, execution, and retrospective workflow
- Kanban-based task tracking with swimlanes and WIP limits
- Resource allocation and workload balancing across teams
- Executive dashboards with real-time project health metrics
- Compliance-ready audit logging for regulated industries
- Admin-provisioned user onboarding (no self-registration)

### 1.5 Key Differentiators

- **First-login SUPER_ADMIN bootstrap** — No manual admin setup required
- **Self-registration denied by default** — Enterprise security posture
- **Split role model** — System roles vs. project roles for clean separation of concerns
- **Dual audit trail** — Both `AuditLog` (admin-facing) and `ActivityLog` (user-facing)
- **Soft delete** — Recoverable deletions through `deletedAt` timestamps
- **Zod validation** — Type-safe API input validation on every endpoint
- **Framer Motion** — Production-grade animations without performance degradation
- **Dark/light theme** — Persistent theme system with CSS custom properties

### 1.6 Product Scope

**In scope (v1.0):**
- Google OAuth authentication
- Role-based access control (SystemRole + ProjectRole)
- Project CRUD with member management
- Sprint lifecycle management
- Task management with Kanban board
- Comments and collaboration
- Admin console (user provisioning)
- Audit logging and activity feeds
- Notifications framework
- Responsive dark/light UI design system

**Out of scope (v1.0):**
- Third-party integrations (Slack, Teams, GitHub, GitLab)
- BI exports (Excel, PDF, Power BI)
- AI features (predictive analytics, automated sprint planning)
- Real-time collaboration (WebSockets)
- Mobile native applications
- Marketplace/plugin system

### 1.7 Version Roadmap

| Version | Focus | Timeline |
|---------|-------|----------|
| **v1.0** | Core Platform — Auth, RBAC, Projects, Sprints, Tasks, Kanban, Admin | Current |
| **v1.1** | Sprint Analytics, Project Intelligence Dashboard | Q3 2026 |
| **v1.2** | Notifications Engine, Activity Feed | Q3 2026 |
| **v2.0** | Reports & Exports (PDF, Excel, Power BI), Calendar Integration | Q4 2026 |
| **v2.1** | Slack & Teams Integration, Email Notifications | Q1 2027 |
| **v3.0** | AI Assistant, Predictive Analytics, GraphQL API, Microservices | Q2 2027 |

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            DNS / CDN                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                  Next.js 16 Application Server                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                     Next.js App Router                           │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │   │
│  │  │  Server       │  │  Client       │  │  API Routes          │  │   │
│  │  │  Components   │  │  Components   │  │  (REST endpoints)    │  │   │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │   │
│  │  ┌──────────────────────────────────────────────────────────┐   │   │
│  │  │                    NextAuth.js v4                         │   │   │
│  │  │            (Google OAuth + Database Sessions)             │   │   │
│  │  └──────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────┤
│                  External Services                                      │
│  ┌─────────────────┐  ┌─────────────────┐                              │
│  │  Google OAuth    │  │  PostgreSQL      │                              │
│  │  (Identity)      │  │  (Primary DB)    │                              │
│  └─────────────────┘  └─────────────────┘                              │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Request Lifecycle

```
Client Request
    │
    ▼
Next.js Middleware (src/middleware.ts)
    │  - Matches protected routes (/dashboard, /admin, /projects, etc.)
    │  - Currently passthrough; auth is server-side
    ▼
App Router (file-based routing)
    │
    ├── Server Component Route (page.tsx)
    │   │  - Executes on server
    │   │  - Calls auth() for session
    │   │  - Calls prisma directly for data
    │   │  - Uses requireRole / requireProjectAccess for authorization
    │   │  - Returns pre-rendered HTML or client component bundle
    │   ▼
    │   Renders Client Components with data props
    │
    └── API Route (route.ts)
        │  - Executes on server
        │  - Called via fetch() from client components
        │  - Validates input with Zod schemas
        │  - Authorizes with authz helpers
        │  - Queries/updates database via Prisma
        │  - Logs to AuditLog
        │  - Returns JSON response
        ▼
    Response (JSON or HTML)
```

### 2.3 Authentication Flow

```
Google OAuth Flow:
    ┌─────────┐     ┌────────────┐     ┌──────────┐     ┌──────────┐
    │  User   │────►│  NextAuth  │────►│  Google  │────►│  Google  │
    │ (Client)│     │  (Server)  │     │  OAuth   │     │  API     │
    └─────────┘     └────────────┘     └──────────┘     └──────────┘
         │                │                  │                │
         │  1. Click      │  2. Redirect     │  3. Consent    │
         │  "Sign in"     │  to Google       │  screen        │
         │                │                  │                │
         │                │                  │  4. Auth code  │
         │                │                  ◄─────────────── │
         │                │  5. Exchange     │                │
         │                │  code for tokens │                │
         │                │  via Google      │                │
         │                ├──────────────────►                │
         │                │  6. Tokens       │                │
         │                ◄──────────────────┤                │
         │                │                  │                │
         │                │  7. signIn callback:              │
         │                │  - Lookup user by email           │
         │                │  - If exists + active → allow     │
         │                │  - If no SUPER_ADMIN exists →     │
         │                │    create first user as SUPER_ADMIN│
         │                │  - If not exists → deny with      │
         │                │    "/login?error=NoAccount"       │
         │                │                                    │
         │                │  8. Create session (database)     │
         │                │  9. Set session cookie             │
         │                │                                    │
         │  10. Redirect  │                                    │
         │  to /dashboard │                                    │
         ◄────────────────┘                                    │
```

### 2.4 Authorization Flow

```
API Request (e.g., PUT /api/projects/[id])
    │
    ▼
requireProjectAccess(projectId, ["PROJECT_MANAGER"])
    │
    ├── 1. Get session via auth()
    │     └── No session → 401 Unauthorized
    │
    ├── 2. Fetch user from DB (id, role)
    │     └── No user → 403 Forbidden
    │
    ├── 3. Is user SUPER_ADMIN or ADMIN?
    │     └── Yes → Allow (bypass project membership check)
    │
    ├── 4. Look up ProjectMember by (projectId, userId)
    │     └── No membership → 403 Forbidden
    │
    ├── 5. If allowedProjectRoles specified:
    │     └── Check member.roleInProject is in allowed list
    │         └── Not matching → 403 Forbidden
    │
    └── 6. Allow → Return { ok: true, user, session, member }
```

### 2.5 Database Flow

```
Client Component
    │
    ├── Server Component
    │   │
    │   └── auth() → Prisma (read session, user, data)
    │       │
    │       └── Returns props to client component
    │
    └── Client Component (useState, useEffect)
        │
        ├── User action (click, form submit)
        │
        ├── fetch() to /api/...
        │
        └── API Route
            │
            ├── auth() → get session
            ├── require*() → check authorization
            ├── Zod schema → validate input
            ├── prisma → execute query
            ├── auditLog → log action
            └── Response → return JSON
```

### 2.6 API Flow

```
fetch("GET /api/projects?projectId=abc", { credentials: "include" })
    │
    ▼
  requireRole(["SUPER_ADMIN", "ADMIN", "USER"])
    │  auth() → session cookie → session lookup → user lookup
    │
    ▼
  prisma.task.findMany({
    where: { projectId, deletedAt: null },
    include: { reporter, assignee, project, sprint, comments }
  })
    │
    ▼
  NextResponse.json({ tasks })
```

### 2.7 Future Scalability Architecture

```
┌────────────────────────────────────────────────────────────┐
│                      Load Balancer                          │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Next.js     │  │  Next.js     │  │  Next.js     │ ...   │
│  │  Instance 1  │  │  Instance 2  │  │  Instance N  │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                 │                 │               │
│         └─────────────────┼─────────────────┘               │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────┐        │
│  │              Redis Cache Layer                    │        │
│  │  (Sessions, Rate Limits, Query Cache, Pub/Sub)   │        │
│  └────────────────────────┬────────────────────────┘        │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────┐        │
│  │              PostgreSQL Primary                   │        │
│  │          (Read-Write, Writes, Migrations)         │        │
│  └────────────────────────┬────────────────────────┘        │
│                           │                                 │
│  ┌────────────────────────▼────────────────────────┐        │
│  │           PostgreSQL Read Replicas                │        │
│  │         (Read-heavy queries, dashboards)          │        │
│  └──────────────────────────────────────────────────┘        │
│                                                             │
│  Future:                                                     │
│  ┌─────────┐  ┌──────────┐  ┌───────────┐                  │
│  │ Bull     │  │ S3-like  │  │ WebSocket │                  │
│  │ Queue    │  │ Storage  │  │ Server    │                  │
│  └─────────┘  └──────────┘  └───────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Folder Structure

### 3.1 Current Structure

```
sprint-flow/
├── prisma/
│   ├── schema.prisma              # Data model (14 models, 9 enums)
│   ├── migrations/                # 5 migration files
│   │   ├── 20260601082145_init/
│   │   ├── 20260601091610_add_user_role/
│   │   ├── 20260609102024_add_jira_features/
│   │   ├── 20260618_fix_auditlog_relation/
│   │   └── 20260710_refactor_schema/
│   └── migration_lock.toml
│
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (providers, fonts, metadata)
│   │   ├── page.tsx               # Root page (redirects to /login or /dashboard)
│   │   ├── globals.css            # Design tokens, Tailwind imports, custom properties
│   │   ├── favicon.ico
│   │   │
│   │   ├── (app)/                 # Authenticated route group
│   │   │   ├── layout.tsx         # App layout (sidebar + content)
│   │   │   ├── dashboard/         # Dashboard pages
│   │   │   │   ├── page.tsx
│   │   │   │   ├── super-admin-dashboard.tsx
│   │   │   │   ├── admin-dashboard.tsx
│   │   │   │   └── user-dashboard.tsx
│   │   │   ├── admin/
│   │   │   │   └── page.tsx       # Admin console
│   │   │   └── projects/
│   │   │       ├── page.tsx       # Project listing
│   │   │       └── [id]/
│   │   │           └── page.tsx   # Project workspace (4-tab)
│   │   │
│   │   ├── login/
│   │   │   ├── page.tsx           # Login page (Suspense wrapper)
│   │   │   └── login-content.tsx  # Login client component
│   │   │
│   │   └── api/                   # API routes (16 route files)
│   │       ├── auth/[...nextauth]/
│   │       ├── admin/users/
│   │       ├── projects/
│   │       ├── sprints/
│   │       ├── tasks/
│   │       ├── notifications/
│   │       ├── health/
│   │       └── debug/oauth-cleanup/
│   │
│   ├── lib/                       # Shared utilities
│   │   ├── prisma.ts              # PrismaClient singleton
│   │   ├── authz.ts               # Authorization library
│   │   ├── validations.ts         # Zod schemas
│   │   └── cn.ts                  # Classname utility
│   │
│   ├── contexts/                  # React contexts
│   │   ├── theme-context.tsx      # Dark/light theme
│   │   └── toast-context.tsx      # Toast notifications
│   │
│   ├── components/
│   │   ├── ui/                    # 15 reusable UI primitives
│   │   ├── layout/                # Sidebar, PageContainer
│   │   ├── project/               # Board, Backlog, Members, Settings tabs
│   │   ├── create-project-modal.tsx
│   │   ├── create-task-modal.tsx
│   │   ├── task-details-modal.tsx
│   │   └── session-provider.tsx
│   │
│   ├── types/
│   │   └── next-auth.d.ts         # Session type extensions
│   │
│   ├── auth.ts                    # NextAuth configuration
│   └── middleware.ts              # Route matching (passthrough)
│
├── public/                        # Static assets (SVGs)
├── package.json
├── tsconfig.json
├── next.config.ts
├── prisma.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── .env.example
└── .gitignore
```

### 3.2 Folder Responsibilities

| Folder | Responsibility |
|--------|---------------|
| `prisma/` | Database schema, migration history, Prisma Client configuration |
| `src/app/` | Next.js App Router — all pages, layouts, and API routes |
| `src/app/(app)/` | Authenticated route group (requires session) — wraps all protected pages with sidebar layout |
| `src/app/api/` | REST API endpoints — each subfolder maps to an API route segment |
| `src/lib/` | Pure utility code — no JSX, no React hooks. Prisma client, authz helpers, Zod schemas, classnames |
| `src/contexts/` | React context providers — theme persistence, toast notification queue |
| `src/components/ui/` | Design system primitives — buttons, inputs, cards, dialogs, etc. |
| `src/components/layout/` | Application layout components — sidebar navigation, page containers |
| `src/components/project/` | Project workspace tab content — board, backlog, members, settings |
| `src/types/` | TypeScript type declarations and module augmentations |
| `public/` | Static files served at the root path |

### 3.3 Recommended Improvements

1. **Consolidate `lib/` → `lib/authz.ts`** removes SystemRole import (already done) but also re-evaluate the `requireRole` calls that reference legacy role values in `projects/route.ts` GET and `notifications/route.ts` GET.
2. **Extract `src/components/` sub-features** — create `src/components/features/` for `create-project-modal`, `create-task-modal`, `task-details-modal` (they are feature-specific, not shared).
3. **Add `src/hooks/`** for custom React hooks (e.g., `useProject`, `useSprints`, `useTasks`).
4. **Add `src/server/`** for server-only utilities that should never execute on the client.
5. **Add `src/config/`** for application configuration constants (role lists, feature flags, page sizes).
6. **Empty directories** — `src/components/dashboards/` and `src/components/shared/` should be removed or populated.

---

## 4. Database Documentation

### 4.1 Entity Relationship Diagram

```
┌─────────┐       ┌───────────┐       ┌─────────────┐
│  User   │1──N──>│  Account  │       │  Sprint     │
└─────────┘       └───────────┘       └─────────────┘
     │                                    │
     │1──N──>┌──────────────┐             │N
     │       │  ProjectMember│             │
     │       └──────────────┘             │
     │            │                        │
     │            │N                       │1
     │            ▼                        │
     │1──N──>┌─────────┐1──N──>┌──────┐   │
     │       │ Project │       │ Task │<──┘
     │       └─────────┘       └──────┘
     │            │                │
     │            │                │1──N──>┌──────────┐
     │            │                │       │ Comment  │
     │            │                │       └──────────┘
     │            │                │
     │            │                │1──N──>┌────────────┐
     │            │                │       │ Attachment │
     │            │                │       └────────────┘
     │            │                │
     │1──N──>┌──────────────┐      │
     │       │ Notification │      │
     │       └──────────────┘      │
     │                            │
     │1──N──>┌──────────┐         │
     │       │AuditLog  │<────────┘
     │       └──────────┘  (actorId)
     │
     │1──N──>┌────────────┐
     │       │ActivityLog │
     │       └────────────┘
     │
     │1──N──>┌────────────┐
     │       │ Invitation │
     │       └────────────┘
     │
     │1──N──>┌──────────┐
     │       │  Session │
     │       └──────────┘
```

### 4.2 Enums

| Enum | Values | Used By | Purpose |
|------|--------|---------|---------|
| `SystemRole` | `SUPER_ADMIN`, `ADMIN`, `USER` | `User.role` | System-level authorization — who can access admin panels, manage users |
| `ProjectRole` | `PROJECT_MANAGER`, `SCRUM_MASTER`, `DEVELOPER`, `TESTER`, `BUSINESS_ANALYST`, `VIEWER` | `ProjectMember.roleInProject`, `Invitation.role` | Project-level permissions — what you can do inside a project |
| `ProjectStatus` | `PLANNING`, `ACTIVE`, `ON_HOLD`, `COMPLETED`, `ARCHIVED`, `CANCELLED` | `Project.status` | Lifecycle state of a project |
| `SprintStatus` | `PLANNING`, `ACTIVE`, `COMPLETED`, `CANCELLED` | `Sprint.status` | Lifecycle state of a sprint |
| `TaskStatus` | `TODO`, `IN_PROGRESS`, `IN_REVIEW`, `QA_TESTING`, `DONE`, `BLOCKED`, `REOPENED` | `Task.status` | Full Agile workflow for task completion |
| `TaskPriority` | `LOWEST`, `LOW`, `MEDIUM`, `HIGH`, `HIGHEST`, `CRITICAL` | `Task.priority` | Priority levels including critical for P1 incidents |
| `TaskType` | `TASK`, `BUG`, `STORY` | `Task.type` | Work item classification |
| `ProjectVisibility` | `PRIVATE`, `TEAM`, `PUBLIC` | `Project.visibility` | Access scope for project visibility |
| `InvitationStatus` | `PENDING`, `ACCEPTED`, `EXPIRED`, `REVOKED` | `Invitation.status` | Lifecycle state of an email invitation |

### 4.3 Models

#### User

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | `String` | PK, `@default(cuid())` | Unique identifier |
| `email` | `String` | `@unique`, NOT NULL | Login identity, must be unique |
| `name` | `String?` | nullable | Display name from Google profile |
| `image` | `String?` | nullable | Avatar URL from Google profile |
| `role` | `SystemRole` | NOT NULL, `@default(USER)` | System-level authorization |
| `department` | `String?` | nullable | Organizational grouping |
| `designation` | `String?` | nullable | Job title |
| `isActive` | `Boolean` | NOT NULL, `@default(true)` | Account enable/disable |
| `lastLoginAt` | `DateTime?` | nullable | Last login timestamp |
| `deletedAt` | `DateTime?` | nullable | Soft-delete timestamp |
| `createdAt` | `DateTime` | `@default(now())` | Record creation time |
| `updatedAt` | `DateTime` | `@updatedAt` | Record last update time |

**Indexes:** `[email]`, `[role]`, `[isActive]`, `[deletedAt]`

**Relations:**
- `accounts Account[]` — OAuth provider accounts
- `sessions Session[]` — Active sessions
- `projects ProjectMember[]` — Project memberships
- `ownedProjects Project[] @relation("ProjectOwner")` — Projects where user is owner
- `createdProjects Project[] @relation("ProjectCreator")` — Projects created by user
- `updatedProjects Project[] @relation("ProjectUpdater")` — Projects last updated by user
- `createdSprints Sprint[] @relation("SprintCreator")` — Sprints created by user
- `updatedSprints Sprint[] @relation("SprintUpdater")` — Sprints last updated by user
- `tasksReported Task[] @relation("TaskReporter")` — Tasks reported by user
- `tasksAssigned Task[] @relation("TaskAssignee")` — Tasks assigned to user
- `updatedTasks Task[] @relation("TaskUpdater")` — Tasks last updated by user
- `comments Comment[]` — Comments authored by user
- `notifications Notification[]` — Notifications for user
- `attachments Attachment[]` — Attachments uploaded by user
- `auditLogs AuditLog[]` — Audit entries for actions by user
- `activityLogs ActivityLog[]` — Activity stream entries for user
- `sentInvitations Invitation[] @relation("InvitationSender")` — Invitations sent by user

#### Account (NextAuth requirement)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `userId` | `String` | FK → `User.id` CASCADE | Links to user |
| `type` | `String` | NOT NULL | OAuth account type |
| `provider` | `String` | PK (composite) | OAuth provider name (e.g., "google") |
| `providerAccountId` | `String` | PK (composite) | User ID from provider |
| `refresh_token` | `String?` | nullable | OAuth refresh token |
| `access_token` | `String?` | nullable | OAuth access token |
| `expires_at` | `Int?` | nullable | Token expiry timestamp |
| `token_type` | `String?` | nullable | OAuth token type |
| `scope` | `String?` | nullable | OAuth scopes |
| `id_token` | `String?` | nullable | OpenID ID token |
| `session_state` | `String?` | nullable | Session state |

**Indexes:** `[userId]`

#### Session (NextAuth requirement)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | `String` | PK, cuid | Unique identifier |
| `sessionToken` | `String` | `@unique` | Session token (cookie value) |
| `userId` | `String` | FK → `User.id` CASCADE | Links to user |
| `expires` | `DateTime` | NOT NULL | Session expiry |

**Indexes:** `[userId]`

#### VerificationToken (NextAuth requirement)

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `identifier` | `String` | PK (composite) | Email or identifier |
| `token` | `String` | `@unique`, PK (composite) | Verification token |
| `expires` | `DateTime` | NOT NULL | Token expiry |

#### Project

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | `String` | PK, cuid | Unique identifier |
| `name` | `String` | NOT NULL | Project display name |
| `code` | `String` | `@unique`, NOT NULL | Short code (e.g., "SPRINT") |
| `description` | `String?` | nullable | Project description |
| `status` | `ProjectStatus` | NOT NULL, `@default(PLANNING)` | Project lifecycle state |
| `visibility` | `ProjectVisibility` | NOT NULL, `@default(PRIVATE)` | Access scope |
| `ownerId` | `String` | FK → `User.id` RESTRICT | Project owner |
| `createdById` | `String` | FK → `User.id` RESTRICT | Creator (audit) |
| `updatedById` | `String?` | FK → `User.id` SET NULL | Last updater (audit) |
| `deletedAt` | `DateTime?` | nullable | Soft-delete timestamp |
| `createdAt` | `DateTime` | `@default(now())` | Creation time |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update time |

**Indexes:** `[ownerId]`, `[createdById]`, `[status]`, `[visibility]`, `[deletedAt]`, `[code]`

**Relations:**
- `owner User @relation("ProjectOwner")` — Who owns this project
- `createdBy User @relation("ProjectCreator")` — Who created this project
- `updatedBy User? @relation("ProjectUpdater")` — Who last updated this project
- `members ProjectMember[]` — Project memberships
- `sprints Sprint[]` — Project sprints
- `tasks Task[]` — Project tasks

#### ProjectMember

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | `String` | PK, cuid | Unique identifier |
| `projectId` | `String` | FK → `Project.id` CASCADE | Links to project |
| `userId` | `String` | FK → `User.id` CASCADE | Links to user |
| `roleInProject` | `ProjectRole` | NOT NULL, `@default(VIEWER)` | Project-level role |
| `createdAt` | `DateTime` | `@default(now())` | When added to project |

**Unique constraint:** `@@unique([projectId, userId])` — one membership per user per project

**Indexes:** `[userId]`, `[roleInProject]`

#### Sprint

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | `String` | PK, cuid | Unique identifier |
| `projectId` | `String` | FK → `Project.id` CASCADE | Links to project |
| `name` | `String` | NOT NULL | Sprint name (e.g., "Sprint 1") |
| `goal` | `String?` | nullable | Sprint goal |
| `status` | `SprintStatus` | NOT NULL, `@default(PLANNING)` | Sprint lifecycle |
| `createdById` | `String` | FK → `User.id` RESTRICT | Creator (audit) |
| `updatedById` | `String?` | FK → `User.id` SET NULL | Last updater (audit) |
| `startDate` | `DateTime?` | nullable | Sprint start date |
| `endDate` | `DateTime?` | nullable | Sprint end date |
| `deletedAt` | `DateTime?` | nullable | Soft-delete timestamp |
| `createdAt` | `DateTime` | `@default(now())` | Creation time |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update time |

**Indexes:** `[projectId]`, `[createdById]`, `[status]`, `[deletedAt]`

#### Task

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | `String` | PK, cuid | Unique identifier |
| `projectId` | `String` | FK → `Project.id` CASCADE | Links to project |
| `sprintId` | `String?` | FK → `Sprint.id` SET NULL | Sprint assignment |
| `title` | `String` | NOT NULL | Task title |
| `description` | `String?` | nullable | Task description |
| `status` | `TaskStatus` | NOT NULL, `@default(TODO)` | Task workflow state |
| `priority` | `TaskPriority` | NOT NULL, `@default(MEDIUM)` | Task priority |
| `type` | `TaskType` | NOT NULL, `@default(TASK)` | Work item type |
| `originalEstimate` | `Int?` | nullable | Estimated effort (minutes) |
| `timeSpent` | `Int?` | nullable | Logged time (minutes) |
| `timeRemaining` | `Int?` | nullable | Remaining effort (minutes) |
| `reporterId` | `String` | FK → `User.id` RESTRICT | Who created the task |
| `assigneeId` | `String?` | FK → `User.id` SET NULL | Who is assigned |
| `updatedById` | `String?` | FK → `User.id` SET NULL | Who last updated |
| `storyPoints` | `Int?` | nullable | Agile story points |
| `dueDate` | `DateTime?` | nullable | Task deadline |
| `deletedAt` | `DateTime?` | nullable | Soft-delete timestamp |
| `createdAt` | `DateTime` | `@default(now())` | Creation time |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update time |

**Indexes:** `[projectId]`, `[sprintId]`, `[assigneeId]`, `[reporterId]`, `[status]`, `[priority]`, `[dueDate]`, `[deletedAt]`

#### Comment

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | `String` | PK, cuid | Unique identifier |
| `taskId` | `String` | FK → `Task.id` CASCADE | Links to task |
| `authorId` | `String` | FK → `User.id` CASCADE | Comment author |
| `content` | `String` | NOT NULL | Comment body |
| `createdAt` | `DateTime` | `@default(now())` | Creation time |
| `updatedAt` | `DateTime` | `@updatedAt` | Last edit time |

**Indexes:** `[taskId]`, `[authorId]`

#### Attachment

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | `String` | PK, cuid | Unique identifier |
| `taskId` | `String` | FK → `Task.id` CASCADE | Links to task |
| `userId` | `String` | FK → `User.id` CASCADE | Uploader |
| `fileName` | `String` | NOT NULL | Original filename |
| `fileUrl` | `String` | NOT NULL | Storage URL |
| `fileSize` | `Int?` | nullable | File size in bytes |
| `mimeType` | `String?` | nullable | MIME type |
| `createdAt` | `DateTime` | `@default(now())` | Upload time |

**Indexes:** `[taskId]`, `[userId]`

#### Notification

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | `String` | PK, cuid | Unique identifier |
| `recipientId` | `String` | FK → `User.id` CASCADE | Target user |
| `title` | `String` | NOT NULL | Notification title |
| `message` | `String` | NOT NULL | Notification body |
| `type` | `String` | NOT NULL, `@default("INFO")` | Type (INFO, WARNING, ERROR, etc.) |
| `readAt` | `DateTime?` | nullable | When read (null = unread) |
| `createdAt` | `DateTime` | `@default(now())` | Creation time |

**Indexes:** `[recipientId]`, `[readAt]`, `[createdAt]`

#### Invitation

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | `String` | PK, cuid | Unique identifier |
| `email` | `String` | NOT NULL | Invitee email |
| `projectId` | `String?` | nullable | Target project (optional) |
| `role` | `ProjectRole` | NOT NULL, `@default(VIEWER)` | Proposed project role |
| `status` | `InvitationStatus` | NOT NULL, `@default(PENDING)` | Invitation state |
| `senderId` | `String` | FK → `User.id` CASCADE | Who sent the invitation |
| `token` | `String` | `@unique`, `@default(cuid())` | Unique acceptance token |
| `expiresAt` | `DateTime` | NOT NULL | Expiry date |
| `acceptedAt` | `DateTime?` | nullable | When accepted |
| `createdAt` | `DateTime` | `@default(now())` | Creation time |
| `updatedAt` | `DateTime` | `@updatedAt` | Last update time |

**Indexes:** `[email]`, `[status]`, `[senderId]`

#### AuditLog

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | `String` | PK, cuid | Unique identifier |
| `actorId` | `String?` | FK → `User.id` SET NULL | Who performed the action |
| `entityType` | `String` | NOT NULL | Entity type (PROJECT, TASK, USER, etc.) |
| `entityId` | `String` | NOT NULL | Entity ID |
| `action` | `String` | NOT NULL | Action performed (CREATE_PROJECT, UPDATE_TASK, etc.) |
| `details` | `String?` | nullable | Human-readable details |
| `createdAt` | `DateTime` | `@default(now())` | When action occurred |

**Indexes:** `[actorId]`, `[entityType, entityId]`, `[createdAt]`

#### ActivityLog

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | `String` | PK, cuid | Unique identifier |
| `userId` | `String` | FK → `User.id` CASCADE | Target user (whose feed) |
| `entityType` | `String` | NOT NULL | Entity type |
| `entityId` | `String` | NOT NULL | Entity ID |
| `action` | `String` | NOT NULL | Action performed |
| `metadata` | `Json?` | nullable | Structured JSON context |
| `createdAt` | `DateTime` | `@default(now())` | When activity occurred |

**Indexes:** `[userId]`, `[entityType, entityId]`, `[createdAt]`

### 4.4 Foreign Key Summary

| FK | From | To | On Delete | Purpose |
|----|------|----|-----------|---------|
| `Account_userId_fkey` | `Account.userId` | `User.id` | `CASCADE` | Delete accounts when user is deleted |
| `Session_userId_fkey` | `Session.userId` | `User.id` | `CASCADE` | Delete sessions when user is deleted |
| `Project_ownerId_fkey` | `Project.ownerId` | `User.id` | `RESTRICT` | Prevent deleting user who owns projects |
| `Project_createdById_fkey` | `Project.createdById` | `User.id` | `RESTRICT` | Preserve creator audit trail |
| `Project_updatedById_fkey` | `Project.updatedById` | `User.id` | `SET NULL` | Allow user deletion, retain rest of record |
| `ProjectMember_projectId_fkey` | `ProjectMember.projectId` | `Project.id` | `CASCADE` | Delete memberships when project is deleted |
| `ProjectMember_userId_fkey` | `ProjectMember.userId` | `User.id` | `CASCADE` | Delete memberships when user is deleted |
| `Sprint_projectId_fkey` | `Sprint.projectId` | `Project.id` | `CASCADE` | Delete sprints when project is deleted |
| `Sprint_createdById_fkey` | `Sprint.createdById` | `User.id` | `RESTRICT` | Preserve creator audit trail |
| `Sprint_updatedById_fkey` | `Sprint.updatedById` | `User.id` | `SET NULL` | Allow user deletion |
| `Task_projectId_fkey` | `Task.projectId` | `Project.id` | `CASCADE` | Delete tasks when project is deleted |
| `Task_sprintId_fkey` | `Task.sprintId` | `Sprint.id` | `SET NULL` | Keep tasks when sprint is deleted |
| `Task_reporterId_fkey` | `Task.reporterId` | `User.id` | `RESTRICT` | Preserve reporter audit trail |
| `Task_assigneeId_fkey` | `Task.assigneeId` | `User.id` | `SET NULL` | Keep task when assignee is deleted |
| `Task_updatedById_fkey` | `Task.updatedById` | `User.id` | `SET NULL` | Allow user deletion |
| `Comment_taskId_fkey` | `Comment.taskId` | `Task.id` | `CASCADE` | Delete comments when task is deleted |
| `Comment_authorId_fkey` | `Comment.authorId` | `User.id` | `CASCADE` | Delete comments when user is deleted |
| `Attachment_taskId_fkey` | `Attachment.taskId` | `Task.id` | `CASCADE` | Delete attachments when task is deleted |
| `Attachment_userId_fkey` | `Attachment.userId` | `User.id` | `CASCADE` | Delete attachments when user is deleted |
| `Notification_recipientId_fkey` | `Notification.recipientId` | `User.id` | `CASCADE` | Delete notifications when user is deleted |
| `Invitation_senderId_fkey` | `Invitation.senderId` | `User.id` | `CASCADE` | Delete invitations when sender is deleted |
| `AuditLog_actorId_fkey` | `AuditLog.actorId` | `User.id` | `SET NULL` | Preserve audit log when user is deleted |
| `ActivityLog_userId_fkey` | `ActivityLog.userId` | `User.id` | `CASCADE` | Delete activity log when user is deleted |

### 4.5 Index Strategy

All foreign keys are indexed for JOIN performance. Additionally:

- **Status/permission filtering indexes**: `User.role`, `User.isActive`, `Project.status`, `Project.visibility`, `ProjectMember.roleInProject`, `Sprint.status`, `Task.status`, `Task.priority`
- **Temporal query indexes**: `Task.dueDate`, `Notification.createdAt`, `Notification.readAt`, `AuditLog.createdAt`, `ActivityLog.createdAt`
- **Soft-delete indexes**: `User.deletedAt`, `Project.deletedAt`, `Sprint.deletedAt`, `Task.deletedAt`
- **Lookup indexes**: `User.email`, `Project.code`, `Invitation.email`
- **Composite indexes**: `AuditLog[entityType, entityId]`, `ActivityLog[entityType, entityId]`

---

## 5. Authentication

### 5.1 Google OAuth Flow

1. User clicks "Sign in with Google" on `/login`
2. NextAuth redirects to Google's OAuth consent screen (`prompt=consent`, `access_type=offline`)
3. User consents, Google redirects back with authorization code
4. NextAuth exchanges code for tokens via Google API
5. `signIn` callback executes (see 5.2)
6. On success, NextAuth creates a database session (strategy: `database`)
7. Session cookie is set, user is redirected to `/dashboard`
8. On failure (e.g., denied registration), user is redirected to `/login?error=NoAccount`

### 5.2 SUPER_ADMIN Bootstrap Process

```
First Google login ever:
    │
    ├── Check: any existing user with SUPER_ADMIN role?
    │
    ├── No SUPER_ADMIN found:
    │   ├── Create User record with:
    │   │   - email (from Google profile)
    │   │   - name (from Google profile)
    │   │   - image (from Google profile)
    │   │   - role: SUPER_ADMIN
    │   │   - isActive: true
    │   │   - lastLoginAt: now()
    │   ├── Create Account record (OAuth linkage)
    │   └── Return true (allow sign in)
    │
    └── SUPER_ADMIN exists:
        └── Check: does this email match an existing User?
            ├── Yes → allow (with active check)
            └── No → deny (redirect to /login?error=NoAccount)
```

### 5.3 Login Flow

1. User visits `/` → server calls `auth()`
2. If session exists → redirect to `/dashboard`
3. If no session → render `login/page.tsx` with `Suspense`
4. `login-content.tsx` renders:
   - Animated SprintFlow logo
   - "Sign in with Google" button
   - Error message if `?error=NoAccount` (shows "No account exists" message)
   - Error message if `?error=OAuthSignin` (generic failure)
5. User clicks Google button → `signIn("google", { callbackUrl: "/dashboard" })`
6. After OAuth flow completes → redirect to `/dashboard` or error page

### 5.4 Session Flow

```
Strategy: "database" (sessions stored in Session table)

Server-side:
    auth() → getServerSession(authOptions)
        → Reads session cookie
        → Looks up Session in database
        → Checks expiry
        → Returns Session object with user.id and user.role

Client-side:
    SessionProvider (from next-auth/react) wraps the app
    useSession() → session, status, data
    The SessionProvider syncs with the server via /api/auth/session

Session augmentation (src/types/next-auth.d.ts):
    Session.user contains: id, role, name, email, image
    User type contains: role?
```

### 5.5 RBAC Flow

The authorization system operates at two levels:

**System-level (User.role):**
- Checked by `requireRole()`, `requireAdmin()`, `requireSuperAdmin()`
- Evaluated against `SystemRole` enum
- Determines access to global features (admin console, all projects)

**Project-level (ProjectMember.roleInProject):**
- Checked by `requireProjectAccess(projectId, allowedRoles)`
- Evaluated against `ProjectRole` enum
- SUPER_ADMIN and ADMIN bypass project-level checks
- Determines actions within a specific project

**Role hierarchy (for future use):**
```
SUPER_ADMIN:     100
ADMIN:           80
PROJECT_MANAGER: 60
SCRUM_MASTER:    55
DEVELOPER:       40
TESTER:          35
BUSINESS_ANALYST:30
USER:            20
VIEWER:          10
```
The `roleGte()` function enables threshold-based checks.

### 5.6 Unauthorized Access Flow

| Scenario | Response | Status Code |
|----------|----------|-------------|
| No session cookie | `{ error: "Forbidden" }` | 401 |
| Invalid/expired session | `{ error: "Forbidden" }` | 401 |
| Authenticated but wrong role | `{ error: "Forbidden" }` | 403 |
| Authenticated but not in project | `{ error: "Forbidden" }` | 403 |
| Authenticated but wrong project role | `{ error: "Forbidden" }` | 403 |
| Inactive user during sign-in | Redirect to login (denied) | — |
| Unregistered email sign-in | Redirect to `/login?error=NoAccount` | — |

### 5.7 Invitation Flow

```
Admin creates user record via Admin Console
    │
    ├── User record created with email + role
    │
    └── When that user logs in via Google OAuth:
        ├── email matches existing User record → allow
        └── email doesn't match → deny
```

The `Invitation` model exists for future email-based invitation workflows but is not currently wired into the sign-in flow. The current flow relies on admin pre-provisioning.

---

## 6. Authorization Matrix

### 6.1 System-Level Permissions

| Feature | SUPER_ADMIN | ADMIN | USER |
|---------|:-----------:|:-----:|:----:|
| Manage platform users | ✓ | ✓ | ✗ |
| Set user roles | ✓ | ✓ | ✗ |
| View all users | ✓ | ✓ | ✗ |
| Create projects | ✓ | ✓ | ✓ |
| View all projects | ✓ | ✓ | ✗¹ |
| View own projects | ✓ | ✓ | ✓¹ |
| Access admin console | ✓ | ✓ | ✗ |
| View audit logs | ✓ | ✗ | ✗ |
| View system activity | ✓ | ✗ | ✗ |
| Modify own profile | ✓ | ✓ | ✓ |

¹ _USER sees only projects they are a member of. SUPER_ADMIN/ADMIN see all projects._

### 6.2 Project-Level Permissions

| Feature | PM | SM | DEV | TESTER | BA | VIEWER |
|---------|:--:|:--:|:---:|:------:|:--:|:------:|
| **View project** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Edit project settings** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Delete project** | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Manage members** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Create sprint** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Start/complete sprint** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Edit sprint** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Create task** | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| **Edit any task** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Edit own task** | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| **Delete task** | ✓ | ✓ | ✗² | ✗² | ✗² | ✗² |
| **Assign tasks** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Comment** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Delete any comment** | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| **Delete own comment** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| **View reports** | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |

² _Task creator (reporter) can also delete their own tasks._

³ _For SUPER_ADMIN and ADMIN, all project-level permissions are granted regardless of project role._

### 6.3 Future-Proof Matrix

The authorization system supports adding new roles without code changes:

- Add value to `ProjectRole` enum → migration
- Update `authz.ts` `requireProjectAccess()` calls as needed
- The `roleGte()` hierarchy function supports threshold-based permission checks without explicit role enumeration

---

## 7. API Documentation

### 7.1 Authentication

#### `POST /api/auth/[...nextauth]`

NextAuth catch-all handler for Google OAuth.

- **Auth:** None (public)
- **Body:** Varies (OAuth protocol)
- **Response:** Redirect to Google OAuth or callback
- **Errors:** Redirect to `/login?error=...`

#### `GET /api/auth/session`

Current session info (used by NextAuth SessionProvider).

- **Auth:** Cookie-based
- **Response:** `Session` object or `null`

### 7.2 Health

#### `GET /api/health`

- **Auth:** None
- **Response:** `{ ok: true, service: "SprintFlow API", timestamp: "..." }`
- **Status:** 200

### 7.3 Projects

#### `GET /api/projects`

List all accessible projects.

- **Auth:** `requireRole(["SUPER_ADMIN", "ADMIN", "USER"])`
- **Query:** None
- **Response:** `{ projects: Project[] }` — includes members with user details
- **Behavior:** SUPER_ADMIN/ADMIN see all; USER sees only projects they belong to
- **Status:** 200 | 401 | 403

#### `POST /api/projects`

Create a new project.

- **Auth:** `requireRole(["SUPER_ADMIN", "ADMIN", "USER"])`
- **Body:** `projectCreateSchema` — `{ name, code, description?, visibility? }`
- **Validation:** Zod `projectCreateSchema`
- **Audit:** Creates audit log `CREATE_PROJECT`
- **Side effect:** Creator auto-added as PROJECT_MANAGER member
- **Response:** `{ project: Project }`
- **Status:** 200 | 400 | 401 | 403

#### `GET /api/projects/[id]`

Get project details.

- **Auth:** `requireProjectAccess(id)` — any member
- **Includes:** members (with user), sprints (ordered by createdAt desc), tasks (with assignee/reporter)
- **Response:** `{ project: Project }`
- **Status:** 200 | 403 | 404

#### `PUT /api/projects/[id]`

Update project settings.

- **Auth:** `requireProjectAccess(id, ["PROJECT_MANAGER", "SCRUM_MASTER"])`
- **Body:** `projectUpdateSchema` — `{ name?, description?, visibility?, status? }`
- **Validation:** Zod `projectUpdateSchema`
- **Audit:** Creates audit log `UPDATE_PROJECT`
- **Response:** `{ project: Project }`
- **Status:** 200 | 400 | 403 | 404

#### `DELETE /api/projects/[id]`

Delete a project.

- **Auth:** `requireProjectAccess(id, ["PROJECT_MANAGER"])`
- **Audit:** Creates audit log `DELETE_PROJECT`
- **Response:** `{ message: "Project deleted successfully" }`
- **Status:** 200 | 403 | 404

### 7.4 Project Members

#### `GET /api/projects/[id]/members`

List project members.

- **Auth:** `requireProjectAccess(id)` — any member
- **Includes:** user (id, name, email, image, role)
- **Response:** `{ members: ProjectMember[] }`
- **Status:** 200 | 403

#### `POST /api/projects/[id]/members`

Add or update a member.

- **Auth:** `requireProjectAccess(id, ["PROJECT_MANAGER", "SCRUM_MASTER"])`
- **Body:** `memberAddSchema` — `{ email, role? }`
- **Validation:** Zod `memberAddSchema`
- **Behavior:** Upserts membership (add or update role)
- **Error:** 404 if user email not found in the system
- **Audit:** Creates audit log `ADD_MEMBER`
- **Response:** `{ member, user }`
- **Status:** 200 | 400 | 403 | 404

#### `DELETE /api/projects/[id]/members?userId=xxx`

Remove a member.

- **Auth:** `requireProjectAccess(id, ["PROJECT_MANAGER", "SCRUM_MASTER"])`
- **Query:** `?userId=<user.id>`
- **Audit:** Creates audit log `REMOVE_MEMBER`
- **Response:** `{ message: "Member removed successfully" }`
- **Status:** 200 | 400 | 403

### 7.5 Sprints

#### `GET /api/projects/[id]/sprints`

List sprints for a project.

- **Auth:** `requireProjectAccess(id)` — any member
- **Response:** `{ sprints: Sprint[] }`
- **Status:** 200 | 403

#### `GET /api/sprints`

List all sprints.

- **Auth:** `requireRole(["SUPER_ADMIN", "ADMIN", "USER"])`
- **Response:** `{ sprints: Sprint[] }`
- **Status:** 200 | 401 | 403

#### `POST /api/sprints`

Create a sprint.

- **Auth:** `requireProjectAccess(projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"])`
- **Body:** `sprintCreateSchema` — `{ projectId, name, goal?, status?, startDate?, endDate? }`
- **Validation:** Zod `sprintCreateSchema`
- **Sets:** `createdById` to current user
- **Audit:** Creates audit log `CREATE_SPRINT`
- **Response:** `{ sprint: Sprint }`
- **Status:** 200 | 400 | 401 | 403

#### `PUT /api/sprints/[id]`

Update a sprint.

- **Auth:** `requireProjectAccess(sprint.projectId, ["PROJECT_MANAGER", "SCRUM_MASTER"])`
- **Body:** `sprintUpdateSchema` — `{ name?, goal?, status?, startDate?, endDate? }`
- **Validation:** Zod `sprintUpdateSchema`
- **Sets:** `updatedById` to current user
- **Side effect:** If `status` set to `COMPLETED`, unassigns incomplete tasks (sprintId → null)
- **Audit:** Creates audit log `UPDATE_SPRINT`
- **Response:** `{ sprint: Sprint }`
- **Status:** 200 | 400 | 403 | 404

### 7.6 Tasks

#### `GET /api/tasks?projectId=xxx`

List tasks.

- **Auth:** `requireRole(["SUPER_ADMIN", "ADMIN", "USER"])`
- **Query:** `?projectId=<project.id>` (optional)
- **Behavior:** Filters `deletedAt: null`. SUPER_ADMIN/ADMIN see all; USER sees project memberships
- **Includes:** reporter, assignee, project, sprint, comments (with author)
- **Response:** `{ tasks: Task[] }`
- **Status:** 200 | 401 | 403

#### `POST /api/tasks`

Create a task.

- **Auth:** `requireProjectAccess(projectId, ["PROJECT_MANAGER", "SCRUM_MASTER", "DEVELOPER"])`
- **Body:** `taskCreateSchema` — `{ projectId, title, description?, status?, priority?, type?, originalEstimate?, assigneeId?, sprintId?, storyPoints?, dueDate? }`
- **Validation:** Zod `taskCreateSchema`
- **Behavior:** Sets `reporterId` to current user, `timeRemaining` = `originalEstimate`
- **Audit:** Creates audit log `CREATE_TASK`
- **Response:** `{ task: Task }`
- **Status:** 200 | 400 | 401 | 403

#### `GET /api/tasks/[id]`

Get a single task.

- **Auth:** `requireProjectAccess(task.projectId)`
- **Behavior:** Filters `deletedAt: null`
- **Includes:** reporter, assignee, project, sprint, comments (with author)
- **Response:** `{ task: Task }`
- **Status:** 200 | 403 | 404

#### `PUT /api/tasks/[id]`

Update a task.

- **Auth:** `requireProjectAccess(task.projectId)`
- **Body:** `taskUpdateSchema` — any task field
- **Validation:** Zod `taskUpdateSchema`
- **Sets:** `updatedById` to current user
- **Audit:** Creates audit log `UPDATE_TASK` with list of changed fields
- **Response:** `{ task: Task }`
- **Status:** 200 | 400 | 403 | 404

#### `DELETE /api/tasks/[id]`

Soft-delete a task.

- **Auth:** `requireProjectAccess(task.projectId)` + additional checks:
  - Project role is PROJECT_MANAGER or SCRUM_MASTER, OR
  - Current user is task reporter, OR
  - Current user is SUPER_ADMIN or ADMIN
- **Behavior:** Sets `deletedAt` and `updatedById` instead of hard delete
- **Audit:** Creates audit log `DELETE_TASK`
- **Response:** `{ message: "Task deleted successfully" }`
- **Status:** 200 | 403 | 404

### 7.7 Comments

#### `POST /api/tasks/[id]/comments`

Add a comment to a task.

- **Auth:** `requireProjectAccess(task.projectId)`
- **Body:** `{ content: string }`
- **Validation:** Content must be non-empty after trim
- **Note:** Does not use `commentCreateSchema` from validations (inline validation)
- **Audit:** Creates audit log `ADD_COMMENT`
- **Response:** `{ comment: Comment }` — includes author details
- **Status:** 200 | 400 | 403 | 404

#### `DELETE /api/tasks/[id]/comments/[commentId]`

Delete a comment.

- **Auth:** `requireProjectAccess(task.projectId)` + additional checks:
  - Comment author, OR
  - PROJECT_MANAGER or SCRUM_MASTER, OR
  - SUPER_ADMIN or ADMIN
- **Audit:** Creates audit log `DELETE_COMMENT`
- **Response:** `{ message: "Comment deleted successfully" }`
- **Status:** 200 | 403 | 404

### 7.8 Admin

#### `GET /api/admin/users`

List all users.

- **Auth:** `requireAdmin()`
- **Response:** `{ users: User[] }`
- **Status:** 200 | 403

#### `POST /api/admin/users`

Create or upsert a user.

- **Auth:** `requireAdmin()`
- **Body:** `userCreateSchema` — `{ email, name?, role? }`
- **Validation:** Zod `userCreateSchema`
- **Behavior:** Upserts by email (creates if not exists, updates if exists)
- **Audit:** Creates audit log `CREATE_USER`
- **Response:** `{ message, user }`
- **Status:** 200 | 400 | 403

#### `PUT /api/admin/users/[id]`

Update a user's role, active status, or name.

- **Auth:** `requireRole(["SUPER_ADMIN", "ADMIN"])`
- **Body:** `userUpdateSchema` — `{ role?, isActive?, name? }`
- **Validation:** Zod `userUpdateSchema`
- **Audit:** Creates audit log `UPDATE_USER_ROLE`
- **Response:** `{ user: User }`
- **Status:** 200 | 400 | 403 | 404

### 7.9 Notifications

#### `GET /api/notifications`

List notifications for the current user.

- **Auth:** `requireRole([all roles])`
- **Response:** `{ notifications: Notification[] }`
- **Status:** 200 | 401 | 403

### 7.10 Debug

#### `GET /api/debug/oauth-cleanup?action=check|cleanup`

Debug-only OAuth cleanup utility.

- **Auth:** Requires `DEBUG_AUTH_ROUTES=true` AND localhost
- **Actions:** `check` — inspect user/accounts; `cleanup` — delete stale user records without linked accounts
- **Status:** 200 | 400 | 401 | 404 | 500

---

## 8. UI Architecture

### 8.1 Layouts

| Layout | File | Purpose |
|--------|------|---------|
| Root layout | `src/app/layout.tsx` | HTML shell, fonts (Geist), theme, toast providers, global metadata |
| App layout | `src/app/(app)/layout.tsx` | Authenticated route group — sidebar + content area |

### 8.2 Navigation

**Sidebar** (`src/components/layout/sidebar.tsx`):
- Fixed left sidebar (collapsible)
- SprintFlow logo at top
- Navigation links: Dashboard, Projects, Admin (conditional on role)
- Project list with quick links
- Theme toggle (dark/light)
- User profile section (avatar, name, role badge, sign out)
- "New Project" button opens `CreateProjectModal`

### 8.3 Dashboards

| Dashboard | File | Audience | Content |
|-----------|------|----------|---------|
| SUPER_ADMIN | `super-admin-dashboard.tsx` | SUPER_ADMIN only | Stats cards (users, projects, tasks, sprints), recent projects, system activity feed |
| ADMIN | `admin-dashboard.tsx` | ADMIN only | Stats cards (users, projects, tasks, sprints), recent projects, system activity feed |
| USER | `user-dashboard.tsx` | USER + all | Stats cards (projects, tasks, active sprints), assigned tasks, notifications |
| Selection | `page.tsx` | All | Reads `user.role`, conditionally renders the appropriate dashboard |

### 8.4 Reusable Components

**UI Primitives** (`src/components/ui/`):

| Component | Props | Variants |
|-----------|-------|----------|
| `Button` | variant, size, isLoading, leftIcon, rightIcon | primary, secondary, ghost, danger, success, outline, gradient |
| `Input` | label, error, helperText, leftIcon | — |
| `Select` | label, error, options, placeholder | — |
| `Textarea` | label, error | — |
| `Badge` | variant, size | default, primary, success, warning, danger, info, neutral |
| `StatusBadge` | status | Maps TaskStatus values to Badge variants |
| `PriorityBadge` | priority | Maps TaskPriority values, CRITICAL gets special styling |
| `TypeBadge` | type | Renders Bug (danger), Story (success), Task (info) |
| `RoleBadge` | role | Maps SystemRole to badge colors |
| `Card` | variant, hoverable, onClick | default, elevated, glass, gradient |
| `CardGrid` | — | Responsive grid container (1→2→4 columns) |
| `StatCard` | label, value, icon | Glass variant pre-configured |
| `Dialog` | isOpen, onClose, title, size | sm, md, lg, xl, full |
| `Skeleton` | variant, width, height | text, circular, rectangular |
| `CardSkeleton` | — | Loading card placeholder |
| `TableRowSkeleton` | columns | Loading table row |
| `DashboardSkeleton` | — | Full dashboard loading layout |
| `ListSkeleton` | rows | Loading list with avatar rows |
| `EmptyState` | icon?, title, description?, action? | — |
| `ErrorState` | title?, message?, onRetry? | — |
| `ToastContainer` | — | Renders toasts from ToastContext |
| `ConfirmDialog` | isOpen, onClose, onConfirm, title, message, variant | danger, warning, default |
| `PageHeader` | title, subtitle?, metadata?, actions? | Animated glass card style |
| `Avatar` | src?, name?, size? | sm, md, lg; gradient initials fallback |

### 8.5 Forms

| Form | Component | Fields | Validation |
|------|-----------|--------|------------|
| Create Project | `create-project-modal.tsx` | name, code (auto), description, visibility | Client-side + Zod server-side |
| Create Task | `create-task-modal.tsx` | type, title, description, status, priority, assignee, sprint, story points, estimate, due date | Client-side + Zod server-side |
| Task Details | `task-details-modal.tsx` | All editable task fields + comments | Zod on save |
| Add Member | `members-tab.tsx` | email, role | Client-side + Zod server-side |
| Edit User | `admin/page.tsx` | role, isActive | Zod on save |
| Create Sprint | `backlog-tab.tsx` | name, goal, duration, start date | Client-side + Zod server-side |
| Edit Project | `settings-tab.tsx` | name, description, visibility | Zod on save |

### 8.6 Design Tokens

Defined in `src/app/globals.css` as CSS custom properties on `:root` and `.dark`:

**Light theme (`:root`):**
```
--color-background: #f9fafb
--color-surface: #ffffff
--color-surface-elevated: #ffffff
--color-surface-hover: #f3f4f6
--color-foreground: #111827
--color-foreground-secondary: #6b7280
--color-foreground-muted: #9ca3af
--color-accent: #6366f1
--color-accent-hover: #5558e6
--color-accent-light: #eef2ff
--color-accent-foreground: #ffffff
--color-border: #e5e7eb
--color-destructive: #ef4444
--color-success: #10b981
--color-warning: #f59e0b
--color-info: #3b82f6
--shadow-card: 0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)
--shadow-dropdown: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)
--shadow-dialog: 0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)
```

**Dark theme (`.dark`):**
```
--color-background: #0f172a
--color-surface: #1e293b
--color-surface-elevated: #1e293b
--color-surface-hover: #334155
--color-foreground: #f1f5f9
--color-foreground-secondary: #94a3b8
--color-foreground-muted: #64748b
--color-accent: #818cf8
--color-accent-hover: #a5b4fc
--color-accent-light: #1e1b4b
--color-accent-foreground: #0f172a
--color-border: #334155
--color-destructive: #f87171
--color-success: #34d399
--color-warning: #fbbf24
--color-info: #60a5fa
--shadow-card: 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2)
--shadow-dropdown: 0 10px 15px -3px rgba(0,0,0,0.4), 0 4px 6px -4px rgba(0,0,0,0.3)
--shadow-dialog: 0 20px 25px -5px rgba(0,0,0,0.5), 0 8px 10px -6px rgba(0,0,0,0.4)
```

### 8.7 Theme System

- Provider: `ThemeProvider` in `src/contexts/theme-context.tsx`
- Persistence: `localStorage` key `sprintflow-theme`
- Default: `dark`
- Mechanism: Toggles `.dark`/`.light` class on `<html>` element
- Hook: `useTheme()` returns `{ theme, setTheme, toggleTheme, isDark }`
- Guard: SSR-safe — renders children immediately, applies theme in `useEffect`

---

## 9. Module Roadmap

| Module | Status | v1.0 | v1.1 | v1.2 | v2.0 | v2.1 | v3.0 |
|--------|:------:|:----:|:----:|:----:|:----:|:----:|:----:|
| Authentication (Google OAuth) | ✅ | ✓ | | | | | |
| Users & Admin Console | ✅ | ✓ | | | | | |
| Projects | ✅ | ✓ | | | | | |
| Project Members | ✅ | ✓ | | | | | |
| Sprints | ✅ | ✓ | | | | | |
| Backlog | ✅ | ✓ | | | | | |
| Kanban Board | ✅ | ✓ | | | | | |
| Tasks | ✅ | ✓ | | | | | |
| Comments | ✅ | ✓ | | | | | |
| Attachments | ⚙️ | ✓ | | | | | |
| Notifications | ⚙️ | | | ✓ | | | |
| Activity Feed | ⚙️ | | ✓ | | | | |
| Audit Logs | ✅ | ✓ | | | | | |
| Reports | 🔲 | | | | ✓ | | |
| Project Intelligence | 🔲 | | ✓ | | | | |
| AI Assistant | 🔲 | | | | | | ✓ |
| Settings | 🔲 | ✓ | | | | | |
| Administration | ✅ | ✓ | | | | | |

- ✅ = Implemented
- ⚙️ = Schema ready, UI/API wiring needed
- 🔲 = Planned

---

## 10. Project Intelligence

### 10.1 Overview

Project Intelligence is SprintFlow's flagship feature — an executive dashboard suite that transforms raw project data into actionable insights. It is designed for v1.1 delivery.

### 10.2 Planned Components

| Feature | Description | Priority |
|---------|-------------|----------|
| **Executive Dashboard** | Cross-project portfolio view with health indicators | P0 |
| **Project Health** | Composite score (schedule, quality, velocity, risk) | P0 |
| **Completion Rate** | % of tasks done vs. planned, trend over time | P1 |
| **Velocity Chart** | Story points completed per sprint, moving average | P1 |
| **Sprint Analytics** | Burndown charts, scope change tracking, velocity per sprint | P1 |
| **Risk Dashboard** | Blocked tasks, overdue items, bottlenecks | P1 |
| **Timeline View** | Gantt-style project timeline with milestones | P2 |
| **Workload Distribution** | Task assignment heatmap across team members | P2 |
| **Productivity Metrics** | Cycle time, lead time, throughput | P2 |
| **Member Analytics** | Individual contribution metrics, completion rate | P2 |
| **Project Insights** | Trend analysis, anomaly detection, recommendations | P2 |
| **Power BI Visualizations** | Chart.js or Recharts-based dashboard components | P1 |

### 10.3 Data Sources

All intelligence is derived from existing schema:
- `Task.status`, `Task.storyPoints`, `Task.timeSpent` for velocity and burndown
- `Sprint.startDate`, `Sprint.endDate`, `Sprint.status` for sprint analytics
- `Project.status` for project health
- `AuditLog` and `ActivityLog` for trend analysis
- `Task.assigneeId` for workload distribution

### 10.4 Future AI Analytics (v3.0)

- Predictive sprint completion forecasting
- Automated task assignment recommendations
- Anomaly detection in project velocity
- Natural language query interface for project data

---

## 11. Coding Standards

### 11.1 Naming Conventions

| Category | Convention | Examples |
|----------|------------|----------|
| Files/Directories | `kebab-case` | `task-details-modal.tsx`, `authz.ts` |
| React components | `PascalCase` | `ProjectCard`, `StatusBadge` |
| Functions/variables | `camelCase` | `getCurrentUser()`, `projectId` |
| Types/interfaces | `PascalCase` | `RoleCheckResult`, `TaskCreateInput` |
| Enums | `PascalCase` | `SystemRole`, `TaskStatus` |
| Enum values | `UPPER_SNAKE_CASE` | `SUPER_ADMIN`, `IN_PROGRESS` |
| Database columns | `camelCase` | `createdAt`, `roleInProject` |
| API routes | `kebab-case` | `/api/admin/users` |
| CSS classes | `kebab-case` | `bg-surface`, `text-foreground` |
| Environment variables | `UPPER_SNAKE_CASE` | `GOOGLE_CLIENT_ID` |

### 11.2 Folder Conventions

- One component per file
- Component folders for complex multi-file components
- Barrel exports from `index.ts` for component groups
- Route groups use `(group-name)` for organizational grouping

### 11.3 TypeScript Standards

- `strict: true` in tsconfig
- No `any` (enforced by ESLint warning)
- Explicit return types on public functions
- `z.infer<typeof schema>` for API input types
- Module augmentation for third-party types (see `next-auth.d.ts`)
- Use `Record<string, unknown>` instead of `object`

### 11.4 Prisma Standards

- Single PrismaClient instance via global cache in `prisma.ts`
- Use `@prisma/adapter-pg` for PostgreSQL connection
- All queries go through `authz` for authorization
- Use `include` for relations, not `select` (to avoid type issues)
- Soft deletes via `deletedAt` timestamp (not `delete()`)
- Audit logging via `AuditLog.create()` for all mutating operations

### 11.5 React Standards

- Server components by default
- Client components only when interactivity is needed (`"use client"`)
- Use `forwardRef` for form elements
- Framer Motion for animations
- Lucide React for icons
- Custom hooks for reusable state logic
- Context for global state (theme, toasts)
- Props over context for component-specific state

### 11.6 Next.js Standards

- App Router (not Pages Router)
- `page.tsx` for routes, `layout.tsx` for shared layouts
- `route.ts` for API endpoints
- `loading.tsx` for loading states (future)
- `error.tsx` for error boundaries (future)
- Server-side auth via `auth()` function
- Server-side data fetching in server components
- Client-side data fetching via `fetch()` to API routes

### 11.7 Validation Rules

- Zod schemas in `src/lib/validations.ts` for all API inputs
- One schema per entity per operation (create/update)
- `safeParse()` pattern — never use bare `parse()`
- Flattened error responses: `{ error, details }`
- Client-side validation as UX enhancement, server-side as security

### 11.8 API Standards

- RESTful patterns (not RPC)
- Consistent error shape: `{ error: string }` or `{ error: string, details: object }`
- Status codes: 200 (success), 400 (validation), 401 (unauthenticated), 403 (unauthorized), 404 (not found)
- No HTML responses from API routes
- No redirect from API routes
- Zod validation + authz check + prisma query pattern

### 11.9 Error Handling

- Try/catch at route handler level (not deep in libraries)
- Zod errors: `parsed.error.flatten()` for human-readable structure
- Auth errors: return `{ ok: false, status }` from authz helpers
- Database errors: let Prisma throw (caught by Next.js error boundary)
- Logging: `console.error` for server errors (replace with structured logging in future)

### 11.10 Testing Strategy

**Current state:** No test framework configured.

**Recommended:**
- Vitest for unit tests (lightning fast, Jest-compatible)
- React Testing Library for component tests
- Playwright for E2E tests
- Test priority: authz helpers → Zod validations → API routes → components

### 11.11 Git Commit Strategy

- Conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `chore:`, `test:`
- Descriptive commit messages referencing the changed concern
- Branch per feature/fix, squash merge to main

---

## 12. Security Standards

### 12.1 Authentication

- Google OAuth only (no email/password login)
- Database sessions (invalidate-able server-side)
- No self-registration — admin-provisioned users only
- First-login SUPER_ADMIN bootstrap (no default credentials)
- Inactive users blocked at sign-in (`isActive` check)
- `allowDangerousEmailAccountLinking: true` (required for Google re-consent flow)

### 12.2 Authorization

- Server-side authorization on every API route
- System roles for global permissions
- Project roles for project-level permissions
- SUPER_ADMIN/ADMIN bypass project-level checks
- Never trust client-side role values — always fetch from DB session
- `requireRole()`, `requireProjectAccess()`, `requireTaskAccess()` as authorization primitives

### 12.3 Input Validation

- Zod schemas on every POST/PUT/DELETE endpoint
- Type coercion prevented (`z.string()` doesn't accept numbers)
- Length limits on all string fields (title 500, description 5000, etc.)
- Enum validation via `z.enum()` — no arbitrary strings accepted for role/status/priority fields

### 12.4 Rate Limiting

**Current state:** Not implemented.

**Recommended:** Middleware-based rate limiting using token bucket algorithm, in-memory or Redis-backed.

### 12.5 XSS Protection

- React's built-in JSX escaping (no `dangerouslySetInnerHTML`)
- Content rendered as text, not HTML
- CSP headers through Next.js configuration (future)

### 12.6 CSRF Protection

- NextAuth provides built-in CSRF token for sign-in flows
- API routes use `SameSite=Lax` cookies for session
- No additional CSRF token needed (NextAuth handles it)

### 12.7 SQL Injection Prevention

- Prisma's parameterized queries (no raw SQL in application code)
- Prisma schema defines types, preventing type confusion
- All user input goes through Zod before reaching Prisma

### 12.8 Audit Logging

Every mutating API operation creates an `AuditLog` entry with:
- `actorId` — who did it (nullable for system actions)
- `entityType` — what type of entity was affected
- `entityId` — which specific entity
- `action` — what action was performed (`CREATE_PROJECT`, `UPDATE_TASK`, etc.)
- `details` — human-readable description
- `createdAt` — when it happened

### 12.9 Secrets Management

- Environment variables via `.env` (never committed)
- NEXTAUTH_SECRET for session encryption
- GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET for OAuth
- DATABASE_URL for database connection
- Missing env check at startup in `auth.ts`

### 12.10 Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXTAUTH_URL` | Yes | Application URL for OAuth redirect |
| `NEXTAUTH_SECRET` | Yes | Session encryption key |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth app ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth app secret |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `DEBUG_AUTH_ROUTES` | No | Enables debug endpoints (localhost only) |

### 12.11 Session Security

- Database sessions (not JWT) — can be revoked server-side
- Session cookie set by NextAuth (httpOnly, secure in production)
- Session expiry managed by NextAuth
- No custom session manipulation

---

## 13. Performance Strategy

### 13.1 Caching Strategy

**Current state:** No application-level caching.

**Recommended:**
- Next.js `stale-while-revalidate` (`useSWR` or `fetch` cache) for dashboard data
- React `cache()` function for server-side deduplication
- Prisma Client query caching (future, with Redis)
- Static pages where possible (`/login` is already static)

### 13.2 Lazy Loading

- Dashboard skeletons render immediately, content loads asynchronously
- Modals fetch data on open, not on mount
- Tab content lazy-loaded (only visible tab fetches data)

### 13.3 Streaming

- Next.js App Router supports `loading.tsx` for streaming boundaries
- Future: Stream dashboard sections independently using `Suspense` boundaries

### 13.4 Pagination

**Current state:** No pagination — all queries return complete result sets.

**Recommended:**
- `take`/`skip` on Task and AuditLog queries (most likely to grow)
- Cursor-based pagination for activity feeds
- Infinite scroll or "Load More" for task lists

### 13.5 Database Optimization

- Indexes on all FK columns and common query paths (implemented)
- Soft delete filtering via `{ deletedAt: null }` (implemented)
- `LIMIT` on dashboard queries (e.g., top 5 recent items)
- JSONB for ActivityLog metadata (queryable without additional tables)

### 13.6 Index Usage

All 37 indexes are designed for specific query patterns. See [Section 4.5](#45-index-strategy).

### 13.7 Query Optimization

- `select` with specific fields instead of full `include` where possible
- Batched queries for dashboard stats (combine counts into single query)
- Connection pooling via `@prisma/adapter-pg` (implemented)
- Prepared statements via Prisma Client (automatic)

### 13.8 Image Optimization

- Next.js `<Image>` component for optimization (needs migration from `<img>`)
- Google profile images served via `<img>` with direct URLs (no optimization needed)
- SVG assets for icons and logos (no optimization needed)

### 13.9 Bundle Optimization

- Tree-shakeable imports from `lucide-react` (import specific icons)
- `next/dynamic` for heavy components (future)
- Framer Motion tree-shakes automatically

### 13.10 Future Redis Integration

- Session cache (reduce DB reads for session validation)
- Query result cache (dashboard aggregations)
- Notification pub/sub
- Rate limiting backing store

---

## 14. Scalability Strategy

### 14.1 100,000+ Users

- Database sessions scale well with index on `Session.userId`
- User queries are already indexed by `email`, `role`, `isActive`
- Admin console pagination becomes critical at this scale

### 14.2 10,000+ Projects

- Project queries are scoped by membership (not global)
- Indexes on `Project.ownerId`, `Project.status`, `Project.deletedAt`
- Dashboard aggregation queries will need materialized views

### 14.3 Millions of Tasks

- Task queries are scoped by `projectId` (not global)
- `deletedAt` filter uses index
- Pagination becomes required (currently missing)
- Archive strategy: move completed/deleted tasks to a separate partition

### 14.4 Thousands of Concurrent Users

- Next.js server components are stateless (scale horizontally)
- Database connection pooling via Prisma's adapter
- Session database strategy handles concurrent requests
- Consider read replicas for dashboard queries

### 14.5 Horizontal Scaling

- Next.js is stateless — scale by adding instances behind a load balancer
- Database sessions work with any instance
- File storage (attachments) needs S3-compatible storage (future)
- WebSocket connections need sticky sessions or a pub/sub layer

### 14.6 Background Jobs

- Email notifications
- Report generation
- Data aggregation for dashboards
- Scheduled cleanup of expired invitations
- **Future:** Bull/BullMQ with Redis

### 14.7 Object Storage

- Attachments currently stored as `fileUrl` string (no actual storage implemented)
- **Future:** S3-compatible storage (AWS S3, MinIO, Cloudflare R2)

### 14.8 WebSockets

- **Future:** Real-time collaboration
  - Live Kanban board updates
  - Activity feed streaming
  - Notification push
  - Socket.io or native WebSockets via Next.js

### 14.9 Microservices (Future, v3.0)

Potential service boundaries:
- **Auth service** — authentication and session management
- **Project service** — projects, members, sprints
- **Task service** — tasks, comments, attachments
- **Notification service** — push, email, in-app
- **Analytics service** — aggregated metrics and reports
- **AI service** — predictions, recommendations

---

## 15. Future Integrations

All integration points are designed as optional, additive layers. No core architecture changes are required.

| Integration | Layer Affected | When | Effort |
|-------------|---------------|------|--------|
| Redis | Caching, Sessions, Queue | v1.1 | Medium |
| Docker | Deployment | v1.2 | Low |
| Kubernetes | Orchestration | v2.0 | Medium |
| S3-compatible Storage | Attachments | v1.1 | Medium |
| **Microsoft Teams** | Notifications | v2.1 | Medium |
| **Slack** | Notifications | v2.1 | Medium |
| Email Providers (SendGrid, SES) | Notifications | v2.1 | Medium |
| Calendar (iCal, Google Calendar) | Sprint scheduling | v2.0 | Medium |
| GitHub | Commit linking, PR status | v2.1 | Medium |
| GitLab | Commit linking, MR status | v2.1 | Medium |
| Jenkins | CI/CD pipeline status | v2.1 | High |
| Azure DevOps | Work item sync | v2.1 | High |
| Power BI Export | Reports | v2.0 | Medium |
| Excel Export | Reports | v2.0 | Low |
| PDF Reports | Reports | v2.0 | Medium |
| REST API (public) | External integrations | v2.0 | Medium |
| GraphQL | API flexibility | v3.0 | High |
| AI Services | Intelligence | v3.0 | High |

### Integration Architecture Pattern

```
External Service ←→ Webhook Receiver / Adapter Module
                        │
                        ▼
                  Application Core
                  (authz, validation, audit)
                        │
                        ▼
                   Database
```

---

## 16. Development Roadmap

### Milestone 1: Core Platform (v1.0) ← Current

| Objective | Deliverables | Dependencies | Complexity |
|-----------|-------------|--------------|------------|
| Authentication | Google OAuth, session management, login page | None | Medium |
| Role-based access | SystemRole + ProjectRole, authz helpers | Auth | Medium |
| Database schema | 14 models, 9 enums, 37 indexes, all FKs | None | High |
| UI design system | 18 components, dark/light theme, CSS tokens | None | Medium |
| Project CRUD | Create, list, view, update, delete projects | Auth, DB | Medium |
| Sprint management | Create, update, auto-unassign on complete | Projects | Medium |
| Task management | Create, update, soft delete, filter | Projects, Sprints | High |
| Kanban board | Drag-drop status changes, column filtering | Tasks | High |
| Comments | Add, delete with permission checks | Tasks | Low |
| Admin console | User list, create, edit roles | Auth | Medium |
| Dashboard | Role-aware dashboards with live stats | Auth, Projects, Tasks | Medium |

**Acceptance criteria:** A user can authenticate via Google, create a project, add members, create sprints, manage tasks on a Kanban board, and admins can manage users.

### Milestone 2: Project Intelligence (v1.1)

| Objective | Deliverables | Dependencies |
|-----------|-------------|--------------|
| Executive dashboard | Cross-project health, completion rates | Core Platform |
| Sprint analytics | Burndown charts, velocity tracking | Sprint management |
| Risk dashboard | Blocked tasks, overdue items | Task management |
| Activity feed | Real-time user activity stream | ActivityLog model |

### Milestone 3: Notifications (v1.2)

| Objective | Deliverables | Dependencies |
|-----------|-------------|--------------|
| Notification engine | In-app notification delivery | Core Platform |
| Notification preferences | Per-user notification settings | Users |
| Email integration | SendGrid/SES adapter for email notifications | Notification engine |

### Milestone 4: Reports & Exports (v2.0)

| Objective | Deliverables | Dependencies |
|-----------|-------------|--------------|
| Report engine | Data aggregation layer | Core Platform |
| PDF reports | Sprint report, project status report | Report engine |
| Excel export | Task list export, member roster export | Report engine |
| Calendar integration | Sprint dates to iCal/Google Calendar | Sprint management |

### Milestone 5: Integrations (v2.1)

| Objective | Deliverables | Dependencies |
|-----------|-------------|--------------|
| Slack integration | Task notifications, sprint updates | Notifications |
| Teams integration | Task notifications, sprint updates | Notifications |
| GitHub/GitLab | Commit linking, PR/MR status | Task management |
| CI/CD | Jenkins/Azure DevOps pipeline status | Task management |

### Milestone 6: AI & Enterprise (v3.0)

| Objective | Deliverables | Dependencies |
|-----------|-------------|--------------|
| AI Assistant | Natural language queries, recommendations | All prior milestones |
| Predictive analytics | Sprint completion forecasts | Analytics data |
| GraphQL API | Flexible API for integrations | All prior milestones |
| Microservices | Service decomposition | All prior milestones |

---

## 17. Technical Debt Review

### 17.1 Architectural Improvements

| Issue | Location | Impact | Recommendation |
|-------|----------|--------|---------------|
| Stale role values in `requireRole` calls | `projects/route.ts` GET, `notifications/route.ts` GET | Low — works because strings match but uses legacy `PROJECT_MANAGER`, `SCRUM_MASTER` etc. in system-level checks | Replace with `["SUPER_ADMIN", "ADMIN", "USER"]` |
| Inline validation in comment routes | `tasks/[id]/comments/route.ts` | Low — basic content check works, but inconsistent with rest of codebase | Use `commentCreateSchema` from validations |
| `Project.delete()` is hard-delete | `projects/[id]/route.ts` DELETE | Medium — projects cannot be recovered | Change to soft delete (`deletedAt`) |
| Empty `dashboards/` and `shared/` folders | `src/components/` | Low — clutter | Remove empty directories |
| No pagination | All list endpoints | Medium — will fail under data growth | Add `take`/`skip` params to list endpoints |
| Debug route still references `ADMIN_EMAIL` | `debug/oauth-cleanup/route.ts` | Low — debug-only, but references removed env var | Update to use current auth model |
| Form validation is client-only for some fields | `create-task-modal.tsx` | Low — sever-side Zod catches all | Add client-side validation matching Zod schemas |
| `cn()` utility is minimal | `src/lib/cn.ts` | Low — works but can't merge Tailwind classes | Consider `tailwind-merge` for class conflict resolution |

### 17.2 Code Smells

| Smell | Location | Issue |
|-------|----------|-------|
| `as any` type casts | `tasks/route.ts` POST, `admin/users/route.ts` POST | Bypasses TypeScript safety. Prisma enum types don't match Zod string enums cleanly |
| `as` casts on Prisma where clauses | `tasks/route.ts` GET | `whereClause` typed as `Record<string, unknown>` |
| Implicit `any` in `searchParams` access | Multiple routes | Query params extracted without type validation |
| Magic strings for roles | Throughout authz.ts and routes | Works but hard to refactor — consider centralizing role constants |
| Lack of error boundaries | App pages | No `error.tsx` files for graceful error recovery |
| `console.log`/`console.error` for logging | Throughout | No structured logging |
| No request ID tracking | API routes | Cannot correlate logs across services |

### 17.3 Potential Bottlenecks

| Concern | Location | Risk |
|---------|----------|------|
| Unbounded task list queries | `GET /api/tasks` | High — millions of tasks without pagination |
| Unbounded audit log queries | No API endpoint, but DB grows unbounded | Medium — `AuditLog` has no TTL or archival strategy |
| Dashboard aggregation queries | `admin-dashboard.tsx`, `super-admin-dashboard.tsx` | Medium — multiple parallel Prisma queries |
| Session validation on every request | All `auth()` calls | Low-Medium — DB read per request |
| No connection pool limits | `prisma.ts` | Low — Prisma adapter manages pooling |

### 17.4 Performance Issues

| Issue | Impact | Fix |
|-------|--------|-----|
| No pagination on task/sprint lists | High at scale | Add `take`/`skip` with defaults |
| No caching on dashboard | Medium | Use React `cache()` or SWR |
| Multiple sequential DB queries for stats | Medium | Combine into single query or use Promise.all |
| `img` instead of `next/image` | Low | Migrate to `<Image>` for optimization |

### 17.5 Security Improvements

| Issue | Impact | Fix |
|-------|--------|-----|
| No rate limiting | Medium | Add middleware-based rate limiter |
| No CSP headers | Medium | Add via `next.config.ts` `headers()` |
| Debug route in production | Low | Guard with env check (already done) |
| No request size limits | Low | Add body size validation in middleware |

### 17.6 Refactoring Opportunities

| Opportunity | Value | Effort |
|-------------|-------|--------|
| Extract shared query patterns (e.g., `getProjectOrThrow`) | Medium | Low |
| Create `src/hooks/useApi.ts` for standardized fetch | Medium | Low |
| Add `src/config/roles.ts` for role constants | Medium | Low |
| Create Prisma query helpers for common includes | Medium | Low |
| Add `error.tsx` and `loading.tsx` files for all route groups | Medium | Low |
| Migrate to `tailwind-merge` for `cn()` utility | Low | Low |
| Add TypeScript path aliases for `@components/`, `@lib/`, etc. | Low | Low |
| Standardize API response shape (envelope pattern) | Medium | Medium |

---

**End of Architecture Document**

*This document should be updated whenever significant architectural decisions are made or when new modules are implemented. It serves as the single source of truth for SprintFlow's technical direction.*
