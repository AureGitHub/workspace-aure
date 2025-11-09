// User Repository - Database operations for users
import { BaseRepository, DatabaseService } from "@common-lib/database/mod.ts";
import { User, CreateUserInput, UpdateUserInput } from "./types.ts";

export class UserRepository extends BaseRepository<User> {
  constructor(db: DatabaseService) {
    super(db, '"app-alquiler".users');
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    return await this.db.queryOne<User>(
      `SELECT * FROM ${this.tableName} WHERE email = $1`,
      [email]
    );
  }

  // Find user by username
  async findByUsername(username: string): Promise<User | null> {
    return await this.db.queryOne<User>(
      `SELECT * FROM ${this.tableName} WHERE username = $1`,
      [username]
    );
  }

  // Find users by profile
  async findByProfile(profileId: number): Promise<User[]> {
    const result = await this.db.query<User>(
      `SELECT * FROM ${this.tableName} WHERE profile_id = $1 ORDER BY created_at DESC`,
      [profileId]
    );
    return result.rows;
  }

  // Find users with profile information (JOIN)
  async findAllWithProfiles(): Promise<(User & { profile_description: string })[]> {
    const result = await this.db.query<User & { profile_description: string }>(
      `SELECT u.*, p.description as profile_description 
       FROM ${this.tableName} u
       JOIN "app-alquiler".profiles p ON u.profile_id = p.id
       ORDER BY u.created_at DESC`,
      []
    );
    return result.rows;
  }

  // Find user by ID with profile information
  async findByIdWithProfile(id: number): Promise<(User & { profile_description: string }) | null> {
    return await this.db.queryOne<User & { profile_description: string }>(
      `SELECT u.*, p.description as profile_description 
       FROM ${this.tableName} u
       JOIN "app-alquiler".profiles p ON u.profile_id = p.id
       WHERE u.id = $1`,
      [id]
    );
  }

  // Create user with hashed password
  async createUser(data: CreateUserInput, passwordHash: string): Promise<User> {
    const { password, ...userData } = data;
    const fields = Object.keys(userData).join(", ");
    const values = Object.values(userData);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const result = await this.db.queryOne<User>(
      `INSERT INTO ${this.tableName} (${fields}, password_hash, created_at, updated_at) 
       VALUES (${placeholders}, $${values.length + 1}, NOW(), NOW()) RETURNING *`,
      [...values, passwordHash]
    );

    if (!result) {
      throw new Error("Failed to create user");
    }

    return result;
  }

  // Update user email verification status
  async verifyEmail(id: number): Promise<User | null> {
    return await this.db.queryOne<User>(
      `UPDATE ${this.tableName} SET email_verified = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id]
    );
  }

  // Update user active status
  async updateActiveStatus(id: number, isActive: boolean): Promise<User | null> {
    return await this.db.queryOne<User>(
      `UPDATE ${this.tableName} SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [isActive, id]
    );
  }

  // Update password
  async updatePassword(id: number, passwordHash: string): Promise<User | null> {
    return await this.db.queryOne<User>(
      `UPDATE ${this.tableName} SET password_hash = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [passwordHash, id]
    );
  }

  // Check if email exists
  async emailExists(email: string, excludeId?: number): Promise<boolean> {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE email = $1`;
    const params: any[] = [email];

    if (excludeId) {
      query += ` AND id != $2`;
      params.push(excludeId);
    }

    const result = await this.db.queryOne<{ count: string }>(query, params);
    return parseInt(result?.count || "0") > 0;
  }

  // Check if username exists
  async usernameExists(username: string, excludeId?: number): Promise<boolean> {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE username = $1`;
    const params: any[] = [username];

    if (excludeId) {
      query += ` AND id != $2`;
      params.push(excludeId);
    }

    const result = await this.db.queryOne<{ count: string }>(query, params);
    return parseInt(result?.count || "0") > 0;
  }

  // Override create method to handle password hashing in a simpler way
  async createUserSimple(data: CreateUserInput): Promise<User> {
    // Simple password hash for demo (use bcrypt in production)
    const encoder = new TextEncoder();
    const passwordData = encoder.encode(data.password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", passwordData);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const passwordHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    const { password, ...userData } = data;
    const userDataWithDefaults = {
      ...userData,
      password_hash: passwordHash,
      is_active: true,
      email_verified: false,
      created_at: new Date(),
      updated_at: new Date()
    };

    // Use base create method but build the query manually to handle all fields
    const fields = Object.keys(userDataWithDefaults).join(", ");
    const values = Object.values(userDataWithDefaults);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const result = await this.db.queryOne<User>(
      `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    if (!result) {
      throw new Error("Failed to create user");
    }

    return result;
  }

  // Override update to handle the inherited method
  async updateUser(id: number, data: Partial<UpdateUserInput>): Promise<User | null> {
    const updateData = {
      ...data,
      updated_at: new Date()
    };

    return await this.update(id, updateData);
  }

  // Delete user method
  async deleteUser(id: number): Promise<boolean> {
    return await this.delete(id);
  }
}