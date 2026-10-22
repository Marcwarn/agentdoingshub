-- Dedicated NOLOGIN role for future server connections. Credentials are never created here.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'agent_hub_app') THEN
    CREATE ROLE agent_hub_app NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
  END IF;
END $$;
GRANT USAGE ON SCHEMA agent_hub TO agent_hub_app;
GRANT SELECT, INSERT, UPDATE ON agent_hub.hub_runs TO agent_hub_app;
GRANT SELECT, INSERT ON agent_hub.hub_run_events TO agent_hub_app;
-- Do not grant DELETE, TRUNCATE, REFERENCES, DDL or public Data API access.
