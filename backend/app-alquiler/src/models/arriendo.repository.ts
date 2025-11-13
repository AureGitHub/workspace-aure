
import { BaseRepository, DatabaseService } from "@common-lib/database/mod.ts";

export interface Arriendo {
  id: number;
  catastroid: number;
  fechapago: Date; // timestamp
  importe: number;
  quien: string;
  observaciones: string;
}

export class ArriendoRepository  extends BaseRepository<Arriendo> {
  constructor(db: DatabaseService) {
    super(db, '"app-alquiler".arriendo');
  }
  async findAll(): Promise<Arriendo[]> {
    console.log('llega al findAll');
    const result= await this.db.query(`
      SELECT c.direccion,
a.*
FROM "app-alquiler".arriendo a 
inner join "app-alquiler".catastro c on a.catastroid =c.id 
order by fechapago desc, direccion

      `);
    return result.rows;
  }

  async findById(id: number): Promise<Arriendo | null> {

     return await this.db.queryOne<Arriendo>(
          `SELECT * FROM ${this.tableName} WHERE id = $1`,
          [id]
        );

   
  }

  async insert(data: Omit<Arriendo, 'id'>): Promise<Arriendo> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const fields = keys.join(", ");
    const params = keys.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO ${this.tableName} (${fields}) VALUES (${params}) RETURNING *`;
    const result = await this.db.query(query, values);
    return result[0];
  }

  async update(id: number, data: Partial<Omit<Arriendo, 'id'>>): Promise<Arriendo | null> {
    const keys = Object.keys(data);
    const values = Object.values(data);
    if (keys.length === 0) return null;
    const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const query = `UPDATE ${this.tableName} SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`;
    const result = await this.db.query(query, [...values, id]);
    return result[0] || null;
  }

  async delete(id: number): Promise<Arriendo | null> {
    const result = await this.db.query(`DELETE FROM ${this.tableName} WHERE id = $1 RETURNING *`, [id]);
    return result[0] || null;
  }
}
