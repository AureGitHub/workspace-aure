// Main Application - App Alquiler Backend
import { Application, Router } from "https://deno.land/x/oak@v17.1.0/mod.ts";
import { createDatabaseService } from "@common-lib/database/mod.ts";
import { loadConfig, Logger } from "@common-lib/utils/mod.ts";
import { UserRepository } from "./models/user.repository.ts";

import { CatastroRepository } from "./models/catastro.repository.ts";
import { createUserRoutes } from "./routes/user.routes.ts";
import { ArriendoRepository } from "./models/arriendo.repository.ts";
import { createArriendoRoutes } from "./routes/arriendo.routes.ts";
import { AuthenticationService } from "./services/auth.service.ts";
import { createAuthRoutes } from "./routes/auth.routes.ts";
import { createCatastroRoutes } from "./routes/catastro.routes.ts";
import { createListasRoutes } from "./routes/listas.routes.ts";
import { ListasRepository } from "./models/listas.repository.ts";

async function main() {
  try {
    // Load environment configuration
    await loadConfig();
    
    Logger.info("Starting App Alquiler Backend...");

    // Initialize database
    let db = null;
    let userRepository = null;
    let listasRepository = null;    
    let catastroRepository = null;
    let arriendoRepository = null;
    let authService= null;
    
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
      listasRepository = new ListasRepository(db);
      catastroRepository = new CatastroRepository(db);
      arriendoRepository = new ArriendoRepository(db);
      authService = new AuthenticationService(userRepository);
      

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

if(authService){
	 const authRouter = createAuthRoutes(authService);
  router.use(authRouter.routes(), authRouter.allowedMethods());
}

if (userRepository && listasRepository) {
  const userRouter = createUserRoutes(userRepository);
  router.use(userRouter.routes(), userRouter.allowedMethods());
  
}

if (arriendoRepository) {
  const arriendoRouter = createArriendoRoutes(arriendoRepository);
  router.use(arriendoRouter.routes(), arriendoRouter.allowedMethods());
  
}



    
    // Profile routes
    if (listasRepository) {
      // GET /app-alquiler/profiles - Obtener todos los perfiles activos
     const listasRouter = createListasRoutes(listasRepository);
    router.use(listasRouter.routes(), listasRouter.allowedMethods());
    }

        // catastro routes
    if (catastroRepository) {
 // GET /app-alquiler/users
  const catastroRouter = createCatastroRoutes(catastroRepository);
  router.use(catastroRouter.routes(), catastroRouter.allowedMethods());
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