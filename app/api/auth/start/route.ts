import { beginEntraOidc } from "@/core/entra-oidc-pkce";
import { cookies } from "next/headers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Secure login start; requires configured Entra app registration. */
export async function GET(req: Request) {
  const tenantId = process.env.ENTRA_TENANT_ID;
  const clientId = process.env.ENTRA_CLIENT_ID;
  const host = new URL(req.url);
  const origin = process.env.AGENT_HUB_PUBLIC_ORIGIN;
  if (!tenantId || !clientId || !origin || host.origin !== origin) {
    return Response.json({error:"Microsoft sign-in not configured."},{status:503,headers:{"Cache-Control":"no-store"}});
  }
  try {
    const start = beginEntraOidc({tenantId,clientId,redirectUri:origin+"/api/auth/callback"});
    const jar = await cookies();
    jar.set("__Host-hub-oidc",JSON.stringify({state:start.state,nonce:start.nonce,verifier:start.verifier}),{
      httpOnly:true,secure:true,sameSite:"lax",path:"/",maxAge:300
    });
    return Response.redirect(start.url,302);
  } catch {
    return Response.json({error:"Microsoft sign-in unavailable."},{status:503,headers:{"Cache-Control":"no-store"}});
  }
}
