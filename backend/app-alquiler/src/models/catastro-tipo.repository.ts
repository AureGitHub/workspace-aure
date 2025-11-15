// CatastroTipo Repository - Database operations for catastro_tipo

import { BaseRepository, DatabaseService } from "../../mod.ts";;

export interface CatastroTipo {
  id: number;
  descripcion: string;
}

export interface CreateCatastroTipoInput {
  descripcion: string;
}

export interface UpdateCatastroTipoInput {
  descripcion?: string;
}

export class CatastroTipoRepository extends BaseRepository<CatastroTipo> {
  constructor(db: DatabaseService) {
    super(db, 'catastro_tipo');
  }

  // Find catastro_tipo by descripcion
  async findBydescripcion(descripcion: string): Promise<CatastroTipo | null> {
    return await this.db.queryOne<CatastroTipo>(
      `SELECT * FROM ${this.tableName} WHERE descripcion = $1`,
      [descripcion]
    );
  }

  // Find all active catastro_tipo
  async findAll(): Promise<CatastroTipo[]> {
    const result = await this.db.query<CatastroTipo>(
      `SELECT * FROM ${this.tableName}  ORDER BY descripcion`,
      []
    );
    return result.rows;
  }

  // Check if descripcion exists
  async descripcionExists(descripcion: string, excludeId?: number): Promise<boolean> {
    let query = `SELECT COUNT(*) as count FROM ${this.tableName} WHERE descripcion = $1`;
    const params: any[] = [descripcion];
    if (excludeId) {
      query += ` AND id != $2`;
      params.push(excludeId);
    }
    const result = await this.db.queryOne<{ count: string }>(query, params);
    return parseInt(result?.count || "0") > 0;
  }

  // Create catastro_tipo
  async createCatastroTipo(data: CreateCatastroTipoInput): Promise<CatastroTipo> {
    const tipoData = {
      ...data,
    };
    const fields = Object.keys(tipoData).join(", ");
    const values = Object.values(tipoData);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const result = await this.db.queryOne<CatastroTipo>(
      `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    if (!result) {
      throw new Error("Failed to create catastro_tipo");
    }
    return result;
  }

  // Update catastro_tipo
  async updateCatastroTipo(id: number, data: Partial<UpdateCatastroTipoInput>): Promise<CatastroTipo | null> {
    const updateData = {
      ...data,
      updated_at: new Date()
    };
    return await this.update(id, updateData);
  }



  // Hard delete catastro_tipo
  async deleteCatastroTipo(id: number): Promise<boolean> {
    return await this.delete(id);
  }
}
