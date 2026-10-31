"use client";

import { useState } from "react";

interface McpInfoProps {
  baseUrl: string;
}

export default function McpInfo({ baseUrl }: McpInfoProps) {
  const [open, setOpen] = useState(false);

  const mcpConfig = {
    mcpServers: {
      "latex-resume": {
        url: `${baseUrl}/api/mcp`,
        transport: "streamable-http",
      },
    },
  };

  const claudeDesktopConfig = {
    mcpServers: {
      "latex-resume": {
        command: "npx",
        args: [
          "-y",
          "mcp-remote@latest",
          `${baseUrl}/api/mcp`,
        ],
      },
    },
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white text-sm transition-colors border border-neutral-700"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
        MCP Connect
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white">
                Connect via MCP
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-neutral-400 hover:text-white"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-5 space-y-6">
              <div>
                <p className="text-sm text-neutral-300 mb-4">
                  AI agents can create and edit resumes through the MCP
                  (Model Context Protocol) endpoint. Connect your AI tools
                  using the configurations below.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-2">
                  MCP Endpoint
                </h3>
                <code className="block p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-blue-400 text-sm font-mono">
                  POST {baseUrl}/api/mcp
                </code>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-2">
                  Claude Desktop / Claude Code (mcp-remote)
                </h3>
                <pre className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-green-400 text-xs font-mono overflow-x-auto">
                  {JSON.stringify(claudeDesktopConfig, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-2">
                  Direct Streamable HTTP
                </h3>
                <pre className="p-3 rounded-lg bg-neutral-950 border border-neutral-800 text-green-400 text-xs font-mono overflow-x-auto">
                  {JSON.stringify(mcpConfig, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="text-sm font-medium text-white mb-2">
                  Available Tools
                </h3>
                <div className="space-y-2">
                  {[
                    {
                      name: "list_templates",
                      desc: "List available resume templates",
                    },
                    {
                      name: "get_template",
                      desc: "Get a template's LaTeX source",
                    },
                    {
                      name: "create_resume",
                      desc: "Create a new resume from LaTeX",
                    },
                    {
                      name: "get_resume",
                      desc: "Retrieve a resume by ID",
                    },
                    {
                      name: "update_resume",
                      desc: "Update resume content",
                    },
                    {
                      name: "delete_resume",
                      desc: "Delete a resume",
                    },
                    {
                      name: "list_resumes",
                      desc: "List all saved resumes",
                    },
                    {
                      name: "compile_resume",
                      desc: "Get preview URL for a resume",
                    },
                  ].map((tool) => (
                    <div
                      key={tool.name}
                      className="flex items-start gap-3 p-2 rounded bg-neutral-800/50"
                    >
                      <code className="text-xs text-blue-400 font-mono whitespace-nowrap">
                        {tool.name}
                      </code>
                      <span className="text-xs text-neutral-400">
                        {tool.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-800/50">
                <p className="text-xs text-blue-300">
                  <strong>Tip:</strong> AI agents can pick a template, customize
                  it with user data, create a resume, and provide the editor URL
                  — all through MCP tool calls.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
