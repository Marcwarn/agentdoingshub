/** Build-only compatibility shim. Native Vercel has no Cloudflare D1 binding. */
export const env: { readonly DB?: never } = Object.freeze({});
