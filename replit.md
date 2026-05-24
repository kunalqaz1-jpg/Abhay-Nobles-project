# School ERP — Shri Abhay Nobles

A full-stack School ERP system for managing students, teachers, admin operations, attendance, homework, results, notices, and a public-facing school website.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/school-erp run dev` — run the frontend (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Required Environment Variables

| Variable | Where to set | Purpose |
|---|---|---|
| `MONGODB_URI` | Replit Secret / Vercel Env | MongoDB Atlas connection string |
| `SMTP_USER` | Env var | Gmail address for outbound email |
| `SMTP_PASS` | Replit Secret / Vercel Env | Gmail app password for outbound email |

## Quick Setup For Real Admin Login

1. Configure environment variables locally or in Vercel:
   - `MONGODB_URI`
   - `SMTP_USER`
   - `SMTP_PASS`
2. For local setup, copy `.env.example` values into your shell before running commands.
3. Create or update the real admin user:
   - `pnpm --filter @workspace/scripts run admin:create -- --username admin --password yourStrongPassword`
4. Log in from `/admin/login` with the username and password you created.

## Fresh ERP Reset

If you want to start over with brand-new admin, teacher, and student portal records:

- Reset ERP portal data only:
  - `pnpm --filter @workspace/scripts run school:reset -- --confirm RESET`
- Also clear admissions + contact enquiries:
  - `pnpm --filter @workspace/scripts run school:reset -- --confirm RESET --include-enquiries`
- Also clear website-managed announcements + gallery images:
  - `pnpm --filter @workspace/scripts run school:reset -- --confirm RESET --include-enquiries --include-website-content`

By default, the reset keeps website content intact and clears:
- admins
- teachers
- students
- login sessions
- attendance
- homework
- results
- notices
- messages
- study materials
- timetable rows
- events

### PowerShell example

```powershell
$env:MONGODB_URI="your-mongodb-connection-string"
$env:SMTP_USER="your-gmail-address"
$env:SMTP_PASS="your-gmail-app-password"
pnpm --filter @workspace/scripts run admin:create -- --username admin --password yourStrongPassword
```

## Stack

- **Monorepo**: pnpm workspaces, Node.js 24, TypeScript 5.9
- **Frontend**: React 19, Vite 7, Tailwind CSS v4, Wouter (routing), Radix UI, Framer Motion
- **API**: Express 5, pino logging
- **DB**: MongoDB Atlas + Mongoose (all models in `lib/db/src/models.ts`)
- **Auth**: bcryptjs password hashing, MongoDB-backed session tokens (24h TTL, auto-expired via MongoDB TTL index)
- **Email**: Nodemailer (Gmail SMTP)
- **API codegen**: Orval (OpenAPI spec → hooks + Zod schemas)

## Where things live

```
artifacts/
  school-erp/      — React/Vite frontend
  api-server/      — Express API server
lib/
  db/              — MongoDB models (Mongoose) — source of truth: src/models.ts
  api-spec/        — OpenAPI spec (openapi.yaml)
  api-client-react/ — Generated React Query hooks
  api-zod/         — Generated Zod schemas
api/
  index.ts         — Vercel serverless entry point (wraps Express app)
vercel.json        — Vercel deployment configuration
```

## Architecture decisions

- **MongoDB only**: The project uses MongoDB/Mongoose exclusively. The `lib/db/src/schema/` Drizzle folder was removed (dead code — app never used Postgres at runtime).
- **MongoDB-backed sessions**: Login tokens are stored in the `sessions` MongoDB collection with a TTL index for automatic expiry. This replaces the original in-memory Map which would lose sessions on serverless cold starts.
- **Vercel deployment**: Frontend built as static Vite output; API served as a single Vercel serverless function via `api/index.ts`. Rewrites in `vercel.json` route all `/api/*` traffic to the function.
- **Dev proxy**: In development, Vite proxies `/api` to `http://localhost:8080` (the local API server). In production on Vercel, `/api` routes to the serverless function at the same domain — no CORS configuration needed.

## Vercel Deployment Checklist

1. Push code to GitHub
2. Import repo on vercel.com
3. Vercel auto-detects `vercel.json` — no framework preset needed
4. Set environment variables in Vercel dashboard:
   - `MONGODB_URI` (required)
   - `SMTP_USER` (optional — for admission/contact emails)
   - `SMTP_PASS` (optional — Gmail app password)
5. Deploy

## User preferences

- Deploy target: Vercel
- Database: MongoDB Atlas (MONGODB_URI secret)

## Gotchas

- `PORT` and `BASE_PATH` are optional in `vite.config.ts` — they default to `5000` and `/` respectively for Vercel builds.
- The Vercel function entry is `api/index.ts` at the **root** of the repo (not inside `artifacts/`).
- Sessions use MongoDB TTL index — the `sessions` collection will be auto-created on first login.
