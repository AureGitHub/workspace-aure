-- Database Setup Script for App Alquiler Backend
-- PostgreSQL Database Schema

-- Create database (run this first if the database doesn't exist)
-- CREATE DATABASE app_alquiler_db;

-- Connect to the database
-- \c app_alquiler_db;

-- Create users table
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
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

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Create properties table (for future use)
DROP TABLE IF EXISTS properties CASCADE;

CREATE TABLE properties (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    address VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    property_type VARCHAR(20) NOT NULL CHECK (property_type IN ('apartment', 'house', 'room', 'studio', 'other')),
    bedrooms INTEGER NOT NULL,
    bathrooms INTEGER NOT NULL,
    area_sqm DECIMAL(10,2) NOT NULL,
    monthly_rent DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'EUR',
    availability_status VARCHAR(20) DEFAULT 'available' CHECK (availability_status IN ('available', 'rented', 'maintenance', 'inactive')),
    images TEXT[],
    amenities TEXT[],
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for properties
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_property_type ON properties(property_type);
CREATE INDEX idx_properties_availability ON properties(availability_status);
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_monthly_rent ON properties(monthly_rent);

-- Insert test users
INSERT INTO users (username, email, password_hash, first_name, last_name, phone, user_type, is_active, email_verified) VALUES
-- Password: 'password123' hashed with SHA-256
('admin_user', 'admin@appalquiler.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Admin', 'System', '+34123456789', 'admin', true, true),

-- Password: 'owner123' hashed with SHA-256  
('propietario1', 'owner@appalquiler.com', 'a17c9aaa61e80a1bf71d0d850af4e5baa9800bbd1a3b1c5fca7b52e7c6c47e29', 'Juan', 'García', '+34987654321', 'owner', true, true),

-- Password: 'tenant123' hashed with SHA-256
('inquilino1', 'tenant@appalquiler.com', '2aa60a8ff7fcd473d321e0146afd9e26df395147c4d3b4e4a3d03c72c30600b1', 'María', 'López', '+34555666777', 'tenant', true, true),

-- Password: 'demo123' hashed with SHA-256
('demo_owner', 'demo.owner@appalquiler.com', '593eb32d516e1f94b5a42c58826b071d98e2f221f618e0aaf07b7d6b0f8b96f0', 'Carlos', 'Martínez', '+34111222333', 'owner', true, false),

-- Password: 'demo123' hashed with SHA-256
('demo_tenant', 'demo.tenant@appalquiler.com', '593eb32d516e1f94b5a42c58826b071d98e2f221f618e0aaf07b7d6b0f8b96f0', 'Ana', 'Rodríguez', '+34444555666', 'tenant', true, false);

-- Insert test properties
INSERT INTO properties (title, description, address, city, state, postal_code, country, property_type, bedrooms, bathrooms, area_sqm, monthly_rent, currency, availability_status, images, amenities, owner_id) VALUES
('Apartamento céntrico en Madrid', 'Hermoso apartamento de 2 habitaciones en el centro de Madrid, completamente amueblado.', 'Calle Gran Vía, 15', 'Madrid', 'Madrid', '28013', 'España', 'apartment', 2, 1, 75.50, 1200.00, 'EUR', 'available', 
 ARRAY['https://example.com/img1.jpg', 'https://example.com/img2.jpg'], 
 ARRAY['wifi', 'aire_acondicionado', 'ascensor', 'calefaccion'], 2),

('Casa familiar en Valencia', 'Casa de 3 habitaciones con jardín, perfecta para familias.', 'Avenida del Puerto, 45', 'Valencia', 'Valencia', '46023', 'España', 'house', 3, 2, 120.00, 900.00, 'EUR', 'available',
 ARRAY['https://example.com/house1.jpg', 'https://example.com/house2.jpg'],
 ARRAY['jardin', 'garaje', 'wifi', 'calefaccion'], 4),

('Estudio moderno en Barcelona', 'Estudio completamente equipado en zona universitaria.', 'Carrer de Balmes, 78', 'Barcelona', 'Cataluña', '08007', 'España', 'studio', 1, 1, 35.00, 700.00, 'EUR', 'rented',
 ARRAY['https://example.com/studio1.jpg'],
 ARRAY['wifi', 'aire_acondicionado', 'amueblado'], 2);

-- Display inserted data
SELECT 'USERS CREATED:' as info;
SELECT id, username, email, first_name, last_name, user_type, is_active, email_verified FROM users;

SELECT 'PROPERTIES CREATED:' as info;
SELECT id, title, city, property_type, bedrooms, monthly_rent, availability_status, owner_id FROM properties;

-- Display connection info
SELECT 'DATABASE SETUP COMPLETED SUCCESSFULLY' as status;