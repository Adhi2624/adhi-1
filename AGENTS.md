# Typeset — Agent Guide

## Project Overview

Typeset is a LaTeX resume editor with visual builder, MCP server for AI agents, JWT auth, and admin panel. Built with Next.js 16, TypeScript, Tailwind CSS 4, and client-side PDF compilation via SwiftLaTeX (WebAssembly).

## Quick Reference

```
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build — run before pushing
npm run lint         # ESLint
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
│   └── api/
│       ├── auth/             # login, register, logout, me
│       ├── resumes/          # CRUD (ownership-scoped)
│       ├── files/            # Upload/download (user-scoped keys)
│       ├── admin/            # Stats + user management (admin-only)
│       ├── mcp/              # MCP JSON-RPC endpoint (public, no auth)
│       └── templates/        # LaTeX template listing
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
│   │   ├── types.ts          # User, SafeUser, Resume, input types
│   │   ├── adapter.ts        # DbAdapter interface
│   │   ├── memory.ts         # In-memory (default, dev)
│   │   ├── mongo.ts          # MongoDB (production)
│   │   ├── d1.ts             # Cloudflare D1 (SQLite)
│   │   └── index.ts          # Factory: getDb() singleton, adapter selection
│   └── storage/
│       ├── adapter.ts        # StorageAdapter interface
│       ├── fs.ts             # Filesystem (default)
│       ├── s3.ts             # AWS S3
│       ├── r2.ts             # Cloudflare R2 (Workers binding or S3-compat API)
│       └── index.ts          # Factory: getStorage() singleton
└── middleware.ts              # Route protection (auth + admin role check)
```

### Adapter Pattern

Database and storage use a factory pattern with env-var-driven selection:

- `DB_ADAPTER` → `memory` | `mongodb` | `d1` (default: `memory`)
- `STORAGE_ADAPTER` → `fs` | `s3` | `r2` (default: `fs`)

Adapters use **dynamic imports** so unused drivers (mongodb, @aws-sdk/client-s3) are never bundled. The factories (`src/lib/db/index.ts`, `src/lib/storage/index.ts`) return singletons.

When adding a new adapter:
1. Create `src/lib/db/<name>.ts` or `src/lib/storage/<name>.ts` implementing the interface
2. Add a case in the factory's switch
3. Use dynamic `import()` to avoid bundling the driver unconditionally
4. Document env vars in `.env.example`

### Auth

- JWT via `jose` (Edge-compatible, no Node.js crypto dependency)
- Password hashing: `bcryptjs`
- Cookie: `typeset-session`, 7-day expiry
- Middleware protects `/dashboard`, `/editor`, `/builder` (auth) and `/admin` (admin role)
- Auth routes redirect logged-in users away from `/login`, `/register`

### MCP Server

- Endpoint: `POST /api/mcp` — JSON-RPC 2.0, Streamable HTTP transport
- Protocol: MCP v2024-11-05
- No auth required (designed for AI agent access)
- MCP user ID hardcoded as `"mcp-agent"` for resume ownership
- 8 tools: list_templates, get_template, create_resume, get_resume, update_resume, delete_resume, list_resumes, compile_resume
- 1 resource: `resume://templates`

### Client-Side Compilation

PDF preview uses SwiftLaTeX (WebAssembly) loaded via `<script>` in the root layout. The `PdfTeXEngine` runs entirely in the browser — no server-side LaTeX installation needed. The engine is initialized in `src/components/pdf-preview.tsx`.

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

- All resume routes check auth via `getSession()` and verify ownership
- Admin routes verify `role === "admin"` from JWT payload
- MCP endpoint is the only public API (no auth)
- Always `await getDb()` / `await getStorage()` — they're async factories
- Return `NextResponse.json()` for all responses

### Styling

- Tailwind CSS 4 — utility-first, dark theme by default
- Color scheme uses emerald/green accent palette
- Responsive design required for all pages
- No CSS modules or styled-components

### LaTeX

- Special characters must be escaped in generated LaTeX (`&`, `%`, `$`, `#`, `_`, `{`, `}`)
- Templates in `src/lib/templates.ts` — each returns valid, self-contained LaTeX
- The visual builder (`src/app/builder/page.tsx`) generates LaTeX via `generateLatex()` and redirects to the editor

## Testing Changes

1. Run `npm run build` — must compile all routes cleanly
2. Run `npm run lint` — no errors
3. For UI changes: start `npm run dev` and verify in browser
4. Check both light and dark themes for visual changes

## Environment

- **Runtime**: Node.js (Vercel-compatible, also works on Cloudflare Pages)
- **Package manager**: npm
- **Bundler**: Turbopack (dev), Webpack (build)
- **No test framework configured yet** — rely on type checking and build verification

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
