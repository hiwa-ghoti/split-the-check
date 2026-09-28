import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import type { HealthStatus } from "@/types";

export const dynamic = "force-static";

export async function GET() {
  const body: HealthStatus = {
    status: "ok",
    appName: env.NEXT_PUBLIC_APP_NAME,
  };

  return NextResponse.json(body);
}
