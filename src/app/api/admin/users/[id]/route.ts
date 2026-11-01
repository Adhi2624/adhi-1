import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { analyticsService, AnalyticsError } from "@/services/analytics-service";
import { adminService, AdminError } from "@/services/admin-service";
import type { PricingTier } from "@/lib/db/types";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const analytics = await analyticsService.getUserAnalytics(id);
    return NextResponse.json(analytics);
  } catch (err: unknown) {
    if (err instanceof AnalyticsError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to fetch user analytics" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();

    if (body.tier) {
      const updated = await adminService.updateUserTier(id, body.tier as PricingTier);
      return NextResponse.json(updated);
    }

    if (body.role) {
      const updated = await adminService.updateUserRole(id, body.role);
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "No valid update field provided" }, { status: 400 });
  } catch (err: unknown) {
    if (err instanceof AdminError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
