// Auth Controller - HTTP endpoints for authentication
import { ResponseHelper, ValidationError, HTTP_STATUS } from "@common-lib/utils/mod.ts";
import { AuthenticationService } from "../services/auth.service.ts";
import { CreateUserInput, LoginInput } from "../models/types.ts";

export class AuthController {
  private authService: AuthenticationService;

  constructor(authService: AuthenticationService) {
    this.authService = authService;
  }

  // Register endpoint
  register = async (ctx: any) => {
    try {
      // Use the parsed body from the middleware
      const body = ctx.state.parsedBody;
      
      if (!body) {
        ctx.response.status = HTTP_STATUS.BAD_REQUEST;
        ctx.response.body = ResponseHelper.error("Request body is required");
        return;
      }
      
      // Validate required fields
      const userData: CreateUserInput = {
        username: body.username,
        email: body.email,
        password: body.password,
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone,
        user_type: body.user_type || "tenant",
      };

      const result = await this.authService.register(userData);
      
      ctx.response.status = HTTP_STATUS.CREATED;
      ctx.response.body = ResponseHelper.success(result, "User registered successfully");
    } catch (error) {
      if (error instanceof ValidationError) {
        ctx.response.status = error.statusCode;
        ctx.response.body = ResponseHelper.error(error.message, error.code);
      } else {
        ctx.response.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        ctx.response.body = ResponseHelper.error("Registration failed");
      }
    }
  };

  // Login endpoint
  login = async (ctx: any) => {
    try {
      console.log("=== LOGIN REQUEST ===");
      console.log("Method:", ctx.request.method);
      console.log("URL:", ctx.request.url);
      console.log("Headers:", Object.fromEntries(ctx.request.headers.entries()));
      
      // Use the parsed body from the middleware
      const body = ctx.state.parsedBody;
      console.log("Parsed request body:", body);

      if (!body) {
        console.log("No request body found");
        ctx.response.status = HTTP_STATUS.BAD_REQUEST;
        ctx.response.body = ResponseHelper.error("Request body is required");
        return;
      }
      
      const loginData: LoginInput = {
        email: body.email,
        password: body.password,
      };

      if (!loginData.email || !loginData.password) {
        console.log("Missing email or password");
        ctx.response.status = HTTP_STATUS.BAD_REQUEST;
        ctx.response.body = ResponseHelper.error("Email and password are required");
        return;
      }

      console.log(`🔐 Login attempt: ${loginData.email}`);
      const authResult = await this.authService.login(loginData);
      console.log(`✅ Login successful for: ${loginData.email}`);
      
      ctx.response.status = HTTP_STATUS.OK;
      ctx.response.body = ResponseHelper.success(authResult, "Login successful");
    } catch (error) {
      const userEmail = ctx.state?.parsedBody?.email || 'undefined';
      const errorMessage = (error as Error).message;
      console.error(`❌ Login failed for ${userEmail}:`, error);
      
      if (error instanceof ValidationError) {
        // Errores de validación (campos faltantes, formato incorrecto, etc.)
        ctx.response.status = (error as any).statusCode;
        ctx.response.body = ResponseHelper.error((error as any).message, (error as any).code);
      } else if (errorMessage.includes("not found") || errorMessage.includes("User not found")) {
        // Usuario no existe
        ctx.response.status = HTTP_STATUS.UNAUTHORIZED;
        ctx.response.body = ResponseHelper.error("Invalid email or password", "INVALID_CREDENTIALS");
      } else if (errorMessage.includes("invalid") || errorMessage.includes("password") || errorMessage.includes("credentials")) {
        // Contraseña incorrecta
        ctx.response.status = HTTP_STATUS.UNAUTHORIZED;
        ctx.response.body = ResponseHelper.error("Invalid email or password", "INVALID_CREDENTIALS");
      } else if (errorMessage.includes("database") || errorMessage.includes("connection")) {
        // Errores de base de datos
        ctx.response.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        ctx.response.body = ResponseHelper.error("Authentication service temporarily unavailable", "SERVICE_ERROR");
      } else {
        // Otros errores del servidor
        ctx.response.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        ctx.response.body = ResponseHelper.error("An unexpected error occurred during login", "SERVER_ERROR");
      }
    }
  };

