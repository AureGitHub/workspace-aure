// User Management Routes - App Alquiler Backend
import { Router } from "@oak/oak";
import { UserRepository } from "../models/user.repository.ts";

export function createUserRoutes(userRepository: UserRepository): Router {
  const router = new Router();

  // GET /users - Listar todos los usuarios (simplificado para demo)
  router.get("/users", async (ctx: any) => {
    try {
      // Por ahora, devolver usuarios de ejemplo hasta que se resuelvan los problemas del repository
      const mockUsers = [
        {
          id: 1,
          first_name: "Admin",
          last_name: "Sistema",
          email: "admin@alquilerzarza.com",
          user_type: "admin",
          created_at: "2024-01-01T00:00:00Z"
        },
        {
          id: 2,
          first_name: "Felipe",
          last_name: "Propietario",
          email: "felipe@alquilerzarza.com",
          user_type: "owner",
          created_at: "2024-01-02T00:00:00Z"
        },
        {
          id: 3,
          first_name: "María",
          last_name: "Inquilina",
          email: "maria@email.com",
          user_type: "tenant",
          created_at: "2024-01-03T00:00:00Z"
        }
      ];
      
      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: mockUsers,
        message: "Usuarios obtenidos correctamente",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error interno del servidor al obtener usuarios",
        error: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      };
    }
  });

  // GET /users/:id - Obtener un usuario específico (demo)
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

      // Mock user para demo
      const mockUser = {
        id: id,
        first_name: "Usuario",
        last_name: "Demo",
        email: `user${id}@alquilerzarza.com`,
        user_type: "tenant",
        created_at: "2024-01-01T00:00:00Z"
      };

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: mockUser,
        message: "Usuario obtenido correctamente",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error al obtener usuario:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error interno del servidor al obtener usuario",
        error: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      };
    }
  });

  // POST /users - Crear nuevo usuario
  router.post("/users", async (ctx: any) => {
    try {
      const body = await ctx.request.body({ type: "json" }).value;
      
      // Validar campos requeridos
      const { first_name, last_name, email, password, user_type, username } = body;
      
      if (!first_name || !last_name || !email || !password || !user_type || !username) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: "Todos los campos son requeridos: first_name, last_name, email, password, user_type, username",
          timestamp: new Date().toISOString(),
        };
        return;
      }

      // Validar tipo de usuario
      if (!['admin', 'owner', 'tenant'].includes(user_type)) {
        ctx.response.status = 400;
        ctx.response.body = {
          success: false,
          message: "Tipo de usuario inválido. Debe ser: admin, owner, o tenant",
          timestamp: new Date().toISOString(),
        };
        return;
      }

      // Verificar si el email ya existe
      const existingUser = await userRepository.findByEmail(email);
      if (existingUser) {
        ctx.response.status = 409;
        ctx.response.body = {
          success: false,
          message: "Ya existe un usuario con este email",
          timestamp: new Date().toISOString(),
        };
        return;
      }

      // Crear el usuario usando el método disponible
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      const newUser = await userRepository.createUser({
        username,
        first_name,
        last_name,
        email,
        password,
        user_type
      }, passwordHash);

      ctx.response.status = 201;
      ctx.response.body = {
        success: true,
        data: newUser,
        message: "Usuario creado correctamente",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Error al crear usuario:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error interno del servidor al crear usuario",
        error: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      };
    }
  });

  // PUT /users/:id - Actualizar usuario (placeholder)
  router.put("/users/:id", async (ctx: any) => {
    ctx.response.status = 501;
    ctx.response.body = {
      success: false,
      message: "Funcionalidad de actualización de usuarios próximamente disponible",
      timestamp: new Date().toISOString(),
    };
  });

  // DELETE /users/:id - Eliminar usuario (placeholder)
  router.delete("/users/:id", async (ctx: any) => {
    ctx.response.status = 501;
    ctx.response.body = {
      success: false,
      message: "Funcionalidad de eliminación de usuarios próximamente disponible",
      timestamp: new Date().toISOString(),
    };
  });

  return router;
}