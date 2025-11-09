// Complete Migration - Migrate data and set FK
import { createDatabaseService } from "@common-lib/database/mod.ts";
import { loadConfig } from "@common-lib/utils/mod.ts";

async function completeMigration() {
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

    // Step 1: Migrate existing data
    console.log("\n🔄 Migrando datos existentes...");
    
    // Migrate admin users
    const adminResult = await db.query(`
      UPDATE "app-alquiler".users 
      SET profile_id = (SELECT id FROM "app-alquiler".profiles WHERE description = 'admin')
      WHERE user_type = 'admin' AND profile_id IS NULL
    `);
    console.log("✅ Usuarios admin migrados");

    // Migrate owner users  
    const ownerResult = await db.query(`
      UPDATE "app-alquiler".users 
      SET profile_id = (SELECT id FROM "app-alquiler".profiles WHERE description = 'owner')
      WHERE user_type = 'owner' AND profile_id IS NULL
    `);
    console.log("✅ Usuarios owner migrados");

    // Migrate tenant users
    const tenantResult = await db.query(`
      UPDATE "app-alquiler".users 
      SET profile_id = (SELECT id FROM "app-alquiler".profiles WHERE description = 'tenant')
      WHERE user_type = 'tenant' AND profile_id IS NULL
    `);
    console.log("✅ Usuarios tenant migrados");

    // Step 2: Verify migration
    console.log("\n🔍 Verificando migración...");
    const migratedUsers = await db.query(`
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
    `);
    
    console.log("📊 Usuarios migrados:");
    migratedUsers.rows.forEach((user: any) => {
      const status = user.profile_id ? "✅" : "❌";
      console.log(`  ${status} ${user.username}: ${user.user_type} -> profile_id: ${user.profile_id} (${user.profile_name || 'NO MIGRADO'})`);
    });

    // Step 3: Add FK constraint
    console.log("\n🔗 Agregando Foreign Key constraint...");
    try {
      await db.query(`
        ALTER TABLE "app-alquiler".users 
        ADD CONSTRAINT fk_users_profile
        FOREIGN KEY (profile_id) REFERENCES "app-alquiler".profiles(id)
      `);
      console.log("✅ FK constraint agregada");
    } catch (error: any) {
      if (error.message?.includes("already exists")) {
        console.log("⚠️ FK constraint ya existe");
      } else {
        console.log("⚠️ Error con FK:", error.message);
      }
    }

    // Step 4: Make profile_id NOT NULL (only if all users have been migrated)
    const unmigrated = await db.query(`
      SELECT COUNT(*) as count FROM "app-alquiler".users WHERE profile_id IS NULL
    `);
    
    if (parseInt(unmigrated.rows[0].count) === 0) {
      console.log("\n🔒 Haciendo profile_id obligatorio...");
      try {
        await db.query(`ALTER TABLE "app-alquiler".users ALTER COLUMN profile_id SET NOT NULL`);
        console.log("✅ profile_id es ahora obligatorio");
      } catch (error: any) {
        console.log("⚠️ Error haciendo profile_id NOT NULL:", error.message);
      }
    } else {
      console.log(`⚠️ ${unmigrated.rows[0].count} usuarios no migrados. No se puede hacer profile_id NOT NULL todavía.`);
    }

    // Step 5: Create index
    console.log("\n📇 Creando índice...");
    try {
      await db.query(`CREATE INDEX IF NOT EXISTS idx_users_profile_id ON "app-alquiler".users(profile_id)`);
      console.log("✅ Índice creado");
    } catch (error: any) {
      console.log("⚠️ Error creando índice:", error.message);
    }

    await db.disconnect();
    console.log("\n🎉 Migración completada!");
    console.log("\n💡 Próximo paso manual (después de verificar que todo funciona):");
    console.log("   ALTER TABLE \"app-alquiler\".users DROP COLUMN user_type;");

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

if (import.meta.main) {
  completeMigration();
}