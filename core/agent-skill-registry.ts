export type AgentAuthority = "read" | "draft" | "act-with-approval" | "act";

export type AgentSkillRegistration = {
  agentId: string;
  displayName: string;
  skill: string;
  version: string;
  owns: string[];
  routesTo: string[];
  defaultAuthority: AgentAuthority;
  qualityGate?: boolean;
};

export const agentSkillRegistry: AgentSkillRegistration[] = [
  { agentId: "chief-of-staff", displayName: "Chief of Staff", skill: "chief-of-staff", version: "1.0.0", owns: ["orchestration", "routing", "synthesis", "decisions"], routesTo: ["marta", "lo", "kim", "vera", "saga", "nils", "cleo", "amir", "alex", "iris"], defaultAuthority: "draft" },
  { agentId: "marta", displayName: "Märta", skill: "marta-workshop", version: "1.0.0", owns: ["workshops", "facilitation", "run-of-show"], routesTo: ["lo", "nils", "iris"], defaultAuthority: "draft" },
  { agentId: "lo", displayName: "Lo", skill: "lo-leadership", version: "1.0.0", owns: ["leadership", "teams", "feedback"], routesTo: ["marta", "vera", "iris"], defaultAuthority: "draft" },
  { agentId: "kim", displayName: "Kim", skill: "kim-customer", version: "1.0.0", owns: ["customer", "commercial", "crm"], routesTo: ["saga", "cleo", "amir", "iris"], defaultAuthority: "read" },
  { agentId: "vera", displayName: "Vera", skill: "vera-change", version: "1.0.0", owns: ["change", "adoption", "stakeholders"], routesTo: ["lo", "nils", "cleo", "iris"], defaultAuthority: "draft" },
  { agentId: "saga", displayName: "Saga", skill: "saga-research", version: "1.0.0", owns: ["research", "evidence", "fact-checking"], routesTo: ["iris"], defaultAuthority: "read" },
  { agentId: "nils", displayName: "Nils", skill: "nils-learning", version: "1.0.0", owns: ["learning", "practice", "assessment"], routesTo: ["marta", "lo", "iris"], defaultAuthority: "draft" },
  { agentId: "cleo", displayName: "Cleo", skill: "cleo-messaging", version: "1.0.0", owns: ["messaging", "narrative", "editorial"], routesTo: ["saga", "kim", "iris"], defaultAuthority: "draft" },
  { agentId: "amir", displayName: "Amir", skill: "amir-strategy", version: "1.0.0", owns: ["strategy", "prioritization", "decision-support"], routesTo: ["saga", "kim", "vera", "iris"], defaultAuthority: "draft" },
  { agentId: "alex", displayName: "Alex", skill: "alex-ai-workflows", version: "1.0.0", owns: ["ai-systems", "automation", "evals"], routesTo: ["vera", "nils", "iris"], defaultAuthority: "draft" },
  { agentId: "iris", displayName: "Iris", skill: "iris-quality", version: "1.0.0", owns: ["quality", "verification", "risk"], routesTo: ["chief-of-staff"], defaultAuthority: "read", qualityGate: true },
];

export function skillForAgent(agentId: string) {
  return agentSkillRegistry.find((registration) => registration.agentId === agentId);
}
