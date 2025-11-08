// Script para limpiar y recrear usuarios con contraseñas correctas
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts";

console.log("🔄 Limpiando y recreando usuarios...\n");

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

  // Generar hashes correctos
  const generateHash = async (password: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  console.log("🔐 Generando hashes correctos...");
  const adminHash = await generateHash("admin123");
  const ownerHash = await generateHash("owner123");
  const tenantHash = await generateHash("tenant123");
  const aureHash = await generateHash("aure123");

  console.log(`Admin hash: ${adminHash}`);
  console.log(`Owner hash: ${ownerHash}`);
  console.log(`Tenant hash: ${tenantHash}`);
  console.log(`Aure hash: ${aureHash}`);

  // Eliminar usuarios existentes
  console.log("\n🗑️ Eliminando usuarios existentes...");
  await client.queryObject(`DELETE FROM "app-alquiler".users`);

  // Insertar usuarios con hashes correctos
  console.log("👥 Insertando usuarios con hashes correctos...");
  await client.queryObject(`
    INSERT INTO "app-alquiler".users (username, email, password_hash, first_name, last_name, phone, user_type, is_active, email_verified) VALUES
    ('admin', 'admin@test.com', '${adminHash}', 'Admin', 'User', '+1234567890', 'admin', true, true),
    ('owner1', 'owner@test.com', '${ownerHash}', 'John', 'Owner', '+1234567891', 'owner', true, true),
    ('tenant1', 'tenant@test.com', '${tenantHash}', 'Jane', 'Tenant', '+1234567892', 'tenant', true, true),
    ('usuario_aure', 'aure@workspace.com', '${aureHash}', 'Aure', 'Workspace', '+34123456789', 'admin', true, true)
  `);

  console.log("\n✅ Usuarios recreados exitosamente!");
  
  // Verificar que se insertaron correctamente
  const users = await client.queryObject(`
    SELECT username, email, user_type 
    FROM "app-alquiler".users 
    ORDER BY id
  `);

  console.log("\n👥 Usuarios verificados:");
  for (const user of users.rows) {
    const u = user as any;
    console.log(`   ✅ ${u.username} (${u.email}) - ${u.user_type}`);
  }

} catch (error) {
  console.error("❌ Error:", error);
} finally {
  await client.end();
}

export {};