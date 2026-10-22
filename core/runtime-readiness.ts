export type RuntimeConfiguration = {
  configured: boolean;
  checks: { identityConfiguration: boolean; databaseConfiguration: boolean; agentConfiguration: boolean };
};

/** Configuration presence only; does not prove connectivity, valid secrets, or runtime readiness. */
export function runtimeConfiguration(env: Record<string, string | undefined>): RuntimeConfiguration {
  const identityConfiguration = Boolean(env.ENTRA_CLIENT_ID && env.ENTRA_TENANT_ID && env.ENTRA_CLIENT_SECRET && env.AGENT_HUB_SESSION_SECRET);
  const databaseConfiguration = Boolean(env.AGENT_HUB_DATABASE_URL);
  const agentConfiguration = Boolean(env.OPENAI_API_KEY);
  return { configured: identityConfiguration && databaseConfiguration && agentConfiguration, checks: { identityConfiguration, databaseConfiguration, agentConfiguration } };
}
