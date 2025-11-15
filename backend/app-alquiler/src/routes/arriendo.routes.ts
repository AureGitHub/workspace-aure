import { Router, ArriendoRepository } from "../../mod.ts";

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


    router.get("/app-alquiler/arriendos-pagos/:id", async (ctx: any) => {
    const id = Number(ctx.params.id);
    console.log('id param',id);
    const arriendo = await arriendoRepository.findByCatastroId(id);
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
  router.put("/app-alquiler/arriendos/:id", async (ctx: any) => {
   
    
    try{
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
    let updateArriendo = JSON.parse(bodyText);

    const validar = await arriendoRepository.Validar(ctx,id,updateArriendo);    
    if(!validar){
      return;      
    }
    const arriendo = await arriendoRepository.findById(id);

    if (!arriendo) {
      ctx.response.status = 404;
      ctx.response.body = {
        success: false,
        message: "Arriendo no encontrado",
        timestamp: new Date().toISOString(),
      };
      return;
    }
    const updatedArriendo = arriendoRepository.updateArriendo(id, updateArriendo);
    ctx.response.status = 200;
    ctx.response.body = {
      success: true,
      data: updatedArriendo,
      message: "Usuario actualizado correctamente",
      timestamp: new Date().toISOString(),  
    };
    }
    catch(error){
 
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

  // DELETE /app-alquiler/arriendos/:id
  router.delete("/app-alquiler/arriendos/:id", async (ctx: any) => {

    try{
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
              
      const existingArriendo = await arriendoRepository.findById(id);
      if (!existingArriendo) {
        ctx.response.status = 404;
        ctx.response.body = {
          success: false,
          message: "Arriendo no encontrado",
          timestamp: new Date().toISOString(),
        };
        return;
      }

          // Eliminar el usuario de la base de datos
          
      const deleted = await arriendoRepository.deleteArriendo(id);

       if (!deleted) {
          ctx.response.status = 500;
          ctx.response.body = {
            success: false,
            message: "Error al eliminar arriendo de la base de datos",
            timestamp: new Date().toISOString(),
          };
          return;
        }

        console.log(`✅ Arriendo con ID ${id} eliminado exitosamente de la base de datos`);

        ctx.response.status = 200;
        ctx.response.body = {
          success: true,
          message: `Arriendo con ID ${id} eliminado exitosamente`,
          data: { id},
          timestamp: new Date().toISOString(),
        };
    }
    catch(error){
      console.error("❌ Error al eliminar Arriendo:", error);
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
