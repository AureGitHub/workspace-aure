// Script para ejecutar automáticamente la configuración de la base de datos
// Este script se conecta a la base de datos y crea las tablas necesarias

import { createDatabaseService } from "../common-lib/src/database/mod.ts";
import { loadConfig, Logger } from "../common-lib/src/utils/mod.ts";

async function setupDatabase() {
  try {
    // Cargar configuración
    await loadConfig();
    
    Logger.info("Iniciando configuración de base de datos...");
    
    // Crear conexión a la base de datos
    const db = createDatabaseService({
      host: Deno.env.get("DB_HOST"),
      port: parseInt(Deno.env.get("DB_PORT") || "5432"),
      database: Deno.env.get("DB_NAME"),
      username: Deno.env.get("DB_USER"),
      password: Deno.env.get("DB_PASSWORD"),
      ssl: Deno.env.get("DB_SSL") === "true",
      poolSize: 1, // Solo necesitamos una conexión para setup
    });

    await db.connect();
    Logger.info("✅ Conectado a la base de datos");

    // Crear esquema
    Logger.info("Creando esquema app-alquiler...");
    await db.query('CREATE SCHEMA IF NOT EXISTS "app-alquiler"');
    Logger.info("✅ Esquema creado");

    // Crear tabla users
    Logger.info("Creando tabla users...");
    const createUsersSQL = `
      CREATE TABLE IF NOT EXISTS "app-alquiler".users (
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
      )
    `;
    
    await db.query(createUsersSQL);
    Logger.info("✅ Tabla users creada");

    // Crear índices
    Logger.info("Creando índices...");
    await db.query('CREATE INDEX IF NOT EXISTS idx_users_email ON "app-alquiler".users(email)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_users_username ON "app-alquiler".users(username)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_users_user_type ON "app-alquiler".users(user_type)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_users_is_active ON "app-alquiler".users(is_active)');
    Logger.info("✅ Índices creados");

    // Insertar usuarios de prueba
    Logger.info("Insertando usuarios de prueba...");
    const insertUsersSQL = `
      INSERT INTO "app-alquiler".users (username, email, password_hash, first_name, last_name, phone, user_type, is_active, email_verified) VALUES
      ('admin', 'admin@test.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin', 'User', '+1234567890', 'admin', true, true),
      ('owner1', 'owner@test.com', 'a17c9aaa61e80a1bf71d0d850af4e5baa9800bbd1a3b1c5fca7b52e7c6c47e29', 'John', 'Owner', '+1234567891', 'owner', true, true),
      ('tenant1', 'tenant@test.com', '2aa60a8ff7fcd473d321e0146afd9e26df395147c4d3b4e4a3d03c72c30600b1', 'Jane', 'Tenant', '+1234567892', 'tenant', true, true),
      ('usuario_aure', 'aure@workspace.com', 'f6f2ea8f45d8a057c9566a33f99474da2e5c6a6604e5a6c6c5e8b5d2c3f1e4a7', 'Aure', 'Workspace', '+34123456789', 'admin', true, true)
      ON CONFLICT (username) DO NOTHING
    `;
    
    const result = await db.query(insertUsersSQL);
    Logger.info(`✅ Usuarios insertados (${result.rowCount} usuarios)`);

    // Crear tabla properties
    Logger.info("Creando tabla properties...");
    const createPropertiesSQL = `
      CREATE TABLE IF NOT EXISTS "app-alquiler".properties (
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
        owner_id INTEGER REFERENCES "app-alquiler".users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    
    await db.query(createPropertiesSQL);
    Logger.info("✅ Tabla properties creada");

    // Crear índices para properties
    await db.query('CREATE INDEX IF NOT EXISTS idx_properties_city ON "app-alquiler".properties(city)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_properties_property_type ON "app-alquiler".properties(property_type)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_properties_availability ON "app-alquiler".properties(availability_status)');
    await db.query('CREATE INDEX IF NOT EXISTS idx_properties_owner ON "app-alquiler".properties(owner_id)');
    Logger.info("✅ Índices para properties creados");

    // Verificar usuarios creados
    const users = await db.query('SELECT id, username, email, first_name, last_name, user_type FROM "app-alquiler".users ORDER BY id');
    Logger.info("✅ Usuarios en la base de datos:");
    for (const user of users.rows) {
      Logger.info(`  - ${user.username} (${user.email}) - ${user.user_type}`);
    }

    await db.disconnect();
    Logger.info("🎉 Configuración de base de datos completada exitosamente!");
    
    Logger.info("\n=== USUARIOS DE PRUEBA ===");
    Logger.info("admin      | admin@test.com      | admin123");
    Logger.info("owner1     | owner@test.com      | owner123");
    Logger.info("tenant1    | tenant@test.com     | tenant123");
    Logger.info("usuario_aure | aure@workspace.com | aure123");
    
    Logger.info("\n=== PRÓXIMOS PASOS ===");
    Logger.info("1. El backend ya está configurado y funcionando");
    Logger.info("2. Puedes probar los endpoints de autenticación");
    Logger.info("3. Visita http://localhost:3001/api/info para ver la API");

  } catch (error) {
    Logger.error("❌ Error configurando la base de datos:", error);
    Deno.exit(1);
  }
}

// Ejecutar si es el archivo principal
if (import.meta.main) {
  setupDatabase();
}