// Script to verify users in database
import { createDatabaseService } from "../common-lib/src/database/database.ts";

console.log("🔍 Verificando usuarios en la base de datos...\n");

try {
  // Create database service using same config as main app
  const db = createDatabaseService({
    host: "postgresql-118326-0.cloudclusters.net",
    port: 18718,
    database: "workspace-aure",
    username: "aure",
    password: "jas11jas11",
    ssl: true,
    poolSize: 10,
  });

  await db.connect();
  console.log("✅ Conectado a la base de datos\n");

  // Query all users
  const result = await db.query(`
    SELECT 
      id, 
      username, 
      email, 
      role,
      password_hash,
      created_at,
      updated_at
    FROM users 
    ORDER BY id
  `);

  console.log(`📊 Total de usuarios encontrados: ${result.rows.length}\n`);

  for (const user of result.rows) {
    console.log(`👤 Usuario: ${user.username}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔐 Role: ${user.role}`);
    console.log(`   🔑 Hash: ${user.password_hash}`);
    console.log(`   📅 Creado: ${user.created_at}`);
    console.log(`   📅 Actualizado: ${user.updated_at}\n`);
  }

  await db.disconnect();
} catch (error) {
  console.error("❌ Error al verificar usuarios:", error);
}