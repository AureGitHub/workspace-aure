import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

console.log("🚀 === CONFIGURACIÓN AUTOMÁTICA DE BASE DE DATOS ===");
console.log("📡 Conectando a CloudClusters PostgreSQL...");

const client = new Client({
  user: "aure",
  database: "workspace-aure",
  hostname: "postgresql-118326-0.cloudclusters.net",
  password: "jas11jas11",
  port: 18718,
  tls: {
    enabled: false,
    enforce: false,
    caCertificates: []
  }
});

try {
  // Borrar tabla properties si existe antes de cualquier otra operación
  console.log("🗑️ Borrando tabla de propiedades si existe...");
  await client.queryObject(`DROP TABLE IF EXISTS "app-alquiler".properties CASCADE`);
  await client.connect();
  console.log("✅ Conectado exitosamente a la base de datos");

  // Crear esquema
  console.log("📁 Creando esquema app-alquiler...");
  await client.queryObject(`CREATE SCHEMA IF NOT EXISTS "app-alquiler"`);

  // Crear tabla users
  console.log("👥 Creando tabla de usuarios...");
  await client.queryObject(`
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
  `);

  // Crear índices para users
  console.log("🔍 Creando índices para usuarios...");
  await client.queryObject(`CREATE INDEX IF NOT EXISTS idx_users_email ON "app-alquiler".users(email)`);
  await client.queryObject(`CREATE INDEX IF NOT EXISTS idx_users_username ON "app-alquiler".users(username)`);
  await client.queryObject(`CREATE INDEX IF NOT EXISTS idx_users_user_type ON "app-alquiler".users(user_type)`);
  await client.queryObject(`CREATE INDEX IF NOT EXISTS idx_users_is_active ON "app-alquiler".users(is_active)`);

  // Insertar usuarios de prueba
  console.log("📝 Insertando usuarios de prueba...");
  const insertUsersQuery = `
    INSERT INTO "app-alquiler".users (username, email, password_hash, first_name, last_name, phone, user_type, is_active, email_verified) VALUES
    ('admin', 'admin@test.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'Admin', 'User', '+1234567890', 'admin', true, true),
    ('owner1', 'owner@test.com', 'a17c9aaa61e80a1bf71d0d850af4e5baa9800bbd1a3b1c5fca7b52e7c6c47e29', 'John', 'Owner', '+1234567891', 'owner', true, true),
    ('tenant1', 'tenant@test.com', '2aa60a8ff7fcd473d321e0146afd9e26df395147c4d3b4e4a3d03c72c30600b1', 'Jane', 'Tenant', '+1234567892', 'tenant', true, true),
    ('usuario_aure', 'aure@workspace.com', 'f6f2ea8f45d8a057c9566a33f99474da2e5c6a6604e5a6c6c5e8b5d2c3f1e4a7', 'Aure', 'Workspace', '+34123456789', 'admin', true, true)
    ON CONFLICT (username) DO NOTHING
  `;
  
  await client.queryObject(insertUsersQuery);


  // Borrar tabla properties si existe
  console.log("🗑️ Borrando tabla de propiedades si existe...");
  await client.queryObject(`DROP TABLE IF EXISTS "app-alquiler".properties CASCADE`);

  // Verificar resultados
  const usersResult = await client.queryObject(`SELECT count(*) as usuarios_creados FROM "app-alquiler".users`);
  const usersList = await client.queryObject(`SELECT username, email, user_type FROM "app-alquiler".users ORDER BY id`);

  console.log("\n✅ ¡CONFIGURACIÓN COMPLETADA EXITOSAMENTE!");
  console.log(`📊 Usuarios creados: ${usersResult.rows[0].usuarios_creados}`);
  
  console.log("\n👥 === USUARIOS DE PRUEBA DISPONIBLES ===");
  usersList.rows.forEach((user: any) => {
    console.log(`   ${user.username.padEnd(12)} | ${user.email.padEnd(20)} | ${user.user_type}`);
  });

  console.log("\n🔑 === CONTRASEÑAS DE PRUEBA ===");
  console.log("   admin      -> admin123");
  console.log("   owner1     -> owner123");
  console.log("   tenant1    -> tenant123");
  console.log("   usuario_aure -> aure123");

  console.log("\n🌐 === ENDPOINTS DISPONIBLES ===");
  console.log("   GET  http://localhost:3001/health");
  console.log("   GET  http://localhost:3001/health/db");
  console.log("   POST http://localhost:3001/auth/register");
  console.log("   POST http://localhost:3001/auth/login");

  console.log("\n🎉 ¡BASE DE DATOS LISTA PARA USAR!");

} catch (error) {
  console.error("❌ Error configurando la base de datos:", error);
  Deno.exit(1);
} finally {
  await client.end();
}