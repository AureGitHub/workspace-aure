// Database Module - PostgreSQL Connection and utilities
import { Client, Pool } from "./mod.ts";

export interface DatabaseConfig {
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string;
  ssl?: boolean;
  poolSize?: number;
}

export interface QueryResult<T = any> {
  rows: T[];
  rowCount: number;
}

export class DatabaseService {
  private pool: Pool | null = null;
  private config: Required<DatabaseConfig>;

  constructor(config: DatabaseConfig = {}) {
    this.config = {
      host: config.host || Deno.env.get("DB_HOST") || "localhost",
      port: config.port || parseInt(Deno.env.get("DB_PORT") || "5432"),
      database: config.database || Deno.env.get("DB_NAME") || "workspace_aure",
      username: config.username || Deno.env.get("DB_USER") || "postgres",
      password: config.password || Deno.env.get("DB_PASSWORD") || "",
      ssl: config.ssl || (Deno.env.get("DB_SSL") === "true"),
      poolSize: config.poolSize || parseInt(Deno.env.get("DB_POOL_SIZE") || "10"),
    };
  }

  // Initialize connection pool
  async connect(): Promise<void> {
    if (this.pool) {
      return;
    }

    this.pool = new Pool({
      hostname: this.config.host,
      port: this.config.port,
      database: this.config.database,
      user: this.config.username,
      password: this.config.password,
      tls: this.config.ssl,
    }, this.config.poolSize);

    try {
      // Test connection
      const client = await this.pool.connect();
      await client.queryObject("SELECT 1");
      client.release();
      console.log("Database connected successfully");
    } catch (error) {
      console.error("Database connection failed:", error);
      throw error;
    }
  }

  // Close connection pool
  async disconnect(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log("Database disconnected");
    }
  }

  // Execute query with parameters
  async query<T = any>(text: string, params: any[] = []): Promise<QueryResult<T>> {
    if (!this.pool) {
      await this.connect();
    }

    const client = await this.pool!.connect();
    try {
      const result = await client.queryObject<T>(text, params);
      return {
        rows: result.rows,
        rowCount: result.rowCount || 0,
      };
    } finally {
      client.release();
    }
  }

  // Execute query and return single row
  async queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
    const result = await this.query<T>(text, params);
    return result.rows[0] || null;
  }

  // Transaction support
  async transaction<T>(
    callback: (client: Client) => Promise<T>
  ): Promise<T> {
    if (!this.pool) {
      await this.connect();
    }

    const client = await this.pool!.connect();
    try {
      await client.queryObject("BEGIN");
      const result = await callback(client);
      await client.queryObject("COMMIT");
      return result;
    } catch (error) {
      await client.queryObject("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.query("SELECT 1");
      return true;
    } catch (_error) {
      return false;
    }
  }

  // Get connection info (without sensitive data)
  getConnectionInfo() {
    return {
      host: this.config.host,
      port: this.config.port,
      database: this.config.database,
      username: this.config.username,
      ssl: this.config.ssl,
      poolSize: this.config.poolSize,
    };
  }
}

// Repository base class for common CRUD operations
export abstract class BaseRepository<T> {
  protected db: DatabaseService;
  protected tableName: string;

  constructor(db: DatabaseService, tableName: string) {
    this.db = db;
    this.tableName = tableName;
  }

  // Find all records
  async findAll(): Promise<T[]> {
    const result = await this.db.query<T>(`SELECT * FROM ${this.tableName}`);
    return result.rows;
  }

  // Find by ID
  async findById(id: string | number): Promise<T | null> {
    return await this.db.queryOne<T>(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
  }

  // Create new record
  async create(data: Partial<T>): Promise<T> {
    const fields = Object.keys(data).join(", ");
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const result = await this.db.queryOne<T>(
      `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    if (!result) {
      throw new Error("Failed to create record");
    }

    return result;
  }

  // Update record by ID
  async update(id: string | number, data: Partial<T>): Promise<T | null> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((field, index) => `${field} = $${index + 2}`).join(", ");

    return await this.db.queryOne<T>(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
  }

  // Delete record by ID
  async delete(id: string | number): Promise<boolean> {
    const result = await this.db.query(
      `DELETE FROM ${this.tableName} WHERE id = $1`,
      [id]
    );
    return result.rowCount > 0;
  }

  // Count records
  async count(): Promise<number> {
    const result = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM ${this.tableName}`
    );
    return parseInt(result?.count || "0");
  }
}

// Helper function to create database service
export function createDatabaseService(config?: DatabaseConfig): DatabaseService {
  return new DatabaseService(config);
}