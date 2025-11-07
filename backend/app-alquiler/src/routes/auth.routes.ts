// Auth Routes - Authentication endpoints
import { Router } from "@oak/oak";
import { AuthController } from "../controllers/auth.controller.ts";
import { AuthenticationService } from "../services/auth.service.ts";

export function createAuthRoutes(authService: AuthenticationService): Router {
  const router = new Router();
  const authController = new AuthController(authService);
  
  // Public routes
  router.post("/auth/register", authController.register);
  router.post("/auth/login", authController.login);
  
  // Protected routes
  router.get("/auth/profile", authService.getAuthMiddleware(), authController.getProfile);
  router.put("/auth/profile", authService.getAuthMiddleware(), authController.updateProfile);
  router.put("/auth/change-password", authService.getAuthMiddleware(), authController.changePassword);
  
  // DEBUG ROUTES - TEMPORAL - Remove in production
  router.get("/auth/debug/users", authController.debugUsers);
  router.get("/auth/debug/login-admin", authController.debugLoginAdmin);
  
  return router;
}