// Main Application - App Alquiler Backend
import { Application, Router } from "https://deno.land/x/oak@v17.1.0/mod.ts";
import { createDatabaseService } from "@common-lib/database/mod.ts";
import { loadConfig, Logger } from "@common-lib/utils/mod.ts";
import { UserRepository } from "./models/user.repository.ts";

async function main() {
  try {
    // Load environment configuration
    await loadConfig();
    
    Logger.info("Starting App Alquiler Backend...");

    // Initialize database
    let db = null;
    let userRepository = null;
    
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

    // User routes
    if (userRepository) {
      // GET /app-alquiler/users
      router.get("/app-alquiler/users", async (ctx: any) => {
        try {
          console.log("📋 GET /users - Solicitando lista de usuarios desde base de datos...");
          
          const users = await (userRepository as any).findAll();
          
          console.log(`✅ Devolviendo ${users.length} usuarios desde base de datos`);
          
          ctx.response.status = 200;
          ctx.response.body = {
            success: true,
            data: users,
            message: "Usuarios obtenidos correctamente desde base de datos",
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

      // GET /app-alquiler/users/:id
      router.get("/app-alquiler/users/:id", async (ctx: any) => {
        try {
          const id = parseInt(ctx.params?.id);
          
          if (!id || isNaN(id)) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "ID de usuario inválido",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          console.log(`👤 GET /users/${id} - Solicitando usuario con ID: ${id}`);

          const user = await (userRepository as any).findById(id);

          if (!user) {
            ctx.response.status = 404;
            ctx.response.body = {
              success: false,
              message: "Usuario no encontrado",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          console.log(`✅ Usuario encontrado: ${user.email}`);

          ctx.response.status = 200;
          ctx.response.body = {
            success: true,
            data: user,
            message: "Usuario obtenido correctamente desde base de datos",
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error("❌ Error al obtener usuario:", error);
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: "Error interno del servidor al obtener usuario",
            error: error instanceof Error ? error.message : "Error desconocido",
            timestamp: new Date().toISOString(),
          };
        }
      });

      // POST /app-alquiler/users - Crear nuevo usuario
      router.post("/app-alquiler/users", async (ctx: any) => {
        try {
          console.log("📝 POST /users - Solicitud de crear usuario recibida");
          
          // Obtener datos del body con múltiples métodos (igual que PUT)
          const body = ctx.request.body;
          const bodyType = body.type();
          console.log("🔍 Body type:", bodyType);
          
          let userData;
          
          try {
            if (bodyType === "json") {
              userData = await body.value;
              console.log("📝 Método 1 - body.value:", userData);
            }
            
            if (!userData) {
              console.log("📝 Método 1 falló, intentando método 2...");
              const bodyText = await ctx.request.body.text();
              console.log("📝 Método 2 - body.text():", bodyText);
              
              if (bodyText) {
                try {
                  userData = JSON.parse(bodyText);
                  console.log("📝 Método 2 exitoso - JSON parseado:", userData);
                } catch (parseError) {
                  console.log("📝 Error parseando JSON:", parseError);
                }
              }
            }
            
            if (!userData) {
              console.log("📝 Método 2 falló, intentando método 3...");
              const bodyArrayBuffer = await ctx.request.body.arrayBuffer();
              const bodyString = new TextDecoder().decode(bodyArrayBuffer);
              console.log("📝 Método 3 - ArrayBuffer como string:", bodyString);
              
              if (bodyString) {
                try {
                  userData = JSON.parse(bodyString);
                  console.log("📝 Método 3 exitoso - JSON parseado:", userData);
                } catch (parseError) {
                  console.log("📝 Error parseando JSON método 3:", parseError);
                }
              }
            }
            
          } catch (bodyError) {
            console.log("📝 Error general obteniendo body:", bodyError);
          }
          
          console.log("📝 UserData final:", userData);
          
          if (!userData) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: `Datos de usuario inválidos o vacíos. Tipo de body: ${bodyType}`,
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Validar campos obligatorios
          const { username, first_name, last_name, email, password, user_type } = userData;
          
          if (!username || !first_name || !last_name || !email || !password || !user_type) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "Todos los campos son obligatorios (username, first_name, last_name, email, password, user_type)",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Validar formato de email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "Formato de email inválido",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Validar tipo de usuario
          const validUserTypes = ['admin', 'owner', 'tenant'];
          if (!validUserTypes.includes(user_type)) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "Tipo de usuario inválido. Debe ser: admin, owner o tenant",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Verificar si el email ya existe
          console.log(`🔍 Verificando si email ${email} ya existe...`);
          const emailExists = await (userRepository as any).emailExists(email);
          if (emailExists) {
            ctx.response.status = 409;
            ctx.response.body = {
              success: false,
              message: "El email ya está registrado",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Verificar si el username ya existe
          console.log(`🔍 Verificando si username ${username} ya existe...`);
          const usernameExists = await (userRepository as any).usernameExists(username);
          if (usernameExists) {
            ctx.response.status = 409;
            ctx.response.body = {
              success: false,
              message: "El nombre de usuario ya está registrado",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Crear el usuario en la base de datos
          console.log(`📝 Creando usuario en la base de datos...`);
          const newUser = await (userRepository as any).createUserSimple({
            username: username.trim(),
            first_name: first_name.trim(),
            last_name: last_name.trim(),
            email: email.trim().toLowerCase(),
            password: password, // Se hará hash automáticamente en createUserSimple
            user_type: user_type
          });

          if (!newUser) {
            ctx.response.status = 500;
            ctx.response.body = {
              success: false,
              message: "Error al crear usuario en la base de datos",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          console.log(`✅ Usuario creado exitosamente con ID: ${newUser.id}`);
          
          ctx.response.status = 201;
          ctx.response.body = {
            success: true,
            data: newUser,
            message: "Usuario creado exitosamente",
            timestamp: new Date().toISOString(),
          };
          
        } catch (error) {
          console.error("❌ Error al crear usuario:", error);
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: "Error interno del servidor al crear usuario",
            error: error instanceof Error ? error.message : "Error desconocido",
            timestamp: new Date().toISOString(),
          };
        }
      });

      // PUT /app-alquiler/users/:id - Actualizar usuario (TEMPORAL - COMENTADO)
      /*router.put("/app-alquiler/users/:id", async (ctx: any) => {
        try {
          console.log(`🚀 PUT ENDPOINT ALCANZADO - inicio del handler`);
          
          const id = parseInt(ctx.params?.id);
          console.log(`🚀 ID parseado:`, id, `tipo:`, typeof id);
          
          if (!id || isNaN(id)) {
            console.log(`❌ ID inválido, retornando error`);
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "ID de usuario inválido",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          console.log(`✏️ PUT /users/${id} - Solicitud de actualizar usuario ID: ${id}`);

          // Debug: Imprimir información del body
          const body = ctx.request.body;
          const bodyType = body.type(); // Llamar la función type()
          console.log("🔍 Debug - body type:", bodyType);
          console.log("🔍 Debug - request headers:", ctx.request.headers);
          console.log("🔍 Debug - content-type:", ctx.request.headers.get("content-type"));

          // Intentar obtener los datos independientemente del tipo
          let updateData;
          
          if (bodyType === "json") {
            updateData = await body.value;
          } else if (bodyType === "text") {
            // Intentar parsear como JSON si viene como texto
            const textData = await body.value;
            console.log("🔍 Debug - text data:", textData);
            try {
              updateData = JSON.parse(textData);
            } catch (e) {
              ctx.response.status = 400;
              ctx.response.body = {
                success: false,
                message: "Los datos no son JSON válido",
                timestamp: new Date().toISOString(),
              };
              return;
            }
          } else {
            console.log("❌ Tipo de body no soportado:", bodyType);
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: `Formato de datos inválido, recibido: ${bodyType}, se esperaba JSON`,
              timestamp: new Date().toISOString(),
            };
            return;
          }

          console.log("📝 Datos para actualizar:", updateData);

          // Verificar que el usuario existe
          console.log(`🔍 Buscando usuario con ID: ${id} en la base de datos...`);
          console.log(`🔍 Tipo de ID:`, typeof id, `valor:`, id);
          
          let existingUser;
          try {
            existingUser = await (userRepository as any).findById(id);
            console.log(`🔍 Resultado de búsqueda:`, existingUser);
            console.log(`🔍 Tipo de resultado:`, typeof existingUser);
            console.log(`🔍 Es null:`, existingUser === null);
            console.log(`🔍 Es undefined:`, existingUser === undefined);
          } catch (findError) {
            console.error(`❌ Error en findById:`, findError);
            ctx.response.status = 500;
            ctx.response.body = {
              success: false,
              message: "Error al buscar usuario en la base de datos",
              error: findError instanceof Error ? findError.message : "Error desconocido",
              timestamp: new Date().toISOString(),
            };
            return;
          }
          
          if (!existingUser) {
            console.log(`❌ Usuario con ID ${id} no encontrado en la base de datos`);
            ctx.response.status = 404;
            ctx.response.body = {
              success: false,
              message: "Usuario no encontrado",
              timestamp: new Date().toISOString(),
            };
            return;
          }
          
          console.log(`✅ Usuario encontrado: ${existingUser?.email || 'Email no disponible'}`);

          // Validar datos básicos
          if (updateData.email && typeof updateData.email !== 'string') {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "El email debe ser una cadena de texto",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          if (updateData.user_type && !['admin', 'owner', 'tenant'].includes(updateData.user_type)) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "Tipo de usuario inválido. Debe ser: admin, owner o tenant",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Verificar que el email no esté en uso por otro usuario
          if (updateData.email && existingUser && existingUser.email && updateData.email !== existingUser.email) {
            console.log(`🔍 Verificando si email ${updateData.email} ya existe...`);
            const emailExists = await (userRepository as any).emailExists(updateData.email, id);
            if (emailExists) {
              ctx.response.status = 409;
              ctx.response.body = {
                success: false,
                message: "El email ya está en uso por otro usuario",
                timestamp: new Date().toISOString(),
              };
              return;
            }
          }

          // Actualizar el usuario
          const updatedUser = await (userRepository as any).updateUser(id, updateData);
          
          if (!updatedUser) {
            ctx.response.status = 500;
            ctx.response.body = {
              success: false,
              message: "Error al actualizar usuario en la base de datos",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          console.log(`✅ Usuario con ID ${id} actualizado exitosamente`);

          ctx.response.status = 200;
          ctx.response.body = {
            success: true,
            data: updatedUser,
            message: `Usuario actualizado exitosamente`,
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error("❌ Error al actualizar usuario:", error);
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: "Error interno del servidor al actualizar usuario",
            error: error instanceof Error ? error.message : "Error desconocido",
            timestamp: new Date().toISOString(),
          };
        }
      });*/

      // PUT /app-alquiler/users/:id - Actualizar usuario (NUEVO - SIMPLE)
      router.put("/app-alquiler/users/:id", async (ctx: any) => {
        try {
          console.log(`🚀 PUT NUEVO - ALCANZADO`);
          
          const id = parseInt(ctx.params?.id);
          console.log(`🚀 ID:`, id);
          
          if (!id || isNaN(id)) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "ID de usuario inválido",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          console.log(`🚀 Obteniendo body...`);
          const body = ctx.request.body;
          const bodyType = body.type();
          console.log(`🚀 BodyType:`, bodyType);
          
          let updateData;
          
          // Intentar múltiples métodos para obtener el body
          try {
            if (bodyType === "json") {
              updateData = await body.value;
              console.log(`🚀 Método 1 - body.value:`, updateData);
            }
            
            // Si el método 1 falla, intentar con text y parsear manualmente
            if (!updateData) {
              console.log(`🚀 Método 1 falló, intentando método 2...`);
              const bodyText = await ctx.request.body.text();
              console.log(`🚀 Método 2 - body.text():`, bodyText);
              
              if (bodyText) {
                try {
                  updateData = JSON.parse(bodyText);
                  console.log(`🚀 Método 2 exitoso - JSON parseado:`, updateData);
                } catch (parseError) {
                  console.log(`🚀 Error parseando JSON:`, parseError);
                }
              }
            }
            
            // Si ambos métodos fallan, intentar con el body raw
            if (!updateData) {
              console.log(`🚀 Método 2 falló, intentando método 3...`);
              const bodyArrayBuffer = await ctx.request.body.arrayBuffer();
              const bodyString = new TextDecoder().decode(bodyArrayBuffer);
              console.log(`🚀 Método 3 - ArrayBuffer como string:`, bodyString);
              
              if (bodyString) {
                try {
                  updateData = JSON.parse(bodyString);
                  console.log(`🚀 Método 3 exitoso - JSON parseado:`, updateData);
                } catch (parseError) {
                  console.log(`🚀 Error parseando JSON método 3:`, parseError);
                }
              }
            }
            
          } catch (bodyError) {
            console.log(`🚀 Error general obteniendo body:`, bodyError);
          }
          
          console.log(`🚀 UpdateData:`, updateData);
          
          if (!updateData) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: `Datos de actualización inválidos o vacíos. Tipo de body: ${bodyType}`,
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Exactamente igual que el GET que funciona
          const user = await (userRepository as any).findById(id);
          console.log(`🚀 Usuario encontrado:`, !!user);

          if (!user) {
            ctx.response.status = 404;
            ctx.response.body = {
              success: false,
              message: "Usuario no encontrado",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Actualizar usuario
          const updatedUser = await (userRepository as any).update(id, updateData);
          console.log(`🚀 Usuario actualizado:`, !!updatedUser);

          ctx.response.status = 200;
          ctx.response.body = {
            success: true,
            data: updatedUser,
            message: "Usuario actualizado correctamente",
            timestamp: new Date().toISOString(),
          };

        } catch (error) {
          console.error("🚀 Error en PUT NUEVO:", error);
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: "Error interno del servidor",
            error: error instanceof Error ? error.message : "Error desconocido",
            timestamp: new Date().toISOString(),
          };
        }
      });

      // DELETE /app-alquiler/users/:id - Eliminar usuario
      router.delete("/app-alquiler/users/:id", async (ctx: any) => {
        try {
          const id = parseInt(ctx.params?.id);
          
          if (!id || isNaN(id)) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "ID de usuario inválido",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          console.log(`🗑️ DELETE /users/${id} - Solicitud de eliminar usuario ID: ${id}`);

          // Verificar si el usuario existe antes de eliminarlo
          const existingUser = await (userRepository as any).findById(id);
          if (!existingUser) {
            ctx.response.status = 404;
            ctx.response.body = {
              success: false,
              message: "Usuario no encontrado",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Eliminar el usuario de la base de datos
          const deleted = await (userRepository as any).deleteUser(id);
          
          if (!deleted) {
            ctx.response.status = 500;
            ctx.response.body = {
              success: false,
              message: "Error al eliminar usuario de la base de datos",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          console.log(`✅ Usuario con ID ${id} eliminado exitosamente de la base de datos`);

          ctx.response.status = 200;
          ctx.response.body = {
            success: true,
            message: `Usuario con ID ${id} eliminado exitosamente`,
            data: { id, email: existingUser?.email || 'Email no disponible' },
            timestamp: new Date().toISOString(),
          };
        } catch (error) {
          console.error("❌ Error al eliminar usuario:", error);
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: "Error interno del servidor al eliminar usuario",
            error: error instanceof Error ? error.message : "Error desconocido",
            timestamp: new Date().toISOString(),
          };
        }
      });
    } else {
      // Fallback route when no database
      router.get("/app-alquiler/users", (ctx: any) => {
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
    const port = parseInt(Deno.env.get("PORT") || "3001");
    const hostname = Deno.env.get("HOST") || "localhost";
    
    console.log(`🚀 Server starting on http://${hostname}:${port}`);
    Logger.info(`Server will start on http://${hostname}:${port}`);
    
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