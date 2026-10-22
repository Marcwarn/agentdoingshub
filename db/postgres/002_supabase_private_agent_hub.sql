-- Applied 2026-10-22 to dedicated Supabase project bfkhwvumtzjkesifwjuq
-- Supabase migration: create_private_agent_hub_runs_and_events
-- Never execute against Doings apps, Sessions, CRM or Sites.
CREATE SCHEMA IF NOT EXISTS agent_hub;
REVOKE ALL ON SCHEMA agent_hub FROM PUBLIC, anon, authenticated;
CREATE TABLE IF NOT EXISTS agent_hub.hub_runs (
  tenant_id text NOT NULL CHECK (length(trim(tenant_id)) > 0),
  owner_id text NOT NULL CHECK (length(trim(owner_id)) > 0),
  run_id text NOT NULL CHECK (length(trim(run_id)) > 0),
  current_version bigint NOT NULL DEFAULT 0 CHECK (current_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, owner_id, run_id)
);
CREATE TABLE IF NOT EXISTS agent_hub.hub_run_events (
  tenant_id text NOT NULL,
  owner_id text NOT NULL,
  run_id text NOT NULL,
  version bigint NOT NULL CHECK (version > 0),
  event_id text NOT NULL CHECK (length(trim(event_id)) > 0),
  event_json jsonb NOT NULL CHECK (jsonb_typeof(event_json) = 'object'),
  stored_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, owner_id, run_id, version),
  UNIQUE (tenant_id, owner_id, run_id, event_id),
  FOREIGN KEY (tenant_id, owner_id, run_id) REFERENCES agent_hub.hub_runs (tenant_id, owner_id, run_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS hub_run_events_owner_idx ON agent_hub.hub_run_events (tenant_id, owner_id, run_id, version);
ALTER TABLE agent_hub.hub_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_hub.hub_run_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_hub.hub_runs FORCE ROW LEVEL SECURITY;
ALTER TABLE agent_hub.hub_run_events FORCE ROW LEVEL SECURITY;
REVOKE ALL ON ALL TABLES IN SCHEMA agent_hub FROM PUBLIC, anon, authenticated;
COMMENT ON SCHEMA agent_hub IS 'Private Doings Agent Hub operational schema; no client Data API access. Trusted server adapter only after separate identity and role review.';
