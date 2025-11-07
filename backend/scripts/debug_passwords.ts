// Script para verificar hash de contraseñas
import { createAuthService } from "../common-lib/src/auth/auth.ts";

console.log("🔍 Verificando hashes de contraseñas...\n");

const authService = createAuthService();

// Contraseñas a verificar
const passwords = [
  { label: "admin123", password: "admin123" },
  { label: "owner123", password: "owner123" },
  { label: "tenant123", password: "tenant123" },
  { label: "aure123", password: "aure123" }
];

// Hashes de la base de datos
const dbHashes = {
  admin: "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9",
  owner: "a17c9aaa61e80a1bf71d0d850af4e5baa9800bbd1a3b1c5fca7b52e7c6c47e29",
  tenant: "2aa60a8ff7fcd473d321e0146afd9e26df395147c4d3b4e4a3d03c72c30600b1",
  aure: "f6f2ea8f45d8a057c9566a33f99474da2e5c6a6604e5a6c6c5e8b5d2c3f1e4a7"
};

for (const { label, password } of passwords) {
  const hash = await authService.hashPassword(password);
  console.log(`📝 ${label.padEnd(12)} -> ${hash}`);
}

console.log("\n🗄️  Hashes en base de datos:");
console.log(`📝 admin        -> ${dbHashes.admin}`);
console.log(`📝 owner        -> ${dbHashes.owner}`);  
console.log(`📝 tenant       -> ${dbHashes.tenant}`);
console.log(`📝 aure         -> ${dbHashes.aure}`);

console.log("\n🔍 Verificando coincidencias:");

// Verificar admin123
const adminMatch = await authService.verifyPassword("admin123", dbHashes.admin);
console.log(`✅ admin123 vs DB admin: ${adminMatch}`);

// Intentar con otras contraseñas comunes
const commonPasswords = ["123456", "password", "admin", "owner123", "tenant123", "aure123"];

console.log("\n🔍 Probando contraseñas comunes contra hash del admin:");
for (const pwd of commonPasswords) {
  const match = await authService.verifyPassword(pwd, dbHashes.admin);
  console.log(`${match ? '✅' : '❌'} ${pwd.padEnd(12)} -> ${match}`);
}