  // Get profile endpoint
  getProfile = async (ctx: any) => {
    try {
      const userId = ctx.state.user?.id;
      if (!userId) {
        ctx.response.status = HTTP_STATUS.UNAUTHORIZED;
        ctx.response.body = ResponseHelper.error("User not authenticated");
        return;
      }

      const profile = await this.authService.getProfile(userId);
      if (!profile) {
        ctx.response.status = HTTP_STATUS.NOT_FOUND;
        ctx.response.body = ResponseHelper.error("User not found");
        return;
      }

      ctx.response.status = HTTP_STATUS.OK;
      ctx.response.body = ResponseHelper.success(profile, "Profile retrieved successfully");
    } catch (error) {
      ctx.response.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
      ctx.response.body = ResponseHelper.error("Failed to get profile");
    }
  };

  // Update profile endpoint
  updateProfile = async (ctx: any) => {
    try {
      const userId = ctx.state.user?.id;
      if (!userId) {
        ctx.response.status = HTTP_STATUS.UNAUTHORIZED;
        ctx.response.body = ResponseHelper.error("User not authenticated");
        return;
      }

      // Use the parsed body from the middleware
      const body = ctx.state.parsedBody;
      
      if (!body) {
        ctx.response.status = HTTP_STATUS.BAD_REQUEST;
        ctx.response.body = ResponseHelper.error("Request body is required");
        return;
      }

      const updateData = {
        username: body.username,
        email: body.email,
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone,
      };

      // Remove undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof typeof updateData] === undefined) {
          delete updateData[key as keyof typeof updateData];
        }
      });

      const updatedUser = await this.authService.updateProfile(userId, updateData);
      
      ctx.response.status = HTTP_STATUS.OK;
      ctx.response.body = ResponseHelper.success(updatedUser, "Profile updated successfully");
    } catch (error) {
      if (error instanceof ValidationError) {
        ctx.response.status = error.statusCode;
        ctx.response.body = ResponseHelper.error(error.message, error.code);
      } else {
        ctx.response.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        ctx.response.body = ResponseHelper.error("Failed to update profile");
      }
    }
  };

  // Change password endpoint
  changePassword = async (ctx: any) => {
    try {
      const userId = ctx.state.user?.id;
      if (!userId) {
        ctx.response.status = HTTP_STATUS.UNAUTHORIZED;
        ctx.response.body = ResponseHelper.error("User not authenticated");
        return;
      }

      // Use the parsed body from the middleware
      const body = ctx.state.parsedBody;
      
      if (!body) {
        ctx.response.status = HTTP_STATUS.BAD_REQUEST;
        ctx.response.body = ResponseHelper.error("Request body is required");
        return;
      }

      const { currentPassword, newPassword } = body;

      if (!currentPassword || !newPassword) {
        ctx.response.status = HTTP_STATUS.BAD_REQUEST;
        ctx.response.body = ResponseHelper.error("Current password and new password are required");
        return;
      }

      await this.authService.changePassword(userId, currentPassword, newPassword);
      
      ctx.response.status = HTTP_STATUS.OK;
      ctx.response.body = ResponseHelper.success(null, "Password changed successfully");
    } catch (error) {
      if (error instanceof ValidationError) {
        ctx.response.status = error.statusCode;
        ctx.response.body = ResponseHelper.error(error.message, error.code);
      } else {
        ctx.response.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
        ctx.response.body = ResponseHelper.error("Failed to change password");
      }
    }
  };

  // DEBUG ENDPOINT - TEMPORAL - List all users for debugging
  debugUsers = async (ctx: any) => {
    try {
      const users = await this.authService.getAllUsersForDebug();
      
      ctx.response.status = HTTP_STATUS.OK;
      ctx.response.body = ResponseHelper.success(users, "Users retrieved for debugging");
    } catch (error) {
      ctx.response.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
      ctx.response.body = ResponseHelper.error("Failed to get users for debugging");
    }
  };

  // DEBUG ENDPOINT - TEMPORAL - Test admin login process step by step
  debugLoginAdmin = async (ctx: any) => {
    try {
      // Hard-code admin credentials for testing
      const result = await this.authService.debugLogin("admin@test.com", "admin123");
      
      ctx.response.status = HTTP_STATUS.OK;
      ctx.response.body = ResponseHelper.success(result, "Debug admin login process");
    } catch (error) {
      ctx.response.status = HTTP_STATUS.INTERNAL_SERVER_ERROR;
      ctx.response.body = ResponseHelper.error("Failed to debug admin login", (error as Error).message);
    }
  };
}