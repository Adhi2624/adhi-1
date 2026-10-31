# Claude Code — Typeset Project Instructions

## Project

Typeset: LaTeX resume editor + visual builder + MCP server. Next.js 16, TypeScript strict, Tailwind CSS 4, SwiftLaTeX (WASM).

## Before Writing Code

Read `node_modules/next/dist/docs/` for the Next.js 16 API reference — this version has breaking changes from what you know. Check `AGENTS.md` for the full architecture and coding conventions.

## Commands

- `npm run build` — production build, run before every commit
- `npm run dev` — dev server with Turbopack
- `npm run lint` — ESLint check
- Type check: `npx tsc --noEmit`

## Key Patterns

### Next.js 16

- Route params are `Promise`: always `const { id } = await params;`
- `useSearchParams()` requires wrapping in `<Suspense>` at the page level
- Avoid `new Date()` at module/render level in client components — use `useEffect`

### Adapters

- Database factory: `await getDb()` from `@/lib/db`
- Storage factory: `await getStorage()` from `@/lib/storage`
- Both are async singletons — always await them
- New adapters: implement the interface, add dynamic import in the factory, add env vars to `.env.example`

### Auth

- `getSession()` from `@/lib/auth` returns the current user or `null`
- All user-facing API routes must check auth and ownership
- MCP endpoint (`/api/mcp`) is intentionally public — no auth

### API Routes

- Use `NextResponse.json()` for all responses
- Route handlers: `export async function GET/POST/PATCH/DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> })`
- Admin routes must verify `role === "admin"`

### Styling

- Tailwind CSS 4 utility classes only — no CSS modules
- Dark theme by default, emerald/green accent
- All layouts must work at mobile width

## File Conventions

- Path alias: `@/*` → `./src/*`
- Components: `src/components/` — one component per file, PascalCase exports
- Lib modules: `src/lib/` — camelCase filenames
- API routes: `src/app/api/<resource>/route.ts`

## Don't

- Don't import `mongodb` or `@aws-sdk/client-s3` at the top level — use dynamic `import()` in adapter factories only
- Don't add auth to the MCP endpoint
- Don't use `crypto` from Node.js — use `jose` for JWT (Edge-compatible)
- Don't skip `<Suspense>` when using `useSearchParams()`
- Don't use inline styles or CSS-in-JS
