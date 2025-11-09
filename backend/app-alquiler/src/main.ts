// Main Application - App Alquiler Backend
import { createServer } from "@common-lib/server/mod.ts";
import { createDatabaseService } from "@common-lib/database/mod.ts";
import { loadConfig, Logger } from "@common-lib/utils/mod.ts";

import { UserRepository } from "./models/user.repository.ts";
import { PropertyRepository } from "./models/property.repository.ts";
import { AuthenticationService } from "./services/auth.service.ts";
import { createAuthRoutes } from "./routes/auth.routes.ts";

async function main() {
  try {
    // Load environment configuration
    await loadConfig();
    
    Logger.info("Starting App Alquiler Backend...");

    // Initialize database (optional for demo)
    let db = null;
    try {
      db = createDatabaseService({
        host: Deno.env.get("DB_HOST"),
        port: parseInt(Deno.env.get("DB_PORT") || "5432"),
        database: Deno.env.get("DB_NAME"),
        username: Deno.env.get("DB_USER"),
        password: Deno.env.get("DB_PASSWORD"),
        ssl: Deno.env.get("DB_SSL") === "true",
        poolSize: parseInt(Deno.env.get("DB_POOL_SIZE") || "10"),
      });

      await db.connect();
      Logger.info("Database connected successfully");
    } catch (error) {
      Logger.warn("Database connection failed, running without database:", (error as Error).message);
      db = null;
    }

    // Initialize repositories (only if database is available)
    let authService = null;
    if (db) {
      const userRepository = new UserRepository(db);
      const propertyRepository = new PropertyRepository(db);
      authService = new AuthenticationService(userRepository);
    }

    // Create server
    const server = createServer({
      port: parseInt(Deno.env.get("PORT") || "3001"),
      hostname: Deno.env.get("HOST") || "localhost",
      cors: true,
      logging: true,
    });

    // Add health check with app prefix
    server.addHealthCheck("/app-alquiler/health");

    // Add database health check
    server.addRoutes([
      {
        method: "GET",
        path: "/app-alquiler/health/db",
        handler: async (ctx: any) => {
          if (db) {
            const isHealthy = await db.healthCheck();
            ctx.response.status = isHealthy ? 200 : 503;
            ctx.response.body = {
              status: isHealthy ? "OK" : "ERROR",
              database: isHealthy ? "connected" : "disconnected",
              timestamp: new Date().toISOString(),
            };
          } else {
            ctx.response.status = 503;
            ctx.response.body = {
              status: "ERROR",
              database: "not configured",
              message: "Database connection is not available",
              timestamp: new Date().toISOString(),
            };
          }
        },
      },
    ]);

    // Add API routes with app prefix (only if database is available)
    if (authService) {
      const authRoutes = createAuthRoutes(authService);
      server.addRouter(authRoutes, "/app-alquiler");
    }

    // Add API info endpoint
    server.addRoutes([
      {
        method: "GET",
        path: "/app-alquiler/api/info",
        handler: (ctx: any) => {
          ctx.response.body = {
            name: "App Alquiler Backend API",
            version: "1.0.0",
            description: "Backend API para la aplicación de alquiler",
            database_status: db ? "connected" : "not available",
            endpoints: {
              health: "/app-alquiler/health",
              database_health: "/app-alquiler/health/db",
              info: "/app-alquiler/api/info",
              auth: authService ? {
                register: "POST /app-alquiler/auth/register",
                login: "POST /app-alquiler/auth/login",
                profile: "GET /app-alquiler/auth/profile",
                update_profile: "PUT /app-alquiler/auth/profile",
                change_password: "PUT /app-alquiler/auth/change-password",
              } : "Not available (database required)",
            },
            timestamp: new Date().toISOString(),
          };
        },
      },
    ]);

    // Graceful shutdown
    const handleShutdown = async () => {
      Logger.info("Shutting down gracefully...");
      if (db) await db.disconnect();
      Deno.exit(0);
    };

    // Handle shutdown signals
    if (Deno.build.os !== "windows") {
      Deno.addSignalListener("SIGINT", handleShutdown);
      Deno.addSignalListener("SIGTERM", handleShutdown);
    } else {
      // Windows: Handle Ctrl+C differently
      globalThis.addEventListener("unload", handleShutdown);
    }

    // Start server
    Logger.info(`Server will start on http://${Deno.env.get("HOST") || "localhost"}:${Deno.env.get("PORT") || "3001"}`);
    
    // Keep the server running - await to block the main thread
    await server.start();

  } catch (error) {
    Logger.error("Failed to start server:", error);
    Deno.exit(1);
  }
}

// Run the application
if (import.meta.main) {
  main();
}