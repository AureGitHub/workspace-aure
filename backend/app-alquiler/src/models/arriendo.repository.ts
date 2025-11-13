
import { BaseRepository, DatabaseService } from "@common-lib/database/mod.ts";
import { CreateArriendoInput } from "./types.ts";

export interface Arriendo {
  id: number;
  catastroid: number;
  fechapago: Date; // timestamp
  importe: number;
  quien: string;
  observaciones: string;
}

export class ArriendoRepository extends BaseRepository<Arriendo> {
  constructor(db: DatabaseService) {
    super(db, '"app-alquiler".arriendo');
  }
  async findAll(): Promise<Arriendo[]> {
    console.log('llega al findAll');
    const result = await this.db.query(`
      SELECT c.direccion,
a.*
FROM "app-alquiler".arriendo a 
inner join "app-alquiler".catastro c on a.catastroid =c.id 
order by fechapago desc, direccion

      `);
    return result.rows;
  }



    async verifyCatastro(id: number): Promise<any | null> {
      return await this.db.queryOne<any>(
            `SELECT * FROM "app-alquiler".catastro  WHERE id = $1`,
            [id]
          );
    }

       async verifyTipoArriendo(id: number): Promise<any | null> {
      return await this.db.queryOne<any>(
            `SELECT * FROM "app-alquiler".arriendo_tipo  WHERE id = $1`,
            [id]
          );
    }


  async Validar(ctx: any,id :number | undefined,  data: any): Promise<boolean> {


    const { catastroid, fechapago, importe, quien, arriendotipoid } = data;
    if (!catastroid || !fechapago || !importe  || !quien || !arriendotipoid) {
            
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "Todos los campos son obligatorios (catastroid, fechapago, importe, quien, arriendotipoid)",
        timestamp: new Date().toISOString(),
      };
      return false;      
    }

    // Validar Catastro        
    const validaCatastro =  await this.verifyCatastro(catastroid);                  
    if(!validaCatastro){              
      console.error("❌ Error validando catastro:", catastroid);            
        ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "El catastroid especificado no existe " + catastroid,
              timestamp: new Date().toISOString(),
            };
      return false;
    }

      // Validar Catastro        
    const validaTipoArriendo =  await this.verifyTipoArriendo(arriendotipoid);                  
    if(!validaTipoArriendo){              
      console.error("❌ Error validando catastro:", catastroid);            
        ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "El arriendotipoid especificado no existe " + arriendotipoid,
              timestamp: new Date().toISOString(),
            };
      return false;
    }

    return true;
  }


  async findById(id: number): Promise<Arriendo | null> {

    return await this.db.queryOne<Arriendo>(
      `SELECT * FROM ${this.tableName} WHERE id = $1`,
      [id]
    );


  }

  // Override create method to handle password hashing in a simpler way
  async createArriendo(data: CreateArriendoInput): Promise<Arriendo> {
    // Simple password hash for demo (use bcrypt in production)


    // Use base create method but build the query manually to handle all fields
    const fields = Object.keys(data).join(", ");
    const values = Object.values(data);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(", ");

    const result = await this.db.queryOne<User>(
      `INSERT INTO ${this.tableName} (${fields}) VALUES (${placeholders}) RETURNING *`,
      values
    );

    if (!result) {
      throw new Error("Failed to create arriendo");
    }

    return result;
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
