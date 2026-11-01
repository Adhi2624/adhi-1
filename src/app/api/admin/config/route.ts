import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { configService, ConfigError } from "@/services/config-service";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [allConfig, tierLimits, rateLimits] = await Promise.all([
    configService.getAllConfig(),
    configService.getAllTierLimits(),
    configService.getRateLimits(),
  ]);

  return NextResponse.json({ config: allConfig, tierLimits, rateLimits });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();

    if (body.tierLimits) {
      for (const [tier, limits] of Object.entries(body.tierLimits)) {
        await configService.setTierLimits(
          tier as "free" | "pro" | "team",
          limits as { maxResumes: number; mcpAccess: boolean; maxMcpCallsPerHour: number; maxMcpCallsPerDay: number; customTemplates: boolean; versionHistory: boolean; collaboration: boolean }
        );
      }
    }

    if (body.rateLimits) {
      await configService.setRateLimits(body.rateLimits);
    }

    if (body.key && body.value !== undefined) {
      await configService.setConfig(body.key, body.value);
    }

    return NextResponse.json({ message: "Config updated" });
  } catch (err: unknown) {
    if (err instanceof ConfigError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
  }
}
