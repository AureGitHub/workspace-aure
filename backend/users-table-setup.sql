-- Simple User Table Setup for App Alquiler Backend
-- Run this script in your PostgreSQL database

-- Create database if it doesn't exist
-- CREATE DATABASE app_alquiler_db;

-- Connect to the database (uncomment if running in psql)
-- \c app_alquiler_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(20) DEFAULT 'tenant' CHECK (user_type IN ('owner', 'tenant', 'admin')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);

-- Insert test users with simple passwords (hashed with SHA-256)
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, user_type, is_active, email_verified) VALUES
-- Username: admin, Password: admin123
('admin', 'admin@test.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin', 'User', '+1234567890', 'admin', true, true),

-- Username: owner1, Password: owner123  
('owner1', 'owner@test.com', 'a17c9aaa61e80a1bf71d0d850af4e5baa9800bbd1a3b1c5fca7b52e7c6c47e29', 'John', 'Owner', '+1234567891', 'owner', true, true),

-- Username: tenant1, Password: tenant123
('tenant1', 'tenant@test.com', '2aa60a8ff7fcd473d321e0146afd9e26df395147c4d3b4e4a3d03c72c30600b1', 'Jane', 'Tenant', '+1234567892', 'tenant', true, true)
ON CONFLICT (username) DO NOTHING;

-- Verify the table was created and populated
SELECT 'Users table created successfully!' as status;
SELECT id, username, email, first_name, last_name, user_type, is_active FROM users;