// User Management Routes - App Alquiler Backend
import { Router, UserRepository } from "../../mod.ts";

export function createUserRoutes(userRepository: UserRepository): Router {
  
  const router = new Router();

 router.get("/app-alquiler/users", async (ctx: any) => {
        try {
          
          const users = await (userRepository as any).findAllWithProfiles();
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
          let userData;
          const bodyText = await ctx.request.body.text();           
          userData = JSON.parse(bodyText);
           console.log(`📝 userData`,userData);
          if (!userData) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: `Datos de usuario inválidos o vacíos. Tipo de body: ${bodyText}`,
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Validar 
          const validar = await userRepository.Validar(ctx,undefined,userData);    
          if(!validar){
            return;
          }
          
          // Crear el usuario en la base de datos
          console.log(`📝 Creando usuario en la base de datos...`);
          const newUser = await userRepository.createUser(userData);
          if (!newUser) {
            ctx.response.status = 500;
            ctx.response.body = {
              success: false,
              message: "Error al crear usuario en la base de datos",
              timestamp: new Date().toISOString(),
            };
            return;
          }

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


       // PUT /app-alquiler/users/:id - Actualizar usuario (NUEVO - SIMPLE)
      router.put("/app-alquiler/users/:id", async (ctx: any) => {
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

          const bodyText = await ctx.request.body.text();
          let updateData = JSON.parse(bodyText);
     
   // Validar 
          const validar = await userRepository.Validar(ctx,id,updateData);    
          if(!validar){
            return;
          }

          // Buscar usuario existente
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
          const updatedUser = userRepository.updateUser(id, updateData);
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
      
        return router;

}