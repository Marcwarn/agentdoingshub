export type RuntimeReadiness = {
  ready: boolean;
  checks: { identity: boolean; database: boolean; agents: boolean };
};

/** Never return credentials, variable values or a list of missing secret names. */
export function runtimeReadiness(env: Record<string, string | undefined>): RuntimeReadiness {
  const identity = Boolean(env.ENTRA_CLIENT_ID && env.ENTRA_TENANT_ID && env.ENTRA_CLIENT_SECRET && env.AGENT_HUB_SESSION_SECRET);
  const database = Boolean(env.AGENT_HUB_DATABASE_URL);
  const agents = Boolean(env.OPENAI_API_KEY);
  return { ready: identity && database && agents, checks: { identity, database, agents } };
}
