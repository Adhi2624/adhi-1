export const MCP_SERVER_INFO = {
  name: "latex-resume-editor",
  version: "1.0.0",
  description:
    "MCP server for creating and editing LaTeX resumes via AI agents",
};

export const MCP_TOOLS = [
  {
    name: "list_templates",
    description:
      "List all available LaTeX resume templates with their IDs, names, and descriptions",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [] as string[],
    },
  },
  {
    name: "get_template",
    description: "Get the full LaTeX content of a specific resume template",
    inputSchema: {
      type: "object" as const,
      properties: {
        template_id: {
          type: "string",
          description: "The template ID (classic, modern, or minimal)",
        },
      },
      required: ["template_id"],
    },
  },
  {
    name: "create_resume",
    description:
      "Create a new resume from LaTeX content. Returns the resume ID for future operations.",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: {
          type: "string",
          description: "Name/title for this resume",
        },
        latex: {
          type: "string",
          description: "The full LaTeX source code for the resume",
        },
      },
      required: ["name", "latex"],
    },
  },
  {
    name: "get_resume",
    description: "Retrieve a resume by its ID",
    inputSchema: {
      type: "object" as const,
      properties: {
        resume_id: {
          type: "string",
          description: "The resume UUID",
        },
      },
      required: ["resume_id"],
    },
  },
  {
    name: "update_resume",
    description: "Update an existing resume's name or LaTeX content",
    inputSchema: {
      type: "object" as const,
      properties: {
        resume_id: {
          type: "string",
          description: "The resume UUID",
        },
        name: {
          type: "string",
          description: "New name for the resume (optional)",
        },
        latex: {
          type: "string",
          description: "New LaTeX content (optional)",
        },
      },
      required: ["resume_id"],
    },
  },
  {
    name: "delete_resume",
    description: "Delete a resume by ID",
    inputSchema: {
      type: "object" as const,
      properties: {
        resume_id: {
          type: "string",
          description: "The resume UUID",
        },
      },
      required: ["resume_id"],
    },
  },
  {
    name: "list_resumes",
    description:
      "List all saved resumes with their IDs, names, and timestamps",
    inputSchema: {
      type: "object" as const,
      properties: {},
      required: [] as string[],
    },
  },
  {
    name: "compile_resume",
    description:
      "Compile LaTeX source and return a URL to view the PDF. The compilation happens client-side; this returns an editor URL where the PDF can be previewed.",
    inputSchema: {
      type: "object" as const,
      properties: {
        resume_id: {
          type: "string",
          description: "The resume UUID to compile",
        },
      },
      required: ["resume_id"],
    },
  },
];

export const MCP_RESOURCES = [
  {
    uri: "resume://templates",
    name: "Resume Templates",
    description: "List of available LaTeX resume templates",
    mimeType: "application/json",
  },
];
