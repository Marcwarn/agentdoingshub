import { runtimeConfiguration } from "@/core/runtime-readiness";
export const dynamic = "force-dynamic";
export async function GET() {
  const state = runtimeConfiguration(process.env);
  return Response.json({ service: "agent-hub", status: state.configured ? "configuration-present-not-verified" : "not-configured", checks: state.checks }, {
    status: state.configured ? 200 : 503,
    headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" }
  });
}
