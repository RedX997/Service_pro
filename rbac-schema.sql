-- ============================================
-- RBAC (Role-Based Access Control) Schema
-- PostgreSQL Database Design
-- ============================================

-- 1. Create roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    role_name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create users table
CREATE TABLE users (
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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

-- 4. Insert default roles
INSERT INTO roles (role_name) VALUES
    ('super_admin'),
    ('manager'),
    ('receptionist');

-- ============================================
-- Verification Queries
-- ============================================

-- View all roles
-- SELECT * FROM roles;

-- View all users with their roles
-- SELECT u.id, u.name, u.email, r.role_name, u.created_at
-- FROM users u
-- JOIN roles r ON u.role_id = r.id;
