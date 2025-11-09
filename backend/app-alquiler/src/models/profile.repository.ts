// Profile Repository - Database operations for profiles
import { BaseRepository, DatabaseService } from "@common-lib/database/mod.ts";
import { Profile, CreateProfileInput, UpdateProfileInput } from "./types.ts";

export class ProfileRepository extends BaseRepository<Profile> {
  constructor(db: DatabaseService) {
    super(db, '"app-alquiler".profiles');
  }

  // Find profile by description
  async findByDescription(description: string): Promise<Profile | null> {
    return await this.db.queryOne<Profile>(
      `SELECT * FROM ${this.tableName} WHERE description = $1`,
      [description]
    );
  }

  // Find all active profiles
  async findAllActive(): Promise<Profile[]> {
    const result = await this.db.query<Profile>(
      `SELECT * FROM ${this.tableName} WHERE is_active = true ORDER BY description`,
      []
    );
    return result.rows;
  }

  // Check if description exists
  async descriptionExists(description: string, excludeId?: number): Promise<boolean> {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE description = $1`;
    const params: any[] = [description];

    if (excludeId) {
      query += ` AND id != $2`;
      params.push(excludeId);
    }

    const result = await this.db.queryOne<{ count: string }>(query, params);
    return parseInt(result?.count || "0") > 0;
  }

  // Create profile
  async createProfile(data: CreateProfileInput): Promise<Profile> {
    const profileData = {
      ...data,
      is_active: data.is_active ?? true,
      created_at: new Date(),
      updated_at: new Date()
    };

    const fields = Object.keys(profileData).join(", ");
    const values = Object.values(profileData);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const result = await this.db.queryOne<Profile>(
      `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    if (!result) {
      throw new Error("Failed to create profile");
    }

    return result;
  }

  // Update profile
  async updateProfile(id: number, data: Partial<UpdateProfileInput>): Promise<Profile | null> {
    const updateData = {
      ...data,
      updated_at: new Date()
    };

    return await this.update(id, updateData);
  }

  // Delete profile (soft delete by setting is_active to false)
  async softDeleteProfile(id: number): Promise<Profile | null> {
    return await this.updateProfile(id, { is_active: false });
  }

  // Hard delete profile (use with caution - check no users reference it)
  async deleteProfile(id: number): Promise<boolean> {
    // First check if any users reference this profile
    const userCount = await this.db.queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM "app-alquiler".users WHERE profile_id = $1`,
      [id]
    );

    if (parseInt(userCount?.count || "0") > 0) {
      throw new Error("Cannot delete profile: users are still referencing it");
    }

    return await this.delete(id);
  }
}