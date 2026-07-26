-- MCP provider sync fields for users
-- Idempotency / conflict-resolution: every statement below is guarded so this
-- migration can be re-run safely without hard-failing on already-applied state.
--   * ADD COLUMN IF NOT EXISTS  -> re-running skips columns that already exist.
--   * CREATE UNIQUE INDEX IF NOT EXISTS -> re-running skips indexes that already exist.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_provider TEXT,
  ADD COLUMN IF NOT EXISTS mcp_user_id TEXT,
  ADD COLUMN IF NOT EXISTS mcp_access_token TEXT,
  ADD COLUMN IF NOT EXISTS mcp_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Unique index on mcp_user_id.
-- Conflict behavior: Postgres allows multiple NULLs in a UNIQUE index, so existing
-- non-MCP users (mcp_user_id IS NULL) do not collide. A hard failure here means real
-- duplicate non-null mcp_user_id values exist and must be de-duplicated first.
CREATE UNIQUE INDEX IF NOT EXISTS users_mcp_user_id_key
  ON public.users (mcp_user_id);

-- Ensure wallet can be safely upserted by user_id.
-- Conflict behavior: this index backs ON CONFLICT (user_id) upserts. If creation fails,
-- collapse duplicate jelly_wallets rows per user_id before re-running.
CREATE UNIQUE INDEX IF NOT EXISTS jelly_wallets_user_id_key
  ON public.jelly_wallets (user_id);
