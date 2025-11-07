// Script de prueba simple para probar la API
export {};
console.log("🧪 === PROBANDO API BACKEND ===");

try {
  const response = await fetch("http://localhost:3001/health");
  
  if (response.ok) {
    const data = await response.json();
    console.log("✅ Respuesta exitosa:");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(`❌ Error: ${response.status} ${response.statusText}`);
  }
} catch (error) {
  console.log(`❌ Error de conexión: ${error}`);
}

console.log("\n🔍 Probando endpoint de salud de BD:");

try {
  const response = await fetch("http://localhost:3001/health/db");
  
  if (response.ok) {
    const data = await response.json();
    console.log("✅ Base de datos OK:");
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(`❌ Error BD: ${response.status} ${response.statusText}`);
  }
} catch (error) {
  console.log(`❌ Error BD: ${error}`);
}