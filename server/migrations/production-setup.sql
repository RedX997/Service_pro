-- Add missing columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS personal_email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS job_title VARCHAR(100);

-- Add cascade_admin role
INSERT INTO roles (role_name) VALUES ('cascade_admin') ON CONFLICT (role_name) DO NOTHING;

-- Create user_sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
  id               SERIAL PRIMARY KEY,
  user_id          INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  logged_in_at     TIMESTAMP NOT NULL DEFAULT NOW(),
  logged_out_at    TIMESTAMP,
  duration_minutes INT,
  ip_address       VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_logged_in ON user_sessions(logged_in_at);
