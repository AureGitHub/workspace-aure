// Script para verificar el hash de contraseñas
export {};

// Simulamos el mismo algoritmo de hash que usa el backend
import { crypto } from "https://deno.land/std@0.221.0/crypto/mod.ts";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const passwords = ['admin123', 'owner123', 'tenant123', 'aure123'];

console.log("🔐 Verificando hashes de contraseñas:");
for (const password of passwords) {
  const hash = await hashPassword(password);
  console.log(`${password} -> ${hash}`);
}