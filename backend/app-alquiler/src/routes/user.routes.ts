// User Management Routes - App Alquiler Backend
import { ProfileRepository } from "../models/profile.repository.ts";
import { UserRepository } from "../models/user.repository.ts";

export function createUserRoutes(router: any, userRepository: UserRepository, profileRepository : ProfileRepository) {
  

 router.get("/app-alquiler/users", async (ctx: any) => {
        try {
          console.log("📋 GET /users - Solicitando lista de usuarios con perfiles desde base de datos...");
          
          const users = await (userRepository as any).findAllWithProfiles();
          
          console.log(`✅ Devolviendo ${users.length} usuarios con perfiles desde base de datos`);
          
          ctx.response.status = 200;
          ctx.response.body = {
            success: true,
            data: users,
            message: "Usuarios con perfiles obtenidos correctamente desde base de datos",
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

          console.log(`👤 GET /users/${id} - Solicitando usuario con perfil con ID: ${id}`);

          const user = await (userRepository as any).findByIdWithProfile(id);

          if (!user) {
            ctx.response.status = 404;
            ctx.response.body = {
              success: false,
              message: "Usuario no encontrado",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          console.log(`✅ Usuario encontrado: ${user.email} (${user.profile_description})`);

          ctx.response.status = 200;
          ctx.response.body = {
            success: true,
            data: user,
            message: "Usuario con perfil obtenido correctamente desde base de datos",
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
          const { username, first_name, last_name, email, password, profile_id } = userData;
          
          if (!username || !first_name || !last_name || !email || !password || !profile_id) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "Todos los campos son obligatorios (username, first_name, last_name, email, password, profile_id)",
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

          // Validar profile_id
          const profileIdNum = parseInt(profile_id);
          if (isNaN(profileIdNum) || profileIdNum < 1) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "profile_id debe ser un número válido",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Verificar que el profile_id existe
          console.log(`🔍 Verificando si profile_id ${profileIdNum} existe...`);
          const profileExists = await (profileRepository as any).findById(profileIdNum);
          if (!profileExists) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "El profile_id especificado no existe",
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
            profile_id: profileIdNum
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

}