import test from "node:test";
import { generateKeyPairSync, sign } from "node:crypto";
import assert from "node:assert/strict";
import { verifyEntraAccessToken } from "../core/entra-token-verifier";
const config = {tenantId:"11111111-1111-4111-8111-111111111111",audience:"agent-hub"};
test("reject malformed and unsigned tokens without fetching keys", async () => {
 let fetched = false;
 const fetchKeys = async () => { fetched = true; return {keys:[]}; };
 await assert.rejects(verifyEntraAccessToken("not-a-jwt",config,fetchKeys),/INVALID_TOKEN/);
 const b = (v:unknown)=>Buffer.from(JSON.stringify(v)).toString("base64url");
 const claims = {iss:"https://login.microsoftonline.com/11111111-1111-4111-8111-111111111111/v2.0",tid:config.tenantId,aud:config.audience,oid:config.tenantId,exp:2000000000,nbf:0};
 await assert.rejects(verifyEntraAccessToken(b({alg:"none",kid:"x"})+"."+b(claims)+".aaa",config,fetchKeys),/INVALID_ALGORITHM/);
 await assert.rejects(verifyEntraAccessToken(b({alg:"RS256",kid:"x"})+"."+b({...claims,aud:"another-app"})+".aaa",config,fetchKeys),/INVALID_CLAIMS/);
 assert.equal(fetched,false);
});

test("accept signed tenant JWT and reject tampered payload", async () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const key = { ...publicKey.export({ format: "jwk" }), kid: "test-key", use: "sig", alg: "RS256" };
  const encode = (v:unknown) => Buffer.from(JSON.stringify(v)).toString("base64url");
  const claims = {iss:`https://login.microsoftonline.com/${config.tenantId}/v2.0`,tid:config.tenantId,aud:config.audience,oid:config.tenantId,exp:2000000000,nbf:1};
  const head = encode({alg:"RS256",kid:"test-key"});
  const payload = encode(claims);
  const signed = head+"."+payload;
  const jwt = signed+"."+sign("RSA-SHA256", Buffer.from(signed), privateKey).toString("base64url");
  const verified = await verifyEntraAccessToken(jwt,config,async()=>({keys:[key]}),1000);
  assert.equal(verified.verified,true);
  assert.equal(verified.userId,config.tenantId);
  await assert.rejects(verifyEntraAccessToken(head+"."+encode({...claims,oid:"22222222-2222-4222-8222-222222222222"})+"."+jwt.split(".")[2],config,async()=>({keys:[key]}),1000),/INVALID_SIGNATURE/);
});
