# Microsoft login start — staged integration

`GET /api/auth/start` is intentionally disabled (503) until all three values are configured for Vercel: `ENTRA_TENANT_ID`, `ENTRA_CLIENT_ID` and `AGENT_HUB_PUBLIC_ORIGIN` (exact https origin without slash, e.g. https://agentdoingshub.vercel.app).

It creates a cryptographically random PKCE verifier, state, nonce and short-lived secure HttpOnly SameSite cookie, then redirects to Microsoft's authorization endpoint.

**Not a complete sign-in:** `/api/auth/callback`, token exchange, nonce verification, secured session persistence, logout and use of authenticated identity in /api/tasks are not implemented by this change. Never enable as a production sign-in link before those parts and the Entra app registration have been reviewed and tested. Do not paste secrets into chat or the repository.
