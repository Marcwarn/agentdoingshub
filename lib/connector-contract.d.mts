export type Json = null | boolean | number | string | Json[] | { [key: string]: Json };
export type ConnectorFailureStatus = "unavailable" | "invalid_request" | "upstream_error";
export type ConnectorResult = { status: string; message?: string; result?: unknown; requestId?: string; retryAfterMs?: number };
export type ConnectorBinding = { invoke: (connector: string, action: string, args: Record<string, unknown>) => Promise<ConnectorResult> };
export type ConnectorContext = ConnectorBinding | undefined;
export declare function createConnectors(binding: ConnectorBinding | undefined): {
  invoke: (connector: string, action: string, args: Record<string, unknown>) => Promise<ConnectorResult>;
};
