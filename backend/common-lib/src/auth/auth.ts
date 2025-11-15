// Authentication Module - JWT Authentication
import { create, verify, getNumericDate,crypto } from "./mod.ts";


export interface AuthConfig {
  jwtSecret?: string;
  jwtExpiration?: number; // in seconds
  algorithm?: "HS256" | "HS384" | "HS512";
}

export interface UserPayload {
  id: string | number;
  email: string;
  username?: string;
  roles?: string[];
  [key: string]: unknown;
}

export interface TokenPayload extends UserPayload {
  iat: number;
  exp: number;
}

export class AuthService {
  private config: Required<AuthConfig>;
  private key: CryptoKey | null = null;

  constructor(config: AuthConfig = {}) {
    this.config = {
      jwtSecret: config.jwtSecret || Deno.env.get("JWT_SECRET") || "default-secret-key",
      jwtExpiration: config.jwtExpiration || 3600, // 1 hour
      algorithm: config.algorithm || "HS256",
    };
  }

  private async getKey(): Promise<CryptoKey> {
    if (!this.key) {
      const encoder = new TextEncoder();
      this.key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(this.config.jwtSecret),
        { name: "HMAC", hash: this.config.algorithm.replace("HS", "SHA-") },
        false,
        ["sign", "verify"]
      );
    }
    return this.key;
  }

  // Generate JWT token
  async generateToken(payload: UserPayload): Promise<string> {
    const key = await this.getKey();
    
    const tokenPayload: TokenPayload = {
      ...payload,
      iat: getNumericDate(new Date()),
      exp: getNumericDate(new Date(Date.now() + this.config.jwtExpiration * 1000)),
    };

    return await create({ alg: this.config.algorithm, typ: "JWT" }, tokenPayload, key);
  }

  // Verify JWT token
  async verifyToken(token: string): Promise<TokenPayload | null> {
    try {
      const key = await this.getKey();
      const payload = await verify(token, key);
      return payload as TokenPayload;
    } catch (_error) {
      return null;
    }
  }

  // Middleware for Oak to verify JWT tokens
  authMiddleware() {
    return async (ctx: any, next: () => Promise<void>) => {
      const authHeader = ctx.request.headers.get("Authorization");
      
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        ctx.response.status = 401;
        ctx.response.body = { error: "Missing or invalid authorization header" };
        return;
      }

      const token = authHeader.slice(7); // Remove "Bearer " prefix
      const payload = await this.verifyToken(token);

      if (!payload) {
        ctx.response.status = 401;
        ctx.response.body = { error: "Invalid or expired token" };
        return;
      }

      // Add user info to context
      ctx.state.user = payload;
      await next();
    };
  }

  // Optional middleware for roles
  requireRoles(roles: string[]) {
    return async (ctx: any, next: () => Promise<void>) => {
      const user = ctx.state.user;
      
      if (!user) {
        ctx.response.status = 401;
        ctx.response.body = { error: "Authentication required" };
        return;
      }

      const userRoles = user.roles || [];
      const hasRequiredRole = roles.some(role => userRoles.includes(role));

      if (!hasRequiredRole) {
        ctx.response.status = 403;
        ctx.response.body = { error: "Insufficient permissions" };
        return;
      }

      await next();
    };
  }

  // Hash password utility
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Verify password utility
  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    const hashedInput = await this.hashPassword(password);
    return hashedInput === hashedPassword;
  }
}

// Helper function to create auth service
export function createAuthService(config?: AuthConfig): AuthService {
  return new AuthService(config);
}

// Types export
export type { AuthConfig, UserPayload, TokenPayload };