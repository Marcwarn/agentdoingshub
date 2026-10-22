import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { beginEntraOidc, validateOidcCallback } from "../core/entra-oidc-pkce";
const config = {tenantId:"ced1d479-4651-413a-9182-0af47e003995",clientId:"aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",redirectUri:"https://agentdoingshub.vercel.app/api/auth/callback"};
test("creates PKCE S256 request with unpredictable CSRF state and nonce",()=>{
 const a=beginEntraOidc(config),b=beginEntraOidc(config),url=new URL(a.url);
 assert.notEqual(a.state,b.state);
 assert.notEqual(a.nonce,b.nonce);
 assert.notEqual(a.verifier,b.verifier);
 assert.equal(url.origin,"https://login.microsoftonline.com");
 assert.equal(url.searchParams.get("response_type"),"code");
 assert.equal(url.searchParams.get("code_challenge_method"),"S256");
 assert.equal(url.searchParams.get("code_challenge"),createHash("sha256").update(a.verifier).digest("base64url"));
 assert.doesNotThrow(()=>validateOidcCallback(a,a.state));
 assert.throws(()=>validateOidcCallback(a,b.state),/INVALID_OIDC_STATE/);
 assert.throws(()=>validateOidcCallback(a,null),/INVALID_OIDC_STATE/);
});
test("rejects insecure redirect",()=>{
 assert.throws(()=>beginEntraOidc({...config,redirectUri:"http://localhost:3000/callback"}),/INVALID_REDIRECT/);
});
