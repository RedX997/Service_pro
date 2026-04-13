-- ============================================
-- Add RBAC Tables to ServicePro Database
-- Run this in pgAdmin Query Tool
-- ============================================

-- 1. Create roles table
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    CONSTRAINT fk_user_role 
        FOREIGN KEY (role_id) 
        REFERENCES roles(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- 4. Insert default roles
INSERT INTO roles (role_name) 
VALUES 
    ('super_admin'),
    ('manager'),
    ('receptionist')
ON CONFLICT (role_name) DO NOTHING;

-- 5. Verify the setup
SELECT 'Roles table created successfully' AS status;
SELECT * FROM roles;
