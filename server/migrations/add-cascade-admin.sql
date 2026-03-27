-- Add cascade_admin role
INSERT INTO roles (role_name) VALUES ('cascade_admin') ON CONFLICT (role_name) DO NOTHING;

-- Add personal_email and is_active columns to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS personal_email VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Create cascade_credentials table (company credential log)
CREATE TABLE IF NOT EXISTS cascade_credentials (
  id             SERIAL PRIMARY KEY,
  full_name      VARCHAR(100) NOT NULL,
  role_name      VARCHAR(50)  NOT NULL,
  system_email   VARCHAR(150) NOT NULL UNIQUE,
  personal_email VARCHAR(150) NOT NULL,
  plain_password VARCHAR(100) NOT NULL,
  is_active      BOOLEAN      NOT NULL DEFAULT true,
  created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);
