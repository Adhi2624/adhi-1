# Typeset — Agent Guide

## Project Overview

Typeset is a LaTeX resume editor with visual builder, MCP server for AI agents, JWT auth, and admin panel. Built with Next.js 16, TypeScript, Tailwind CSS 4, and client-side PDF compilation via SwiftLaTeX (WebAssembly).

## Quick Reference

```
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build — run before pushing
npm run lint         # ESLint
npm test             # Run all tests (Vitest)
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

Default admin: `admin@typeset.app` / `admin123` (seeded by db factory on first use).

## Architecture

### Directory Layout

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── login/page.tsx        # Login (uses Suspense for useSearchParams)
│   ├── register/page.tsx     # Registration
│   ├── dashboard/page.tsx    # User dashboard
│   ├── editor/page.tsx       # LaTeX editor + PDF preview (uses Suspense)
│   ├── builder/page.tsx      # Visual form-based resume builder
│   ├── admin/page.tsx        # Admin panel (stats + user management)
│   ├── forgot-password/      # Forgot password page
│   ├── reset-password/       # Reset password page (uses Suspense)
│   ├── terms/page.tsx        # Terms of Service
│   ├── privacy/page.tsx      # Privacy Policy
│   └── api/
│       ├── auth/             # login, register, logout, me, verify-email, forgot/reset-password
│       ├── resumes/          # CRUD (ownership-scoped)
│       ├── files/            # Upload/download (user-scoped keys)
│       ├── admin/            # Stats + user management (admin-only)
│       ├── mcp/              # MCP JSON-RPC endpoint
│       └── templates/        # LaTeX template listing
├── services/                  # Business logic (class-based)
│   ├── auth-service.ts       # AuthService — register, login, session verify
│   ├── resume-service.ts     # ResumeService — CRUD with ownership checks
│   ├── admin-service.ts      # AdminService — stats, user management
│   └── email-service.ts      # EmailService — verification, password reset
├── components/
│   ├── auth-provider.tsx     # React context for auth state
│   ├── navbar.tsx            # Responsive nav with auth awareness
│   ├── footer.tsx            # Footer (useEffect for year to avoid prerender error)
│   ├── latex-editor.tsx      # Monaco with custom LaTeX language/theme/completions
│   ├── pdf-preview.tsx       # SwiftLaTeX PdfTeXEngine integration
│   ├── template-picker.tsx   # Template selection modal
│   └── mcp-info.tsx          # MCP connection config modal
├── lib/
│   ├── auth.ts               # JWT (jose) + bcryptjs, cookie-based sessions
│   ├── templates.ts          # 3 LaTeX resume templates
│   ├── mcp-schema.ts         # MCP server info, tool defs, resources
│   ├── db/
│   │   ├── types.ts          # User, SafeUser, Resume, EmailToken, input types
│   │   ├── adapter.ts        # DbAdapter interface
│   │   ├── memory.ts         # In-memory (default, dev)
│   │   ├── mongo.ts          # MongoDB (production)
│   │   ├── d1.ts             # Cloudflare D1 (SQLite)
│   │   └── index.ts          # Factory: getDb() singleton, adapter selection
│   ├── storage/
│   │   ├── adapter.ts        # StorageAdapter interface
│   │   ├── fs.ts             # Filesystem (default)
│   │   ├── s3.ts             # AWS S3
│   │   ├── r2.ts             # Cloudflare R2 (Workers binding or S3-compat API)
│   │   └── index.ts          # Factory: getStorage() singleton
│   ├── email/
│   │   ├── adapter.ts        # EmailAdapter interface
│   │   ├── console.ts        # Console logging (dev)
│   │   ├── smtp.ts           # SMTP via nodemailer
│   │   ├── resend.ts         # Resend API
│   │   ├── rate-limit.ts     # DB-backed rate limiting
│   │   ├── tokens.ts         # Token generation (legacy, prefer EmailService)
│   │   └── index.ts          # Factory: getEmail() singleton
│   └── i18n/
│       ├── en.ts             # English string catalog
│       └── index.ts          # Locale registry
├── __tests__/                 # Test files (Vitest)
│   ├── setup.ts              # Test setup (jest-dom matchers)
│   ├── services/
│   │   ├── auth-service.test.ts
│   │   ├── resume-service.test.ts
│   │   └── admin-service.test.ts
│   ├── lib/
│   │   └── memory-adapter.test.ts
│   └── components/
│       ├── auth-provider.test.tsx
│       └── navbar.test.tsx
└── middleware.ts              # Route protection (auth + admin role check)
```

