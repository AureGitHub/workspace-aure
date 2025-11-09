// Test Database Connection
import { createDatabaseService } from "@common-lib/database/mod.ts";
import { loadConfig } from "@common-lib/utils/mod.ts";

async function testDatabase() {
  try {
    console.log("🔍 Testing database connection...");
    
    // Load environment configuration
    await loadConfig();
    
    // Create database service
    const db = createDatabaseService({
      host: Deno.env.get("DB_HOST"),
      port: parseInt(Deno.env.get("DB_PORT") || "5432"),
      database: Deno.env.get("DB_NAME"),
      username: Deno.env.get("DB_USER"),
      password: Deno.env.get("DB_PASSWORD"),
      ssl: Deno.env.get("DB_SSL") === "true",
      poolSize: parseInt(Deno.env.get("DB_POOL_SIZE") || "10"),
    });

    console.log("📋 Database config:", db.getConnectionInfo());

    // Try to connect
    await db.connect();
    console.log("✅ Database connected successfully");
    
    // Test query to get users
    const users = await db.query('SELECT * FROM "app-alquiler".users LIMIT 5');
    console.log(`👥 Found ${users.rowCount} users in database:`);
    
    users.rows.forEach((user: any) => {
      console.log(`  - ID: ${user.id}, Name: ${user.first_name} ${user.last_name}, Email: ${user.email}, Type: ${user.user_type}`);
    });
    
    // Disconnect
    await db.disconnect();
    console.log("🔌 Database disconnected");
    
  } catch (error) {
    console.error("❌ Database test failed:", error);
    console.error("Stack:", error.stack);
  }
}

if (import.meta.main) {
  testDatabase();
}