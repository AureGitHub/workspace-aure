// Catastro Routes - API endpoints for catastro
import { Router } from "oak";
import { CatastroRepository } from "../models/catastro.repository.ts";

export function createCatastroRoutes(catastroRepository: CatastroRepository) {
  const router = new Router();

  // GET /catastro - Listar todos los catastros
  router.get("/catastro", async (ctx: any) => {
    try {
      const catastros = await catastroRepository.findAll();
      ctx.response.status = 200;
      ctx.response.body = { success: true, data: catastros };
    } catch (error) {
      ctx.response.status = 500;
      ctx.response.body = { success: false, error: error.message };
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
