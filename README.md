# Typeset — Beautiful Resumes, Effortlessly

A full-featured LaTeX resume editor with visual builder, AI agent support via MCP, account system, and admin panel. Built with Next.js. Pluggable database and storage adapters.

## Features

- **LaTeX Editor** — Monaco-based with syntax highlighting and autocomplete
- **Visual Builder** — Form-based resume creation, no LaTeX knowledge needed
- **Live PDF Preview** — Client-side WebAssembly compilation (SwiftLaTeX)
- **MCP Server** — AI agents can create/edit resumes via Model Context Protocol
- **Auth System** — JWT-based with login, register, role management
- **Admin Panel** — User management, platform stats, MCP status
- **Pluggable Storage** — Filesystem, AWS S3, or Cloudflare R2
- **Pluggable Database** — In-memory, MongoDB, or Cloudflare D1

## Quick Start

```bash
npm install
cp .env.example .env.local   # configure your adapters
npm run dev
```

Default admin: `admin@typeset.app` / `admin123`

## Architecture

### Database Adapters

Set `DB_ADAPTER` in your environment:

| Adapter | Value | Config Required |
|---------|-------|-----------------|
| In-memory | `memory` (default) | None — data resets on restart |
| MongoDB | `mongodb` | `MONGODB_URI`, optional `MONGODB_DB` |
| Cloudflare D1 | `d1` | D1 binding (`DB`) in `wrangler.toml` |

```bash
# MongoDB example
DB_ADAPTER=mongodb
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net
MONGODB_DB=typeset
```

The adapter interface (`src/lib/db/adapter.ts`) is straightforward to implement for other databases — Postgres, SQLite, PlanetScale, Turso, etc.

### Storage Adapters

Set `STORAGE_ADAPTER` in your environment:

| Adapter | Value | Config Required |
|---------|-------|-----------------|
| Filesystem | `fs` (default) | `UPLOAD_DIR`, `UPLOAD_BASE_URL` |
| AWS S3 | `s3` | `S3_BUCKET`, `S3_REGION`, credentials |
| Cloudflare R2 | `r2` | Workers binding (`BUCKET`) or `R2_ACCOUNT_ID` + credentials |

```bash
# S3 example
STORAGE_ADAPTER=s3
S3_BUCKET=typeset-files
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=AKIA...
S3_SECRET_ACCESS_KEY=secret

# R2 via S3-compatible API
STORAGE_ADAPTER=r2
R2_ACCOUNT_ID=abc123
R2_BUCKET=typeset-files
R2_ACCESS_KEY_ID=key
R2_SECRET_ACCESS_KEY=secret
R2_PUBLIC_URL=https://pub-xxx.r2.dev
```

R2 supports two modes: Workers binding (zero-config when deployed to Cloudflare Pages) and S3-compatible API (for use from Vercel or any Node.js environment).

### File Storage API

```
POST /api/files          — Upload a file (multipart form data)
GET  /api/files          — List user's files
GET  /api/files/:key     — Download a file
DELETE /api/files/:key   — Delete a file
```

## MCP Integration

Endpoint: `POST /api/mcp` (Streamable HTTP transport)

### Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "typeset": {
      "command": "npx",
      "args": ["-y", "mcp-remote@latest", "https://your-app.vercel.app/api/mcp"]
    }
  }
}
```

### Available MCP Tools

| Tool | Description |
|------|-------------|
| `list_templates` | List available LaTeX resume templates |
| `get_template` | Get a template's full LaTeX source |
| `create_resume` | Create a new resume from LaTeX content |
| `get_resume` | Retrieve a resume by ID |
| `update_resume` | Update a resume's name or content |
| `delete_resume` | Delete a resume |
| `list_resumes` | List all saved resumes |
| `compile_resume` | Get a preview URL for a resume |

## Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/` | Landing page | Public |
| `/login` | Login | Public |
| `/register` | Sign up | Public |
| `/dashboard` | User's resume list | Auth |
| `/editor` | LaTeX editor with PDF preview | Auth |
| `/builder` | Visual resume builder | Auth |
| `/admin` | Admin panel | Admin only |

## Deploy

### Vercel (recommended)

```bash
npm i -g vercel
vercel
```

Set `DB_ADAPTER=mongodb` and `MONGODB_URI` in Vercel environment variables for persistent storage.

### Cloudflare Pages

Use D1 for database and R2 for file storage — both auto-detected via Workers bindings.

```toml
# wrangler.toml
[[d1_databases]]
binding = "DB"
database_name = "typeset"
database_id = "your-d1-id"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "typeset-files"
```

## Tech Stack

- **Next.js 16** — App Router + Turbopack
- **TypeScript** — End-to-end type safety
- **Tailwind CSS 4** — Styling
- **Monaco Editor** — VS Code engine for LaTeX editing
- **SwiftLaTeX** — Client-side LaTeX compilation (WebAssembly)
- **jose** — JWT tokens (Edge-compatible)
- **bcryptjs** — Password hashing
- **mongodb** — MongoDB driver
- **@aws-sdk/client-s3** — S3/R2 file storage
- **MCP Protocol** — AI agent integration
