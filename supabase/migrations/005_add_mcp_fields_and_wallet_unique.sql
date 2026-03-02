-- MCP provider sync fields for users
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS auth_provider TEXT,
  ADD COLUMN IF NOT EXISTS mcp_user_id TEXT,
  ADD COLUMN IF NOT EXISTS mcp_access_token TEXT,
  ADD COLUMN IF NOT EXISTS mcp_refresh_token TEXT,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS users_mcp_user_id_key
  ON public.users (mcp_user_id);

-- Ensure wallet can be safely upserted by user_id
CREATE UNIQUE INDEX IF NOT EXISTS jelly_wallets_user_id_key
  ON public.jelly_wallets (user_id);
