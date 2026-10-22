-- Tenant-owner isolation for future trusted server PostgreSQL sessions.
-- No grants are added. A verified server identity must set both GUCs
-- in a transaction before running SQL; browser-supplied values are forbidden.
CREATE POLICY run_scope_select ON agent_hub.hub_runs
  FOR SELECT USING (
    tenant_id = nullif(current_setting('app.tenant_id', true), '')
    AND owner_id = nullif(current_setting('app.owner_id', true), '')
  );
CREATE POLICY run_scope_insert ON agent_hub.hub_runs
  FOR INSERT WITH CHECK (
    tenant_id = nullif(current_setting('app.tenant_id', true), '')
    AND owner_id = nullif(current_setting('app.owner_id', true), '')
  );
CREATE POLICY run_scope_update ON agent_hub.hub_runs
  FOR UPDATE USING (
    tenant_id = nullif(current_setting('app.tenant_id', true), '')
    AND owner_id = nullif(current_setting('app.owner_id', true), '')
  ) WITH CHECK (
    tenant_id = nullif(current_setting('app.tenant_id', true), '')
    AND owner_id = nullif(current_setting('app.owner_id', true), '')
  );
CREATE POLICY event_scope_select ON agent_hub.hub_run_events
  FOR SELECT USING (
    tenant_id = nullif(current_setting('app.tenant_id', true), '')
    AND owner_id = nullif(current_setting('app.owner_id', true), '')
  );
CREATE POLICY event_scope_insert ON agent_hub.hub_run_events
  FOR INSERT WITH CHECK (
    tenant_id = nullif(current_setting('app.tenant_id', true), '')
    AND owner_id = nullif(current_setting('app.owner_id', true), '')
  );
