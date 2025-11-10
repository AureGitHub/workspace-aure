// Main Application - App Alquiler Backend
import { Application, Router } from "https://deno.land/x/oak@v17.1.0/mod.ts";
import { createDatabaseService } from "@common-lib/database/mod.ts";
import { loadConfig, Logger } from "@common-lib/utils/mod.ts";
import { UserRepository } from "./models/user.repository.ts";
import { ProfileRepository } from "./models/profile.repository.ts";
import { CatastroRepository } from "./models/catastro.repository.ts";
import { createUserRoutes } from "./routes/user.routes.ts";

async function main() {
  try {
    // Load environment configuration
    await loadConfig();
    
    Logger.info("Starting App Alquiler Backend...");

    // Initialize database
    let db = null;
    let userRepository = null;
    let profileRepository = null;
    let catastroRepository = null;

    
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
      
      userRepository = new UserRepository(db);
      profileRepository = new ProfileRepository(db);
      catastroRepository = new CatastroRepository(db);
    } catch (error) {
      Logger.warn("Database connection failed:", (error as Error).message);
    }

    // Create Oak application
    const app = new Application();
    const router = new Router();

    // CORS middleware
    app.use(async (ctx: any, next: any) => {
      ctx.response.headers.set("Access-Control-Allow-Origin", "*");
      ctx.response.headers.set(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, PATCH, OPTIONS"
      );
      ctx.response.headers.set(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization, Accept, X-Requested-With"
      );
      ctx.response.headers.set("Access-Control-Max-Age", "3600");

      if (ctx.request.method === "OPTIONS") {
        ctx.response.status = 200;
        ctx.response.body = "";
        return;
      }

      await next();
    });

    // Error handling middleware
    app.use(async (ctx: any, next: any) => {
      try {
        await next();
      } catch (err) {
        console.error("Error:", err);
        ctx.response.status = 500;
        ctx.response.body = {
          error: (err as Error).message || "Internal Server Error",
          status: 500,
        };
      }
    });

    // Health check
    router.get("/app-alquiler/health", (ctx: any) => {
      ctx.response.body = {
        status: "OK",
        timestamp: new Date().toISOString(),
        database: db ? "connected" : "not available"
      };
    });

    // Basic Auth routes (demo)
    router.post("/app-alquiler/auth/login", async (ctx: any) => {
      try {
        console.log("🔐 POST /auth/login - Solicitud de login recibida");

        // Mock login for demo - accept any credentials
        const mockUser = {
          id: 1,
          first_name: "Admin",
          last_name: "Demo",
          email: "admin@alquilerzarza.com",
          user_type: "admin"
        };

        // Mock JWT token
        const mockToken = "demo-jwt-token-12345";

        console.log("✅ Login exitoso para usuario demo");

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          data: {
            user: mockUser,
            token: mockToken
          },
          message: "Login exitoso (demo)",
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("❌ Error en login:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: "Error interno del servidor en login",
          error: error instanceof Error ? error.message : "Error desconocido",
          timestamp: new Date().toISOString(),
        };
      }
    });

    router.post("/app-alquiler/auth/register", async (ctx: any) => {
      try {
        console.log("📝 POST /auth/register - Solicitud de registro recibida");
        
        ctx.response.status = 201;
        ctx.response.body = {
          success: true,
          message: "Funcionalidad de registro próximamente disponible",
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error("❌ Error en registro:", error);
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: "Error interno del servidor en registro",
          error: error instanceof Error ? error.message : "Error desconocido",
          timestamp: new Date().toISOString(),
        };
      }
    });

if (userRepository && profileRepository) {
  createUserRoutes(router,userRepository,profileRepository);
}
    
    // Profile routes
    if (profileRepository) {
      // GET /app-alquiler/profiles - Obtener todos los perfiles activos
      router.get("/app-alquiler/profiles", async (ctx: any) => {
        try {
          console.log("📋 GET /profiles - Solicitando lista de perfiles activos...");
          
          const profiles = await (profileRepository as any).findAllActive();
          
          console.log(`✅ Devolviendo ${profiles.length} perfiles activos`);
          
          ctx.response.status = 200;
          ctx.response.body = {
            success: true,
            data: profiles,
            message: "Perfiles obtenidos correctamente",
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error("❌ Error al obtener perfiles:", error);
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: "Error interno del servidor al obtener perfiles",
            error: error instanceof Error ? error.message : "Error desconocido",
            timestamp: new Date().toISOString(),
          };
        }
      });
    }

        // catastro routes
    if (catastroRepository) {
 // GET /app-alquiler/users
      router.get("/app-alquiler/catastro", async (ctx: any) => {
        try {
          console.log("📋 GET /catastro - Solicitando lista de catastro desde base de datos...");
          
          const catastro = await (catastroRepository as any).findAll();
          
          console.log(`✅ Devolviendo ${catastro.length} catastro  desde base de datos`);
          
          ctx.response.status = 200;
          ctx.response.body = {
            success: true,
            data: catastro,
            message: "Catastro obtenido correctamente desde base de datos",
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error("❌ Error al obtener usuarios:", error);
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: "Error interno del servidor al obtener usuarios",
            error: error instanceof Error ? error.message : "Error desconocido",
            timestamp: new Date().toISOString(),
          };
        }
      });
    }
    else{
        router.get("/app-alquiler/catastros", (ctx: any) => {
        ctx.response.status = 503;
        ctx.response.body = {
          success: false,
          message: "Base de datos no disponible",
          timestamp: new Date().toISOString(),
        };
      });
    
    }


    // Add routes to app
    app.use(router.routes());
    app.use(router.allowedMethods());

    // Start server
  let port = parseInt(Deno.env.get("PORT")?.trim() || "3001");
  let hostname = (Deno.env.get("HOST") || "localhost").trim();


    await app.listen({ port, hostname });

  } catch (error) {
    Logger.error("Failed to start server:", error);
    console.error("Full error:", error);
    Deno.exit(1);
  }
}

// Run the application
if (import.meta.main) {
  main();
}