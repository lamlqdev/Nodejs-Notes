# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a **Node.js learning curriculum** with 16 self-contained projects, each exploring a specific backend concept. All projects use TypeScript and Express as a foundation.

## Running Projects

Each project is independent. Navigate into a section directory first.

```bash
# General development workflow
npm install
cp .env.example .env    # fill in required secrets
npm run dev             # tsx watch or nodemon

# Build for production
npm run build && npm start
```

**Projects requiring external services:**

| Project | Command before `npm run dev` |
|---------|------------------------------|
| 05 (PostgreSQL) | Run a Postgres instance; `npm run db:migrate` |
| 08 (Session Auth) | Run Redis |
| 15 (Background Jobs) | `docker compose up -d` (Redis), `npm run db:migrate`, `npm run db:seed` |
| 16 (Real-Time) | `npm run db:migrate` (SQLite) |

**Prisma commands** (used in 05, 15, 16):
```bash
npm run db:generate   # regenerate Prisma Client after schema changes
npm run db:migrate    # apply pending migrations
npm run db:studio     # open Prisma Studio GUI
```

## Architecture

### Project Structure (per section)

```
src/
├── routes/          # Express router definitions
├── controllers/     # Thin HTTP layer: extract data, call service, respond
├── services/        # Business logic, DB queries, external API calls
├── middleware/      # Auth, validation, error handling, logging
├── models/          # Mongoose schemas or Prisma schema at root
├── validations/     # Zod schemas
└── index.ts         # App entry point with graceful shutdown
```

### Request Lifecycle

```
Request → Middleware stack → Zod validation → Auth/authz → Controller → Service → Response
                                                                              ↓
                                                                       AppError thrown
                                                                              ↓
                                                                    Global error handler
```

### Middleware Order (consistent across all API projects)

Logger → Helmet → CORS → Body parsers → Cookie parser → Rate limiter → Passport/auth → Routes → Error handler

### Error Handling

All projects use a custom `AppError` class in services:
```typescript
throw new AppError('Not found', 404);
```
A global error handler middleware (always last) catches `AppError` instances and sends structured JSON.

### Validation

Zod schemas in `src/validations/`. A generic `validate()` middleware applies schemas to `req.body`, `req.query`, or `req.params`.

### Auth Patterns

**JWT (projects 07, 09, 10, 14):**
- Access tokens: 15-minute expiry; refresh tokens: 7 days
- Stored in HTTP-only cookies; also accept `Authorization: Bearer` header
- Middleware extends `Request` with `req.user`
- bcrypt with 10 salt rounds

**Session (project 08):**
- Sessions stored in Redis via `connect-redis`
- Cookie-based session ID, no JWT

### Background Jobs (project 15)

Architecture: HTTP handler enqueues → Worker processes asynchronously → Cron triggers scheduled enqueues.

- **Queue** (BullMQ + Redis): priority, delay, retries with exponential backoff
- **Worker**: separate process, calls job processor functions
- **Cron** (node-cron): schedules are defined as `0 0 * * *`-style strings; crons enqueue BullMQ jobs (not run logic directly) for persistence and retry support

Graceful shutdown order: crons → worker → queue drain → Redis → Prisma disconnect.

### Real-Time Communication (project 16)

Intentionally mixes technologies:
- **Chat messages** → Socket.io (bi-directional)
- **Typing indicators / presence** → SSE (server-push)
- **Message history** → REST

SSE uses a singleton `SSEManager` tracking `Map<roomId, Set<Response>>` with 30-second keepalive comments.

### Email (project 14, 15)

Resend SDK returns `{ data, error }` — never throws. Always check both fields. Use idempotency keys with pattern `<event>/<entity-id>`.

## Key Patterns

- **`requireEnv(key)`** — helper that throws at startup if a required env var is missing; prevents silent failures
- **Lean Mongoose queries** — `.lean()` for read-only paths (faster, plain objects)
- **Swagger/OpenAPI** — projects 10, 14, 15, 16 serve docs at `GET /api-docs`
- **Rate limiting** — `express-rate-limit` on all endpoints; stricter on auth routes (5 requests / 15 min)
