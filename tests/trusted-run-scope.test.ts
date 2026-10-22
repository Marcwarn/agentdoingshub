import test from "node:test";
import assert from "node:assert/strict";
import { scopeForAuthenticatedRun, rejectClientScope } from "../core/trusted-run-scope";
const user = {tenantId:"doings",userId:"alice",issuer:"https://login.example",audience:"agent-hub",expiresAt:2000,verified:true as const};
test("verified principal determines owner and tenant",()=>{assert.deepEqual(scopeForAuthenticatedRun(user,"run1",1000),{tenantId:"doings",ownerId:"alice",runId:"run1"});});
test("expired, absent and malformed principals fail closed",()=>{
 assert.throws(()=>scopeForAuthenticatedRun(null,"r",1000),/UNAUTHENTICATED/);
 assert.throws(()=>scopeForAuthenticatedRun(user,"r",2000),/SESSION_EXPIRED/);
 assert.throws(()=>scopeForAuthenticatedRun({...user,issuer:""},"r",1000),/INVALID_PRINCIPAL/);
});
test("client authority claims rejected",()=>{
 assert.throws(()=>rejectClientScope({goal:"abc",ownerId:"bob"}),/CLIENT_IDENTITY_NOT_ALLOWED/);
 assert.throws(()=>rejectClientScope({tenantId:"other"}),/CLIENT_IDENTITY_NOT_ALLOWED/);
 assert.doesNotThrow(()=>rejectClientScope({goal:"abc",runId:"r1"}));
});
