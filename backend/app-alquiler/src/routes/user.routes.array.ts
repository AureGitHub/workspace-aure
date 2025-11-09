// User Management Routes - Database Connected
import { UserRepository } from "../models/user.repository.ts";

export function createUserRoutes(userRepository?: UserRepository) {
  console.log("📁 Configurando rutas de usuarios con base de datos...");
  
  return [
    {
      method: "GET" as const,
      path: "/users",
      handler: async (ctx: any) => {
        try {
          console.log("📋 GET /users - Solicitando lista de usuarios desde base de datos...");
          
          if (!userRepository) {
            throw new Error("Base de datos no disponible");
          }
          
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
      }
    },
    {
      method: "GET" as const,
      path: "/users/:id",
      handler: async (ctx: any) => {
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

          if (!userRepository) {
            throw new Error("Base de datos no disponible");
          }

          // Obtener usuario de la base de datos usando el método heredado
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
      }
    },
    {
      method: "POST" as const,
      path: "/users",
      handler: async (ctx: any) => {
        try {
          console.log("📝 POST /users - Solicitud de crear usuario recibida");
          
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
      }
    }
  ];
}