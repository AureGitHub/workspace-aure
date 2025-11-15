import { Router, ListasRepository } from "../../mod.ts";

export function createListasRoutes(listasRepository: ListasRepository): Router {
  const router = new Router();
  router.get("/app-alquiler/lista/:cual", async (ctx: any) => {
    const cual = ctx.params?.cual;
    try {
      console.log("📋 GET /Lista - Solicitando lista " + cual);

      const lista = await listasRepository.dameLista(cual);

      ctx.response.status = 200;
      ctx.response.body = {
        success: true,
        data: lista,
        message: `Lista ${cual} obtenida correctamente`,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("❌ Error al obtener lista:", error);
      ctx.response.status = 500;
      ctx.response.body = {
        success: false,
        message: "Error interno del servidor al obtener lista" + cual,
        error: error instanceof Error ? error.message : "Error desconocido",
        timestamp: new Date().toISOString(),
      };
    }
  });


  return router;
}
