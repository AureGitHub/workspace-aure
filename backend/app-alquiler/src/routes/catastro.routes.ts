// Catastro Routes - API endpoints for catastro
import { Router } from "https://deno.land/x/oak@v17.1.0/mod.ts";
import { CatastroRepository } from "../models/catastro.repository.ts";

export function createCatastroRoutes(catastroRepository: CatastroRepository) {
  const router = new Router();

  // GET /catastro - Listar todos los catastros
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

  // GET /catastro/:id - Obtener un catastro por ID
  router.get("/catastro/:id", async (ctx: any) => {
    try {
      const id = parseInt(ctx.params.id);
      if (!id || isNaN(id)) {
        ctx.response.status = 400;
        ctx.response.body = { success: false, error: "ID inválido" };
        return;
      }
      const catastro = await catastroRepository.findById(id);
      if (!catastro) {
        ctx.response.status = 404;
        ctx.response.body = { success: false, error: "Catastro no encontrado" };
        return;
      }
      ctx.response.status = 200;
      ctx.response.body = { success: true, data: catastro };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = { success: false, error: error.message };
    }
  });

  // POST /catastro - Crear nuevo catastro
  router.post("/catastro", async (ctx: any) => {
    try {
      const body = await ctx.request.body({ type: "json" }).value;
      const newCatastro = await catastroRepository.createCatastro(body);
      ctx.response.status = 201;
      ctx.response.body = { success: true, data: newCatastro };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = { success: false, error: error.message };
    }
  });

  // PUT /catastro/:id - Actualizar catastro
  router.put("/catastro/:id", async (ctx: any) => {
    try {
      const id = parseInt(ctx.params.id);
      if (!id || isNaN(id)) {
        ctx.response.status = 400;
        ctx.response.body = { success: false, error: "ID inválido" };
        return;
      }
      const body = await ctx.request.body({ type: "json" }).value;
      const updatedCatastro = await catastroRepository.updateCatastro(id, body);
      if (!updatedCatastro) {
        ctx.response.status = 404;
        ctx.response.body = { success: false, error: "Catastro no encontrado o sin cambios" };
        return;
      }
      ctx.response.status = 200;
      ctx.response.body = { success: true, data: updatedCatastro };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = { success: false, error: error.message };
    }
  });

  // DELETE /catastro/:id - Eliminar catastro
  router.delete("/catastro/:id", async (ctx: any) => {
    try {
      const id = parseInt(ctx.params.id);
      if (!id || isNaN(id)) {
        ctx.response.status = 400;
        ctx.response.body = { success: false, error: "ID inválido" };
        return;
      }
      const deleted = await catastroRepository.deleteCatastro(id);
      if (!deleted) {
        ctx.response.status = 404;
        ctx.response.body = { success: false, error: "Catastro no encontrado" };
        return;
      }
      ctx.response.status = 200;
      ctx.response.body = { success: true };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = { success: false, error: error.message };
    }
  });

  return router;
}
