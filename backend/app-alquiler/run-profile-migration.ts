// Database Profile Migration Script
// Este script migra la base de datos de user_type a profile_id

import { createDatabaseService } from "@common-lib/database/mod.ts";
import { loadConfig, Logger } from "@common-lib/utils/mod.ts";

async function runMigration() {
  try {
    // Load environment configuration
    await loadConfig();
    
    Logger.info("🔄 Iniciando migración de perfiles...");

    // Initialize database
    const db = createDatabaseService({
      host: Deno.env.get("DB_HOST"),
      port: parseInt(Deno.env.get("DB_PORT") || "5432"),
      database: Deno.env.get("DB_NAME"),
      username: Deno.env.get("DB_USER"),
      password: Deno.env.get("DB_PASSWORD"),
      ssl: Deno.env.get("DB_SSL") === "true",
      poolSize: parseInt(Deno.env.get("DB_POOL_SIZE") || "10"),
    });

    await db.connect();
    Logger.info("✅ Conectado a la base de datos");

    // Step 1: Create profiles table
    Logger.info("📋 Paso 1: Creando tabla profiles...");
    await db.execute(`
      CREATE TABLE IF NOT EXISTS "app-alquiler".profiles (
          id SERIAL PRIMARY KEY,
          description VARCHAR(50) NOT NULL UNIQUE,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Step 2: Insert default profiles
    Logger.info("📝 Paso 2: Insertando perfiles por defecto...");
    await db.execute(`
      INSERT INTO "app-alquiler".profiles (description) VALUES 
          ('admin'),
          ('owner'), 
          ('tenant')
      ON CONFLICT (description) DO NOTHING
    `);

    // Step 3: Add profile_id column to users table
    Logger.info("🔧 Paso 3: Agregando columna profile_id a tabla users...");
    await db.execute(`
      ALTER TABLE "app-alquiler".users 
      ADD COLUMN IF NOT EXISTS profile_id INTEGER REFERENCES "app-alquiler".profiles(id)
    `);

    // Step 4: Migrate existing data
    Logger.info("🔄 Paso 4: Migrando datos existentes...");
    
    // Check if user_type column exists
    const columnExists = await db.queryOne(`
      SELECT COUNT(*) as count 
      FROM information_schema.columns 
      WHERE table_schema = 'app-alquiler' 
      AND table_name = 'users' 
      AND column_name = 'user_type'
    `);

    if (columnExists && parseInt(columnExists.count) > 0) {
      Logger.info("📊 Columna user_type encontrada, migrando datos...");
      
      await db.execute(`
        UPDATE "app-alquiler".users 
        SET profile_id = (
            SELECT id FROM "app-alquiler".profiles 
            WHERE description = users.user_type
        )
        WHERE profile_id IS NULL
      `);

      // Count migrated records
      const migratedCount = await db.queryOne(`
        SELECT COUNT(*) as count FROM "app-alquiler".users WHERE profile_id IS NOT NULL
      `);
      Logger.info(`✅ ${migratedCount?.count} usuarios migrados`);
    } else {
      Logger.info("⚠️ Columna user_type no encontrada, saltando migración de datos");
    }

    // Step 5: Make profile_id NOT NULL
    Logger.info("🔒 Paso 5: Haciendo profile_id obligatorio...");
    await db.execute(`
      ALTER TABLE "app-alquiler".users 
      ALTER COLUMN profile_id SET NOT NULL
    `);

    // Step 6: Create index
    Logger.info("📇 Paso 6: Creando índice...");
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_users_profile_id ON "app-alquiler".users(profile_id)
    `);

    // Step 7: Verification query
    Logger.info("🔍 Paso 7: Verificando migración...");
    const verification = await db.query(`
      SELECT 
          u.id,
          u.username,
          u.email,
          u.first_name,
          u.last_name,
          p.description as profile_name
      FROM "app-alquiler".users u
      JOIN "app-alquiler".profiles p ON u.profile_id = p.id
      ORDER BY u.id
      LIMIT 5
    `);

    Logger.info("✅ Primeros 5 usuarios verificados:");
    verification.rows.forEach((user: any) => {
      Logger.info(`  - ${user.username} (${user.first_name} ${user.last_name}): ${user.profile_name}`);
    });

    // Final step: Show instructions for dropping user_type column
    Logger.info("🎉 Migración completada exitosamente!");
    Logger.info("💡 Para completar la migración, ejecuta manualmente:");
    Logger.info("   ALTER TABLE \"app-alquiler\".users DROP COLUMN IF EXISTS user_type;");
    Logger.info("   (Solo después de verificar que todo funciona correctamente)");

    await db.disconnect();
    
  } catch (error) {
    Logger.error("❌ Error durante la migración:", error);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.main) {
  runMigration()
    .then(() => {
      Logger.info("🎊 Migración finalizada");
      Deno.exit(0);
    })
    .catch((error) => {
      Logger.error("💥 Migración falló:", error);
      Deno.exit(1);
    });
}