// Script simple para verificar hash de admin123
export {};

const password = "admin123";
const encoder = new TextEncoder();
const data = encoder.encode(password);
const hashBuffer = await crypto.subtle.digest("SHA-256", data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

console.log("🔐 Verificando hash de admin123:");
console.log(`Generado: ${hash}`);
console.log(`En DB:    240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9`);
console.log(`Coincide: ${hash === "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9"}`);

// Probar otras contraseñas
const testPasswords = ["123456", "password", "admin", "owner123", "tenant123"];
console.log("\n🔍 Probando otras contraseñas:");

for (const pwd of testPasswords) {
  const data = encoder.encode(pwd);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const testHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  const matches = testHash === "240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9";
  console.log(`${matches ? '✅' : '❌'} ${pwd.padEnd(12)} -> ${testHash.substring(0, 20)}...`);
}