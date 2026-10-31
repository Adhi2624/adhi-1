# LaTeX Resume Editor

A web-based LaTeX resume editor with live PDF preview and MCP (Model Context Protocol) support for AI agent integration. Built with Next.js and deployable to Vercel for free.

## Features

- **Monaco-based LaTeX editor** with syntax highlighting, auto-completion, and bracket matching
- **Live PDF preview** using client-side LaTeX compilation (SwiftLaTeX/WebAssembly)
- **Resume templates** — Classic, Modern, and Minimal pre-built LaTeX templates
- **Resizable split panes** — drag the divider to adjust editor/preview ratio
- **MCP Server** — AI agents can create, edit, and manage resumes via the Model Context Protocol
- **Vercel-ready** — deploys on the free tier with zero configuration

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## MCP Integration

The app exposes an MCP endpoint at `/api/mcp` that AI agents can connect to.

### Configuration for Claude Desktop / Claude Code

```json
{
  "mcpServers": {
    "latex-resume": {
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

### Example MCP Workflow

1. Agent calls `list_templates` to see available templates
2. Agent calls `get_template` with `template_id: "modern"` to get the LaTeX source
3. Agent customizes the LaTeX with the user's information
4. Agent calls `create_resume` with the customized LaTeX
5. Agent returns the editor URL where the user can see and download the PDF

## Deploy to Vercel

```bash
npm i -g vercel
vercel
```

## Tech Stack

- **Next.js 15** — React framework with App Router
- **TypeScript** — Type safety
- **Tailwind CSS 4** — Styling
- **Monaco Editor** — Code editor (VS Code engine)
- **SwiftLaTeX** — Client-side LaTeX to PDF compilation via WebAssembly
- **MCP Protocol** — Streamable HTTP transport for AI agent integration
