// Test Database Migration - Step by step
import { createDatabaseService } from "@common-lib/database/mod.ts";
import { loadConfig } from "@common-lib/utils/mod.ts";

async function testMigration() {
  try {
    await loadConfig();
    
    const db = createDatabaseService({
      host: Deno.env.get("DB_HOST"),
      port: parseInt(Deno.env.get("DB_PORT") || "5432"),
      database: Deno.env.get("DB_NAME"),
      username: Deno.env.get("DB_USER"),
      password: Deno.env.get("DB_PASSWORD"),
      ssl: false,
      poolSize: 1,
    });

    await db.connect();
    console.log("✅ Conectado a la base de datos");

    // Step 1: Create profiles table
    console.log("\n📋 Paso 1: Creando tabla profiles...");
    try {
      const result1 = await db.query(`
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
      console.log("⚠️ Error:", error);
    }

    // Step 2: Insert profiles
    console.log("\n📝 Paso 2: Insertando perfiles...");
    try {
      await db.query(`INSERT INTO "app-alquiler".profiles (description) VALUES ('admin') ON CONFLICT (description) DO NOTHING`);
      await db.query(`INSERT INTO "app-alquiler".profiles (description) VALUES ('owner') ON CONFLICT (description) DO NOTHING`);
      await db.query(`INSERT INTO "app-alquiler".profiles (description) VALUES ('tenant') ON CONFLICT (description) DO NOTHING`);
      console.log("✅ Perfiles insertados");
    } catch (error) {
      console.log("⚠️ Error:", error);
    }

    // Step 3: Check if profiles exist
    console.log("\n🔍 Verificando perfiles insertados...");
    const profiles = await db.query(`SELECT * FROM "app-alquiler".profiles ORDER BY id`);
    console.log("Perfiles disponibles:");
    profiles.rows.forEach((profile: any) => {
      console.log(`  - ID: ${profile.id}, Descripción: ${profile.description}`);
    });

    // Step 4: Add profile_id column to users
    console.log("\n🔧 Paso 4: Agregando columna profile_id a users...");
    try {
      await db.query(`ALTER TABLE "app-alquiler".users ADD COLUMN IF NOT EXISTS profile_id INTEGER`);
      console.log("✅ Columna profile_id agregada");
    } catch (error) {
      console.log("⚠️ Error:", error);
    }

    // Step 5: Check current users structure
    console.log("\n👥 Verificando estructura actual de usuarios...");
    const users = await db.query(`
      SELECT id, username, first_name, last_name, user_type, profile_id 
      FROM "app-alquiler".users 
      ORDER BY id 
      LIMIT 3
    `);
    console.log("Usuarios actuales:");
    users.rows.forEach((user: any) => {
      console.log(`  - ${user.username}: user_type=${user.user_type}, profile_id=${user.profile_id}`);
    });

    await db.disconnect();
    console.log("\n🎉 Verificación completada!");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

if (import.meta.main) {
  testMigration();
}