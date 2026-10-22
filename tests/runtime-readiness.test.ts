import test from "node:test";
import assert from "node:assert/strict";
import { runtimeConfiguration } from "../core/runtime-readiness";
test("deployment with no secrets is not configured", () => {
  assert.deepEqual(runtimeConfiguration({}), {configured:false, checks:{identityConfiguration:false,databaseConfiguration:false,agentConfiguration:false}});
});
test("only complete set flags configured without verifying access", () => {
  const env = {ENTRA_CLIENT_ID:"x",ENTRA_TENANT_ID:"x",ENTRA_CLIENT_SECRET:"x",AGENT_HUB_SESSION_SECRET:"x",AGENT_HUB_DATABASE_URL:"x",OPENAI_API_KEY:"x"};
  assert.equal(runtimeConfiguration(env).configured,true);
  assert.equal(runtimeConfiguration({...env,AGENT_HUB_DATABASE_URL:""}).configured,false);
});
