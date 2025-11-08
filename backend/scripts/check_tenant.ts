// Script para verificar específicamente el usuario tenant
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

console.log("🔍 Verificando usuario tenant...\n");

const client = new Client({
  user: "aure",
  database: "workspace-aure",
  hostname: "postgresql-118326-0.cloudclusters.net",
  port: 18718,
  password: "jas11jas11",
  tls: {
    enabled: true,
    enforce: false,
    caCertificates: [],
  }
});

try {
  await client.connect();
  console.log("✅ Conectado a la base de datos");

  // Verificar si existe el usuario tenant
  const result = await client.queryObject(`
    SELECT id, username, email, user_type, password_hash, is_active 
    FROM "app-alquiler".users 
    WHERE email = 'tenant@test.com'
  `);

  if (result.rows.length === 0) {
    console.log("❌ No se encontró el usuario tensor@test.com");
  } else {
    const user = result.rows[0] as any;
    console.log("✅ Usuario encontrado:");
    console.log(`   ID: ${user.id}`);
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Type: ${user.user_type}`);
    console.log(`   Active: ${user.is_active}`);
    console.log(`   Hash: ${user.password_hash}`);
  }

  // Verificar todos los usuarios disponibles
  console.log("\n📋 Todos los usuarios en la base de datos:");
  const allUsers = await client.queryObject(`
    SELECT id, username, email, user_type 
    FROM "app-alquiler".users 
    ORDER BY id
  `);

  for (const user of allUsers.rows) {
    const u = user as any;
    console.log(`   ${u.id}: ${u.username} (${u.email}) - ${u.user_type}`);
  }

} catch (error) {
  console.error("❌ Error:", error);
} finally {
  await client.end();
}