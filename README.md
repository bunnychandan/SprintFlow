# SprintFlow

SprintFlow is an enterprise-ready project and sprint management workspace inspired by Jira, ClickUp, Linear, and Monday.com. The current implementation includes a polished command center, project overview, sprint board, activity feed, and notification center, all built with Next.js, TypeScript, Tailwind CSS, and Framer Motion.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000 to view the app.

## Build and verify

```bash
npm run build
npm run lint
```

## What is included

- Premium SaaS-style branding and logo assets in public/
- Responsive dashboard shell for projects, tasks, sprints, and notifications
- Enterprise-style analytics cards and live pulse visualizations
- Search-driven task board for sprint planning
- Production build and lint validation

## Next steps for production

- Add Prisma + PostgreSQL persistence and real auth
- Connect WebSocket real-time task updates
- Extend RBAC, reporting, and admin modules
