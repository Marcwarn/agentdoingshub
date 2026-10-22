-- Independent Agent Hub database only. Do not apply to CRM, Sessions, Brief or Sites.
CREATE TABLE IF NOT EXISTS hub_runs (
  tenant_id text NOT NULL,
  owner_id text NOT NULL,
  run_id text NOT NULL,
  current_version bigint NOT NULL DEFAULT 0 CHECK (current_version >= 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, owner_id, run_id)
);
CREATE TABLE IF NOT EXISTS hub_run_events (
  tenant_id text NOT NULL,
  owner_id text NOT NULL,
  run_id text NOT NULL,
  version bigint NOT NULL CHECK (version > 0),
  event_id text NOT NULL,
  event_json jsonb NOT NULL,
  stored_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, owner_id, run_id, version),
  UNIQUE (tenant_id, owner_id, run_id, event_id),
  FOREIGN KEY (tenant_id, owner_id, run_id)
    REFERENCES hub_runs (tenant_id, owner_id, run_id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS hub_run_events_owner_idx
  ON hub_run_events (tenant_id, owner_id, run_id, version);
-- Database roles, RLS policy, tenant membership, backups and retention must
-- be provisioned and tested before use. No credentials or existing data here.
