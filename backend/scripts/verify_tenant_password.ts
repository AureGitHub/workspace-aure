// Script para verificar hash de tenant123
export {};

console.log("🔍 Verificando hash de tenant123...\n");

const password = "tenant123";
const storedHash = "2aa60a8ff7fcd473d321e0146afd9e26df395147c4d3b4e4a3d03c72c30600b1";

// Generar hash usando el mismo método que el backend
const encoder = new TextEncoder();
const data = encoder.encode(password);
const hashBuffer = await crypto.subtle.digest("SHA-256", data);
const hashArray = Array.from(new Uint8Array(hashBuffer));
const generatedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

console.log("🔐 Comparación de hashes:");
console.log(`Contraseña: ${password}`);
console.log(`Hash generado: ${generatedHash}`);
console.log(`Hash en DB:    ${storedHash}`);
console.log(`¿Coinciden?:   ${generatedHash === storedHash ? '✅ SÍ' : '❌ NO'}`);

if (generatedHash !== storedHash) {
  console.log("\n💡 Probando diferentes contraseñas:");
  const testPasswords = ["tenant123", "123456", "password", "tenant", "test123"];
  
  for (const testPwd of testPasswords) {
    const testData = encoder.encode(testPwd);
    const testHashBuffer = await crypto.subtle.digest("SHA-256", testData);
    const testHashArray = Array.from(new Uint8Array(testHashBuffer));
    const testHash = testHashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    const matches = testHash === storedHash;
    console.log(`${matches ? '✅' : '❌'} ${testPwd.padEnd(10)} -> ${matches ? 'MATCH!' : 'no match'}`);
  }
}