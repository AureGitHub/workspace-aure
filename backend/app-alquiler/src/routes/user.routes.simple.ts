// User Management Routes - Simplified Demo Version
import { Application, Router } from "https://deno.land/x/oak@v17.1.0/mod.ts";
import { UserRepository } from "../models/user.repository.ts";

export function createUserRoutes(userRepository: UserRepository): Router {
  const router = new Router();

  // GET /users - Listar todos los usuarios desde base de datos
  router.get("/users", async (ctx: any) => {
    try {
      console.log("📋 Solicitando lista de usuarios desde base de datos...");
      
      // Obtener usuarios de la base de datos
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

  // GET /users/:id - Obtener un usuario específico
  router.get("/users/:id", async (ctx: any) => {
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

      console.log(`👤 Solicitando usuario con ID: ${id}`);

      // Obtener usuario de la base de datos
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

  // POST /users - Crear nuevo usuario (placeholder)
  router.post("/users", async (ctx: any) => {
    try {
      console.log("📝 Solicitud de crear usuario recibida");
      
      ctx.response.status = 201;
      ctx.response.body = {
        success: true,
        message: "Funcionalidad de crear usuario próximamente disponible",
        timestamp: new Date().toISOString(),
      };
      
      console.log("✅ Respuesta de crear usuario enviada");
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

  // PUT /users/:id - Actualizar usuario (versión simplificada)
  router.put("/users/:id", async (ctx: any) => {
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

      console.log(`✏️ PUT /users/${id} - VERSIÓN SIMPLIFICADA`);

      // Obtener datos del body
      const body = ctx.request.body;
      const bodyType = body.type();
      
      let updateData;
      if (bodyType === "json") {
        updateData = await body.value;
      } else {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: `Formato no soportado: ${bodyType}`,
          timestamp: new Date().toISOString(),
        };
        return;
      }

      console.log("📝 Datos recibidos:", updateData);

      // Verificar que el usuario existe (copiando exactamente del GET que funciona)
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

      // Usar directamente el método update del BaseRepository para simplicidad
      const updatedUser = await (userRepository as any).update(id, updateData);
      
      if (!updatedUser) {
        ctx.response.status = 500;
        ctx.response.body = {
          success: false,
          message: "Error al actualizar usuario",
          timestamp: new Date().toISOString(),
        };
        return;
      }

      console.log(`✅ Usuario actualizado exitosamente`);

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: updatedUser,
        message: `Usuario actualizado exitosamente`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Error en PUT:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      };
    }
  });

  // DELETE /users/:id - Eliminar usuario
  router.delete("/users/:id", async (ctx: any) => {
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
        data: { id, email: existingUser.email },
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

  console.log("🔧 Rutas de usuarios configuradas correctamente");
  return router;
}