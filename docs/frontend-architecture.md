# Frontend architecture

## Runtime layers

```text
pages/components
  -> feature hooks (TanStack Query)
    -> services
      -> Hono API for business mutations
      -> Supabase Data API for simple RLS-protected reads
      -> Supabase Edge Functions for streaming and platform jobs
```

## Data ownership rules

- Authentication, session persistence and realtime belong to the browser Supabase client.
- Simple reads may use the Supabase Data API directly when the table has an explicit RLS policy.
- Business mutations and multi-write workflows belong to the Hono API.
- Edge Functions are reserved for streaming AI, e-mail, account export/deletion and provider callbacks.
- New UI code must not introduce a fourth data-access path.
- API failures must preserve `status`, `error_code` and `request_id` through `ApiError`.

## Server and client state

- TanStack Query owns remote/server state.
- React context owns only session-adjacent UI state and the active workspace selection.
- Every workspace-dependent query key must contain the workspace ID.
- Mutations are not retried globally because writes are not necessarily idempotent.
- Workspace changes invalidate only cache entries belonging to the selected workspace.

## Authentication

- The `/admin` parent route validates the authenticated user before rendering children.
- `useSessionGuard` observes sign-out, token refresh, visibility and connectivity changes.
- `getSession()` is used only when the access token itself is needed for the Hono API.
- Authorization is enforced by the API and Supabase RLS, never solely by UI state.

## Repository boundary

- `src/` contains the browser application.
- `supabase/migrations/` is the canonical database history for the Finance product.
- `supabase/functions/` contains Supabase-specific workloads that fit the Edge Function boundary above.
- General HTTP business rules belong to `api-hono`; shared request/response contracts should be generated from its OpenAPI document as the domains evolve.
