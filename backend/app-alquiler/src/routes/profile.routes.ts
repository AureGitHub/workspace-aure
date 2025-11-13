import { Router } from "https://deno.land/x/oak@v17.1.0/mod.ts";
import { ListasRepository } from "../models/listas.repository.ts";

export function createProfileRoutes(listasRepository: ListasRepository): Router {
  const router = new Router();


   router.get("/app-alquiler/profiles", async (ctx: any) => {
          try {

            console.log("📋 GET /profiles - Solicitando lista de perfiles activos...");
            
            const profiles = await (listasRepository as any).perfilesUserActivos();
            
            console.log(`✅ Devolviendo ${profiles.length} perfiles activos`);
            
            ctx.response.status = 200;
            ctx.response.body = {
              success: true,
              data: profiles,
              message: "Perfiles obtenidos correctamente",
              timestamp: new Date().toISOString(),
            };
          } catch (error) {
            console.error("❌ Error al obtener perfiles:", error);
            ctx.response.status = 500;
            ctx.response.body = {
              success: false,
              message: "Error interno del servidor al obtener perfiles",
              error: error instanceof Error ? error.message : "Error desconocido",
              timestamp: new Date().toISOString(),
            };
          }
        });


  return router;
}
