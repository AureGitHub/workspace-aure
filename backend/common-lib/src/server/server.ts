// Server Module - Oak Server Configuration
import { Application, Router } from "@oak/oak";

export interface ServerConfig {
  port?: number;
  hostname?: string;
  cors?: boolean;
  logging?: boolean;
}

export interface RouteHandler {
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  path: string;
  handler: (ctx: any) => Promise<void> | void;
  middleware?: Array<(ctx: any, next: () => Promise<void>) => Promise<void>>;
}

export class CommonServer {
  private app: Application;
  private router: Router;
  private config: ServerConfig;

  constructor(config: ServerConfig = {}) {
    this.app = new Application();
    this.router = new Router();
    this.config = {
      port: 3000,
      hostname: "localhost",
      cors: true,
      logging: true,
      ...config,
    };

    this.setupMiddleware();
  }

  private setupMiddleware() {
    // Error handling middleware
    this.app.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        ctx.response.status = (err as any).status || 500;
        ctx.response.body = {
          error: (err as Error).message || "Internal Server Error",
          status: ctx.response.status,
        };
        
        if (this.config.logging) {
          console.error(`Error: ${(err as Error).message}`, err);
        }
      }
    });

    // CORS middleware
    if (this.config.cors) {
      this.app.use(async (ctx, next) => {
        ctx.response.headers.set("Access-Control-Allow-Origin", "*");
        ctx.response.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, DELETE, PATCH, OPTIONS"
        );
        ctx.response.headers.set(
          "Access-Control-Allow-Headers",
          "Content-Type, Authorization"
        );

        if (ctx.request.method === "OPTIONS") {
          ctx.response.status = 200;
          return;
        }

        await next();
      });
    }

    // JSON Body Parser middleware - for POST, PUT, PATCH requests
    this.app.use(async (ctx, next) => {
      if (ctx.request.hasBody && ["POST", "PUT", "PATCH"].includes(ctx.request.method)) {
        const contentType = ctx.request.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          try {
            // In Oak 17, ctx.request.body is a Body instance, not a function
            const body = await ctx.request.body.json();
            // Store the parsed body in context for controllers to access
            ctx.state.parsedBody = body;
          } catch (error) {
            console.error("Error parsing JSON body:", error);
            ctx.response.status = 400;
            ctx.response.body = { error: "Invalid JSON in request body" };
            return;
          }
        }
      }
      await next();
    });

    // Logging middleware
    if (this.config.logging) {
      this.app.use(async (ctx, next) => {
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        console.log(`${ctx.request.method} ${ctx.request.url} - ${ms}ms`);
      });
    }
  }

  // Add routes
  addRoutes(routes: RouteHandler[]) {
    routes.forEach((route) => {
      const { method, path, handler, middleware = [] } = route;
      
      switch (method) {
        case "GET":
          this.router.get(path, ...middleware, handler);
          break;
        case "POST":
          this.router.post(path, ...middleware, handler);
          break;
        case "PUT":
          this.router.put(path, ...middleware, handler);
          break;
        case "DELETE":
          this.router.delete(path, ...middleware, handler);
          break;
        case "PATCH":
          this.router.patch(path, ...middleware, handler);
          break;
      }
    });

    this.app.use(this.router.routes());
    this.app.use(this.router.allowedMethods());
  }

  // Add middleware globally
  addMiddleware(middleware: (ctx: any, next: () => Promise<void>) => Promise<void>) {
    this.app.use(middleware);
  }

  // Add router with optional prefix
  addRouter(router: Router, prefix?: string) {
    if (prefix) {
      // Create a new router with the prefix
      const prefixedRouter = new Router();
      // Mount the router under the prefix
      prefixedRouter.use(prefix, router.routes(), router.allowedMethods());
      this.app.use(prefixedRouter.routes());
      this.app.use(prefixedRouter.allowedMethods());
    } else {
      this.app.use(router.routes());
      this.app.use(router.allowedMethods());
    }
  }

  // Health check endpoint
  addHealthCheck(path: string = "/health") {
    this.router.get(path, (ctx) => {
      ctx.response.body = {
        name: "App Alquiler Backend API",
        version: "1.0.0",
        description: "Backend API para la aplicación de alquiler",
        status: "OK",
        timestamp: new Date().toISOString(),
        uptime: Math.floor(performance.now() / 1000), // Segundos desde que inició
        database_status: "connected",
        endpoints: {
          health: "/health",
          database_health: "/health/db",
          auth: {
            register: "POST /auth/register",
            login: "POST /auth/login",
            profile: "GET /auth/profile",
            update_profile: "PUT /auth/profile",
            change_password: "PUT /auth/change-password",
          }
        }
      };
    });
  }

  // Start server
  async start(): Promise<void> {
    const { port, hostname } = this.config;
    
    if (this.config.logging) {
      console.log(`Server starting on http://${hostname}:${port}`);
    }

    await this.app.listen({ port, hostname });
  }
}

// Helper function to create a server instance
export function createServer(config?: ServerConfig): CommonServer {
  return new CommonServer(config);
}