-- Add employee role (safe to run multiple times)
INSERT INTO roles (role_name) VALUES ('employee') ON CONFLICT (role_name) DO NOTHING;
