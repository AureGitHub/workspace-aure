-- Eliminar tabla properties si existe
DROP TABLE IF EXISTS properties CASCADE;
-- Database Setup Script for App Alquiler Backend
-- PostgreSQL Database Schema

-- Create database (run this first if the database doesn't exist)
-- CREATE DATABASE app_alquiler_db;

-- Connect to the database

    username VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(20) DEFAULT 'tenant' CHECK (user_type IN ('owner', 'tenant', 'admin')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Create properties table (for future use)
DROP TABLE IF EXISTS properties CASCADE;

    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, user_type, is_active, email_verified) VALUES
-- Password: 'tenant123' hashed with SHA-256
 ARRAY['https://example.com/img1.jpg', 'https://example.com/img2.jpg'], 

('Casa familiar en Valencia', 'Casa de 3 habitaciones con jardín, perfecta para familias.', 'Avenida del Puerto, 45', 'Valencia', 'Valencia', '46023', 'España', 'house', 3, 2, 120.00, 900.00, 'EUR', 'available',
 ARRAY['https://example.com/house1.jpg', 'https://example.com/house2.jpg'],
('Estudio moderno en Barcelona', 'Estudio completamente equipado en zona universitaria.', 'Carrer de Balmes, 78', 'Barcelona', 'Cataluña', '08007', 'España', 'studio', 1, 1, 35.00, 700.00, 'EUR', 'rented',
 ARRAY['wifi', 'aire_acondicionado', 'amueblado'], 2);

-- Display inserted data
SELECT 'USERS CREATED:' as info;
SELECT id, username, email, first_name, last_name, user_type, is_active, email_verified FROM users;

SELECT 'PROPERTIES CREATED:' as info;
SELECT id, title, city, property_type, bedrooms, monthly_rent, availability_status, owner_id FROM properties;

-- Display connection info
SELECT 'DATABASE SETUP COMPLETED SUCCESSFULLY' as status;