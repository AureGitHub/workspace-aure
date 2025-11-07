// Property Repository - Database operations for properties
import { BaseRepository, DatabaseService } from "@common-lib/database/mod.ts";
import { Property, CreatePropertyInput, UpdatePropertyInput, PropertySearchFilters } from "./types.ts";

export class PropertyRepository extends BaseRepository<Property> {
  constructor(db: DatabaseService) {
    super(db, '"app-alquiler".properties');
  }

  // Find properties by owner
  async findByOwner(ownerId: number): Promise<Property[]> {
    const result = await this.db.query<Property>(
      `SELECT * FROM ${this.tableName} WHERE owner_id = $1 ORDER BY created_at DESC`,
      [ownerId]
    );
    return result.rows;
  }

  // Search properties with filters
  async search(filters: PropertySearchFilters, page: number = 1, limit: number = 10): Promise<{
    properties: Property[];
    total: number;
  }> {
    let query = `SELECT * FROM ${this.tableName} WHERE 1=1`;
    const params: any[] = [];
    let paramCount = 0;

    // Apply filters
    if (filters.city) {
      paramCount++;
      query += ` AND LOWER(city) LIKE LOWER($${paramCount})`;
      params.push(`%${filters.city}%`);
    }

    if (filters.state) {
      paramCount++;
      query += ` AND LOWER(state) LIKE LOWER($${paramCount})`;
      params.push(`%${filters.state}%`);
    }

    if (filters.property_type) {
      paramCount++;
      query += ` AND property_type = $${paramCount}`;
      params.push(filters.property_type);
    }

    if (filters.min_rent) {
      paramCount++;
      query += ` AND monthly_rent >= $${paramCount}`;
      params.push(filters.min_rent);
    }

    if (filters.max_rent) {
      paramCount++;
      query += ` AND monthly_rent <= $${paramCount}`;
      params.push(filters.max_rent);
    }

    if (filters.min_bedrooms) {
      paramCount++;
      query += ` AND bedrooms >= $${paramCount}`;
      params.push(filters.min_bedrooms);
    }

    if (filters.max_bedrooms) {
      paramCount++;
      query += ` AND bedrooms <= $${paramCount}`;
      params.push(filters.max_bedrooms);
    }

    if (filters.min_bathrooms) {
      paramCount++;
      query += ` AND bathrooms >= $${paramCount}`;
      params.push(filters.min_bathrooms);
    }

    if (filters.max_bathrooms) {
      paramCount++;
      query += ` AND bathrooms <= $${paramCount}`;
      params.push(filters.max_bathrooms);
    }

    if (filters.min_area) {
      paramCount++;
      query += ` AND area_sqm >= $${paramCount}`;
      params.push(filters.min_area);
    }

    if (filters.max_area) {
      paramCount++;
      query += ` AND area_sqm <= $${paramCount}`;
      params.push(filters.max_area);
    }

    if (filters.availability_status) {
      paramCount++;
      query += ` AND availability_status = $${paramCount}`;
      params.push(filters.availability_status);
    }

    // Get total count
    const countQuery = query.replace("SELECT *", "SELECT COUNT(*)");
    const countResult = await this.db.queryOne<{ count: string }>(countQuery, params);
    const total = parseInt(countResult?.count || "0");

    // Add pagination
    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(limit, (page - 1) * limit);

    const result = await this.db.query<Property>(query, params);

    return {
      properties: result.rows,
      total,
    };
  }

  // Find available properties
  async findAvailable(limit: number = 10): Promise<Property[]> {
    const result = await this.db.query<Property>(
      `SELECT * FROM ${this.tableName} WHERE availability_status = 'available' ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  // Update availability status
  async updateAvailabilityStatus(id: number, status: Property["availability_status"]): Promise<Property | null> {
    return await this.db.queryOne<Property>(
      `UPDATE ${this.tableName} SET availability_status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );
  }

  // Create with owner
  async createProperty(data: CreatePropertyInput, ownerId: number): Promise<Property> {
    const fields = Object.keys(data).join(", ");
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const result = await this.db.queryOne<Property>(
      `INSERT INTO ${this.tableName} (${fields}, owner_id, created_at, updated_at) 
       VALUES (${placeholders}, $${values.length + 1}, NOW(), NOW()) RETURNING *`,
      [...values, ownerId]
    );

    if (!result) {
      throw new Error("Failed to create property");
    }

    return result;
  }
}