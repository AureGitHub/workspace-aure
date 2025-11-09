// Simple Database Profile Migration
import { createDatabaseService } from "@common-lib/database/mod.ts";
import { loadConfig } from "@common-lib/utils/mod.ts";

async function runSimpleMigration() {
  try {
    await loadConfig();
    
    const db = createDatabaseService({
      host: Deno.env.get("DB_HOST"),
      port: parseInt(Deno.env.get("DB_PORT") || "5432"),
      database: Deno.env.get("DB_NAME"),
      username: Deno.env.get("DB_USER"),
      password: Deno.env.get("DB_PASSWORD"),
      ssl: false, // Disable SSL for now
      poolSize: 1,
    });

    await db.connect();
    console.log("✅ Conectado a la base de datos");

    // Step 1: Create profiles table
    console.log("📋 Creando tabla profiles...");
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS "app-alquiler".profiles (
            id SERIAL PRIMARY KEY,
            description VARCHAR(50) NOT NULL UNIQUE,
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Tabla profiles creada");
    } catch (error) {
      console.log("⚠️ Error creando tabla profiles:", error.message);
    }

    // Step 2: Insert default profiles
    console.log("📝 Insertando perfiles...");
    try {
      await db.execute(`
        INSERT INTO "app-alquiler".profiles (description) VALUES 
            ('admin'),
            ('owner'), 
            ('tenant')
        ON CONFLICT (description) DO NOTHING
      `);
      console.log("✅ Perfiles insertados");
    } catch (error) {
      console.log("⚠️ Error insertando perfiles:", error.message);
    }

    // Step 3: Add profile_id column
    console.log("🔧 Agregando columna profile_id...");
    try {
      await db.execute(`
        ALTER TABLE "app-alquiler".users 
        ADD COLUMN IF NOT EXISTS profile_id INTEGER
      `);
      console.log("✅ Columna profile_id agregada");
    } catch (error) {
      console.log("⚠️ Error agregando columna:", error.message);
    }

    // Step 4: Add FK constraint
    console.log("🔗 Agregando FK constraint...");
    try {
      await db.execute(`
        ALTER TABLE "app-alquiler".users 
        ADD CONSTRAINT fk_users_profile
        FOREIGN KEY (profile_id) REFERENCES "app-alquiler".profiles(id)
      `);
      console.log("✅ FK constraint agregada");
    } catch (error) {
      console.log("⚠️ Error agregando FK (probablemente ya existe):", error.message);
    }

    // Step 5: Migrate data
    console.log("🔄 Migrando datos existentes...");
    try {
      const result = await db.execute(`
        UPDATE "app-alquiler".users 
        SET profile_id = (
            SELECT id FROM "app-alquiler".profiles 
            WHERE description = users.user_type
        )
        WHERE profile_id IS NULL AND user_type IS NOT NULL
      `);
      console.log("✅ Datos migrados");
    } catch (error) {
      console.log("⚠️ Error migrando datos:", error.message);
    }

    // Step 6: Verify migration
    console.log("🔍 Verificando migración...");
    try {
      const users = await db.query(`
        SELECT 
            u.id,
            u.username,
            u.first_name,
            u.last_name,
            u.user_type,
            u.profile_id,
            p.description as profile_name
        FROM "app-alquiler".users u
        LEFT JOIN "app-alquiler".profiles p ON u.profile_id = p.id
        ORDER BY u.id
        LIMIT 5
      `);
      
      console.log("📊 Primeros 5 usuarios:");
      users.rows.forEach((user: any) => {
        console.log(`  - ${user.username}: user_type=${user.user_type}, profile_id=${user.profile_id}, profile_name=${user.profile_name}`);
      });
    } catch (error) {
      console.log("⚠️ Error verificando:", error.message);
    }

    await db.disconnect();
    console.log("🎉 Migración completada!");

  } catch (error) {
    console.error("❌ Error general:", error);
  }
}

if (import.meta.main) {
  runSimpleMigration();
}