// Utils Module - Common utilities
import { load } from "@std/dotenv";

// Environment configuration loader
export async function loadConfig(): Promise<void> {
  try {
    await load({ export: true });
  } catch (_error) {
    // If .env file doesn't exist, continue with environment variables
  }
}

// Response helpers
export class ResponseHelper {
  static success<T>(data: T, message?: string) {
    return {
      success: true,
      message: message || "Operation successful",
      data,
      timestamp: new Date().toISOString(),
    };
  }

  static error(message: string, code?: string, details?: any) {
    return {
      success: false,
      message,
      code,
      details,
      timestamp: new Date().toISOString(),
    };
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message?: string
  ) {
    return {
      success: true,
      message: message || "Data retrieved successfully",
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      timestamp: new Date().toISOString(),
    };
  }
}

// Validation helpers
export class ValidationHelper {
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  static isNumeric(value: string): boolean {
    return /^-?\d+\.?\d*$/.test(value);
  }

  static isStrongPassword(password: string): boolean {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  }

  static sanitizeString(str: string): string {
    return str.trim().replace(/[<>\"']/g, "");
  }
}

// Date helpers
export class DateHelper {
  static formatISO(date: Date): string {
    return date.toISOString();
  }

  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  static isExpired(date: Date): boolean {
    return date < new Date();
  }

  static diffInMinutes(date1: Date, date2: Date): number {
    return Math.abs(date2.getTime() - date1.getTime()) / (1000 * 60);
  }
}

// Logger helpers
export class Logger {
  private static formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : "";
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  static info(message: string, meta?: any): void {
    console.log(this.formatMessage("info", message, meta));
  }

  static warn(message: string, meta?: any): void {
    console.warn(this.formatMessage("warn", message, meta));
  }

  static error(message: string, meta?: any): void {
    console.error(this.formatMessage("error", message, meta));
  }

  static debug(message: string, meta?: any): void {
    if (Deno.env.get("NODE_ENV") !== "production") {
      console.debug(this.formatMessage("debug", message, meta));
    }
  }
}

// HTTP Status codes constants
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Common error types
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    code: string = "INTERNAL_ERROR",
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, HTTP_STATUS.BAD_REQUEST, "VALIDATION_ERROR");
    if (details) {
      this.message = `${message}: ${JSON.stringify(details)}`;
    }
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = "Resource") {
    super(`${resource} not found`, HTTP_STATUS.NOT_FOUND, "NOT_FOUND");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = "Unauthorized") {
    super(message, HTTP_STATUS.UNAUTHORIZED, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = "Forbidden") {
    super(message, HTTP_STATUS.FORBIDDEN, "FORBIDDEN");
  }
}