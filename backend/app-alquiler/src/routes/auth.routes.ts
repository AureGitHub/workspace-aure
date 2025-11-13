// Auth Routes - Authentication endpoints
import { Router } from "https://deno.land/x/oak@v17.1.0/mod.ts";
import { AuthController } from "../controllers/auth.controller.ts";
import { AuthenticationService } from "../services/auth.service.ts";

export function createAuthRoutes(authService: AuthenticationService): Router {
  const router = new Router();
  const authController = new AuthController(authService);
  
  // Public routes

    router.post("/app-alquiler/auth/login", authController.login);

  router.post("/app-alquiler/auth/register", authController.register);
  // router.post("/app-alquiler/auth/login", authController.login);
  
  // Protected routes
  router.get("/app-alquiler/auth/profile", authService.getAuthMiddleware(), authController.getProfile);
  router.put("/app-alquiler/auth/profile", authService.getAuthMiddleware(), authController.updateProfile);
  router.put("/app-alquiler/auth/change-password", authService.getAuthMiddleware(), authController.changePassword);
  
  // DEBUG ROUTES - TEMPORAL - Remove in production
  router.get("/app-alquiler/auth/debug/users", authController.debugUsers);
  router.get("/app-alquiler/auth/debug/login-admin", authController.debugLoginAdmin);
  
  return router;
}