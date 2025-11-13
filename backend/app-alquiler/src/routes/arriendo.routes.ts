import { Router } from "https://deno.land/x/oak@v17.1.0/mod.ts";
import { ArriendoRepository } from "../models/arriendo.repository.ts";

export function createArriendoRoutes(arriendoRepository: ArriendoRepository): Router {
  const router = new Router();

  // GET /app-alquiler/arriendos
  router.get("/app-alquiler/arriendos", async (ctx: any) => {
    const arriendos = await arriendoRepository.findAll();
    ctx.response.body = { success: true, data: arriendos };
  });

  // GET /app-alquiler/arriendos/:id
  router.get("/app-alquiler/arriendos/:id", async (ctx: any) => {
    const id = Number(ctx.params.id);
    console.log('id param',id);
    const arriendo = await arriendoRepository.findById(id);
    if (arriendo) {
      ctx.response.body = { success: true, data: arriendo };
    } else {
      ctx.response.status = 404;
      ctx.response.body = { success: false, message: "Arriendo no encontrado" };
    }
  });




    router.post("/app-alquiler/arriendos", async (ctx: any) => {
        try {
          let userData; 
          const bodyText = await ctx.request.body.text();           
          userData = JSON.parse(bodyText);
           console.log(`📝 userData`,userData);
          if (!userData) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: `Datos del arriendo inválidos o vacíos. Tipo de body: ${bodyText}`,
              timestamp: new Date().toISOString(),
            };
            return;
          }

          // Validar 
          const validar = await arriendoRepository.Validar(ctx,undefined,userData);    
          if(!validar){
            return;
          }
          
          // Crear el usuario en la base de datos
          console.log(`📝 Creando arriendo en la base de datos...`);
          const newUser = await arriendoRepository.createArriendo(userData);
          if (!newUser) {
            ctx.response.status = 500;
            ctx.response.body = {
              success: false,
              message: "Error al crear arriendo en la base de datos",
              timestamp: new Date().toISOString(),
            };
            return;
          }

          ctx.response.status = 201;
          ctx.response.body = {
            success: true,
            data: newUser,
            message: "Arriendo creado exitosamente",
            timestamp: new Date().toISOString(),
          };
          
        } catch (error) {
          console.error("❌ Error al crear arriendo:", error);
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: "Error interno del servidor al crear usuario",
            error: error instanceof Error ? error.message : "Error desconocido",
            timestamp: new Date().toISOString(),
          };
        }
      });


  // PUT /app-alquiler/arriendos/:id
  router.put("/app-alquiler/arriendos/:id", async (ctx) => {
    const id = Number(ctx.params.id);
    const body = await ctx.request.body({ type: "json" }).value;
    const actualizado = await arriendoRepository.update(id, body);
    if (actualizado) {
      ctx.response.body = { success: true, data: actualizado };
    } else {
      ctx.response.status = 404;
      ctx.response.body = { success: false, message: "Arriendo no encontrado" };
    }
  });

  // DELETE /app-alquiler/arriendos/:id
  router.delete("/app-alquiler/arriendos/:id", async (ctx) => {
    const id = Number(ctx.params.id);
    const eliminado = await arriendoRepository.delete(id);
    if (eliminado) {
      ctx.response.body = { success: true, data: eliminado };
    } else {
      ctx.response.status = 404;
      ctx.response.body = { success: false, message: "Arriendo no encontrado" };
    }
  });

  return router;
}
