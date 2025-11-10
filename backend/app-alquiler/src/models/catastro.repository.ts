// Catastro Repository - Database operations for catastro
import { BaseRepository, DatabaseService } from "@common-lib/database/mod.ts";

export interface Catastro {
  id: number;
  catastrotipoid: number;
  felipe: boolean;
  referenciacatastral: string;
  direccion: string;
  poligono?: string;
  parcela?: string;
  superficieconstruida: number;
  superficieparcela: number;
  uso: string;
  valorsuelo: number;
  valorconstruccion: number;
  valorcatastral: number;
}

export class CatastroRepository extends BaseRepository<Catastro> {
  constructor(db: DatabaseService) {
    super(db, '"app-alquiler".catastro');
  }

  // Find by referencia catastral
  async findAll(): Promise<Catastro | null> {


        const result = await this.db.query<Catastro>(
          `SELECT * FROM ${this.tableName} `,
          []
        );
        return result.rows;
  }


  // Create catastro
  async createCatastro(data: Omit<Catastro, 'id'>): Promise<Catastro> {
    const fields = Object.keys(data).join(", ");
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");
    const result = await this.db.queryOne<Catastro>(
      `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders}) RETURNING *`,
      values
    );
    if (!result) {
      throw new Error("Failed to create catastro");
    }
    return result;
  }

  // Update catastro
  async updateCatastro(id: number, data: Partial<Omit<Catastro, 'id'>>): Promise<Catastro | null> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    if (fields.length === 0) return null;
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
    const result = await this.db.queryOne<Catastro>(
      `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    return result;
  }

  // Delete catastro
  async deleteCatastro(id: number): Promise<boolean> {
    const result = await this.db.queryOne<Catastro>(
      `DELETE FROM ${this.tableName} WHERE id = $1 RETURNING id`,
      [id]
    );
    return !!result;
  }
}