### Service Layer (Class-Based)

Business logic is in class-based services under `src/services/`. Each service:

- Accepts raw inputs (not NextRequest/NextResponse)
- Throws typed errors with HTTP status codes (e.g., `AuthError`, `ResumeError`)
- Exports a singleton instance for use by route handlers
- Is independently testable by mocking `@/lib/db`, `@/lib/email`, `@/lib/auth`

API routes are thin wrappers:

```typescript
// Route handler pattern
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await someService.doSomething(body);
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    if (err instanceof ServiceError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
```

### Adapter Pattern

Database, storage, and email use a factory pattern with env-var-driven selection:

- `DB_ADAPTER` → `memory` | `mongodb` | `d1` (default: `memory`)
- `STORAGE_ADAPTER` → `fs` | `s3` | `r2` (default: `fs`)
- `EMAIL_ADAPTER` → `console` | `smtp` | `resend` (default: `console`)

Adapters use **dynamic imports** so unused drivers (mongodb, @aws-sdk/client-s3) are never bundled. The factories return singletons.

When adding a new adapter:

1. Create the file implementing the interface
2. Add a case in the factory's switch
3. Use dynamic `import()` to avoid bundling the driver unconditionally
4. Document env vars in `.env.example`

### Auth

- JWT via `jose` (Edge-compatible, no Node.js crypto dependency)
- Password hashing: `bcryptjs`
- Cookie: `typeset-session`, 7-day expiry
- Middleware protects `/dashboard`, `/editor`, `/builder` (auth) and `/admin` (admin role)
- Auth routes redirect logged-in users away from `/login`, `/register`
- Email verification on registration, forgot/reset password flows

### MCP Server

- Endpoint: `POST /api/mcp` — JSON-RPC 2.0, Streamable HTTP transport
- Protocol: MCP v2024-11-05
- Auth via `MCP_API_KEY` or session JWT (configurable)
- 8 tools: list_templates, get_template, create_resume, get_resume, update_resume, delete_resume, list_resumes, compile_resume
- 1 resource: `resume://templates`

### Client-Side Compilation

PDF preview uses SwiftLaTeX (WebAssembly) loaded via `<script>` in the root layout. The `PdfTeXEngine` runs entirely in the browser — no server-side LaTeX installation needed.

## Testing

### Setup

- **Vitest** as test runner with jsdom environment
- **React Testing Library** for component tests
- **@testing-library/jest-dom** for DOM matchers
- Config: `vitest.config.ts`, setup: `src/__tests__/setup.ts`

### Test Strategy

- **Service tests** (`src/__tests__/services/`): Mock `getDb()`, test business logic in isolation
- **Adapter tests** (`src/__tests__/lib/`): Test MemoryAdapter directly (no mocks)
- **Component tests** (`src/__tests__/components/`): Mock fetch, next/link, next/navigation, auth context

### Running Tests

```bash
npm test                          # All tests
npx vitest run src/__tests__/services/  # Backend only
npx vitest run src/__tests__/components/ # Frontend only
npm run test:coverage             # With coverage
```

## Coding Conventions

### Next.js 16 Specifics

- **Route params are Promises**: Always `const { id } = await params;` in route handlers
- **useSearchParams requires Suspense**: Any client component using `useSearchParams()` must be wrapped in `<Suspense>` at the page level
- **Dynamic dates in client components**: Use `useState` + `useEffect` for `new Date()` to avoid prerender errors
- **Read `node_modules/next/dist/docs/`** before using any Next.js API — this version has breaking changes

### TypeScript

- Strict mode enabled
- Path alias: `@/*` maps to `./src/*`
- Use `type` imports where possible
- Explicit types on function parameters (no implicit `any`)

### API Routes

- Business logic in service classes, route handlers are thin wrappers
- Auth checked via `getSession()` (except MCP)
- Ownership verified on resume operations
- Admin routes verify `role === "admin"`
- Return `NextResponse.json()` for all responses

### Styling

- Tailwind CSS 4 — utility-first, dark theme by default
- Color scheme uses emerald/blue accent palette
- Responsive design required for all pages
- No CSS modules or styled-components

## Verification Checklist

1. Run `npm test` — all tests must pass
2. Run `npm run build` — must compile all routes cleanly
3. Run `npm run lint` — no errors
4. For UI changes: start `npm run dev` and verify in browser

## Environment

- **Runtime**: Node.js (Vercel-compatible, also works on Cloudflare Pages)
- **Package manager**: npm
- **Bundler**: Turbopack (dev), Webpack (build)
- **Test framework**: Vitest + React Testing Library

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
