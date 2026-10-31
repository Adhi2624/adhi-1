import { NextRequest, NextResponse } from "next/server";
import { MCP_SERVER_INFO, MCP_TOOLS, MCP_RESOURCES } from "@/lib/mcp-schema";
import { templates, getTemplate } from "@/lib/templates";
import * as store from "@/lib/resume-store";

interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number;
  method: string;
  params?: Record<string, unknown>;
}

function jsonrpcResponse(id: string | number | undefined, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}

function jsonrpcError(
  id: string | number | undefined,
  code: number,
  message: string
) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}

function handleToolCall(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "list_templates":
      return templates.map(({ id, name, description }) => ({
        id,
        name,
        description,
      }));

    case "get_template": {
      const t = getTemplate(args.template_id as string);
      if (!t) return { error: "Template not found" };
      return t;
    }

    case "create_resume": {
      const resume = store.createResume(
        args.name as string,
        args.latex as string
      );
      return { id: resume.id, message: "Resume created", resume };
    }

    case "get_resume": {
      const resume = store.getResume(args.resume_id as string);
      if (!resume) return { error: "Resume not found" };
      return resume;
    }

    case "update_resume": {
      const resume = store.updateResume(args.resume_id as string, {
        name: args.name as string | undefined,
        latex: args.latex as string | undefined,
      });
      if (!resume) return { error: "Resume not found" };
      return { message: "Resume updated", resume };
    }

    case "delete_resume": {
      const ok = store.deleteResume(args.resume_id as string);
      return ok
        ? { message: "Resume deleted" }
        : { error: "Resume not found" };
    }

    case "list_resumes":
      return store.listResumes().map(({ id, name, createdAt, updatedAt }) => ({
        id,
        name,
        createdAt,
        updatedAt,
      }));

    case "compile_resume": {
      const resume = store.getResume(args.resume_id as string);
      if (!resume) return { error: "Resume not found" };
      return {
        message: "Open the editor URL to see the compiled PDF preview",
        editor_url: `/editor?id=${resume.id}`,
        resume_id: resume.id,
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

function handleRequest(req: JsonRpcRequest) {
  switch (req.method) {
    case "initialize":
      return jsonrpcResponse(req.id, {
        protocolVersion: "2024-11-05",
        capabilities: {
          tools: {},
          resources: {},
        },
        serverInfo: MCP_SERVER_INFO,
      });

    case "tools/list":
      return jsonrpcResponse(req.id, { tools: MCP_TOOLS });

    case "tools/call": {
      const params = req.params as {
        name: string;
        arguments?: Record<string, unknown>;
      };
      const result = handleToolCall(params.name, params.arguments || {});
      return jsonrpcResponse(req.id, {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      });
    }

    case "resources/list":
      return jsonrpcResponse(req.id, { resources: MCP_RESOURCES });

    case "resources/read": {
      const params = req.params as { uri: string };
      if (params.uri === "resume://templates") {
        return jsonrpcResponse(req.id, {
          contents: [
            {
              uri: params.uri,
              mimeType: "application/json",
              text: JSON.stringify(
                templates.map(({ id, name, description }) => ({
                  id,
                  name,
                  description,
                }))
              ),
            },
          ],
        });
      }
      return jsonrpcError(req.id, -32602, "Resource not found");
    }

    case "notifications/initialized":
    case "notifications/cancelled":
      return null;

    default:
      return jsonrpcError(req.id, -32601, `Method not found: ${req.method}`);
  }
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as JsonRpcRequest;
  const response = handleRequest(body);
  if (!response) {
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.json(response);
}

export async function GET() {
  return NextResponse.json({
    name: MCP_SERVER_INFO.name,
    version: MCP_SERVER_INFO.version,
    description: MCP_SERVER_INFO.description,
    mcp_endpoint: "/api/mcp",
    transport: "streamable-http",
    instructions:
      "Send JSON-RPC 2.0 requests via POST. Supports MCP protocol version 2024-11-05.",
    available_tools: MCP_TOOLS.map((t) => ({
      name: t.name,
      description: t.description,
    })),
  });
}
