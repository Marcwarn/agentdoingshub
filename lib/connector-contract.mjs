/**
 * Server-only connector boundary. A plain Vercel deployment has no Sites
 * delegated connector binding: in that case connectors fail closed.
 * Never substitute a shared service token or simulate successful sources.
 */
export function createConnectors(binding) {
  return {
    async invoke(connector, action, args) {
      if (typeof binding?.invoke !== "function") {
        return { status: "unavailable", message: "Delegated connector binding is not configured for this request." };
      }
      if (typeof connector !== "string" || typeof action !== "string" ||
          !args || typeof args !== "object" || Array.isArray(args)) {
        return { status: "invalid_request", message: "Invalid connector arguments." };
      }
      try { return await binding.invoke(connector, action, args); }
      catch { return { status: "upstream_error", message: "Connector request failed." }; }
    }
  };
}
