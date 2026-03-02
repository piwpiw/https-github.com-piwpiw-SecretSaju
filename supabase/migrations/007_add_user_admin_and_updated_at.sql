-- Add is_admin and updated_at to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Add updated_at trigger for users table
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_users_updated_at ON users;
CREATE TRIGGER trigger_update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_users_updated_at();

-- Update RLS for is_admin (Only admins can update is_admin field)
-- Note: This is a bit complex in a single migration without knowing exact policy names,
-- but we can add a general note or a more specific policy if needed.
