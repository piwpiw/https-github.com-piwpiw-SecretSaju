-- Allow MCP-only users to be stored without kakao_id.
ALTER TABLE public.users
  ALTER COLUMN kakao_id DROP NOT NULL;
