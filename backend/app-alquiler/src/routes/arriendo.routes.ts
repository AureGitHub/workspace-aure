import { Router } from "https://deno.land/x/oak@v17.1.0/mod.ts";
import { ArriendoRepository } from "../models/arriendo.repository.ts";

export function createArriendoRoutes(arriendoRepository: ArriendoRepository): Router {
  const router = new Router();

  // GET /app-alquiler/arriendos
  router.get("/app-alquiler/arriendos", async (ctx) => {
    const arriendos = await arriendoRepository.findAll();
    ctx.response.body = { success: true, data: arriendos };
  });

  // GET /app-alquiler/arriendos/:id
  router.get("/app-alquiler/arriendos/:id", async (ctx) => {
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

  // POST /app-alquiler/arriendos
  router.post("/app-alquiler/arriendos", async (ctx) => {
    const body = await ctx.request.body({ type: "json" }).value;
    const nuevo = await arriendoRepository.insert(body);
    ctx.response.status = 201;
    ctx.response.body = { success: true, data: nuevo };
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
