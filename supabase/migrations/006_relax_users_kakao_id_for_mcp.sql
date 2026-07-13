-- Allow MCP-only users to be stored without kakao_id.
ALTER TABLE public.users
  ALTER COLUMN kakao_id DROP NOT NULL;

-- Rollback (reverse of the forward statement above):
--   ALTER TABLE public.users
--     ALTER COLUMN kakao_id SET NOT NULL;
-- NOTE: SET NOT NULL only succeeds if no rows have kakao_id IS NULL. After this
-- migration, MCP-only users may have a NULL kakao_id, so backfill or remove those
-- rows before attempting the rollback, otherwise it will fail on the not-null check.
