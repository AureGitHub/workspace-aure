// User Repository - Database operations for users
import { BaseRepository, DatabaseService } from "../../mod.ts";
import { User, CreateUserInput, UpdateUserInput, Profile } from "./types.ts";

export class UserRepository extends BaseRepository<User> {
  constructor(db: DatabaseService) {
    super(db, '"app-alquiler".users');
  }



  async Validar(ctx: any,id :number | undefined,  data: any): Promise<boolean> {

    const { first_name, last_name, email, password, profile_id } = data;
    if (!first_name || !last_name || !email  || !profile_id) {
            
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "Todos los campos son obligatorios (first_name, last_name, email, password, profile_id)",
        timestamp: new Date().toISOString(),
      };
      return false;      
    }

    if (!password && !id) {
      ctx.response.status = 400;
      ctx.response.body = {
        success: false,
        message: "En el alta, la contraseña es obligatoria",
        timestamp: new Date().toISOString(),
      };
      return false;      

    }


    // Validar profile_id          
    const validaProfile =  await this.ValidarProfileById(ctx,profile_id);                  
    if(!validaProfile){              
      console.error("❌ Error validando perfil:", profile_id);            
      return false;
    }

    const validaEmail =  await this.ValidarEmail(ctx,email,id);                  
    if(!validaEmail){              
      console.error("❌ Error validando email:", email);            
      return false;
    }

    return true;
  }

async ValidarEmail(ctx: any,email: string,id? : number): Promise<boolean> {

         // Validar formato de email
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(email)) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "Formato de email inválido",
              timestamp: new Date().toISOString(),
            };
            return false;
          }

          // Verificar si el email ya existe
          console.log(`🔍 Verificando si email ${email} ya existe...`);
          const emailExists = await this.emailExists(email,id);
          if (emailExists) {
             console.log(`❌ El email ya está registrado...`);
            ctx.response.status = 409;
            ctx.response.body = {
              success: false,
              message: "El email ya está registrado",
              timestamp: new Date().toISOString(),
            };
            return false;
          }

  return true;
}


   // Find profile by description
  async ValidarProfileById(ctx: any,profile_id: any): Promise<boolean> {
    const profileIdNum = parseInt(profile_id);
          if (isNaN(profileIdNum) || profileIdNum < 1) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "profile_id debe ser un número válido",
              timestamp: new Date().toISOString(),
            };
            return false;
          }

          // Verificar que el profile_id existe
          console.log(`🔍 Verificando si profile_id ${profileIdNum} existe...`);
          const profileExists = await  this.db.queryOne<Profile>(`SELECT * FROM "app-alquiler".profiles WHERE id = $1`,[profileIdNum]);
          if (!profileExists) {
            ctx.response.status = 400;
            ctx.response.body = {
              success: false,
              message: "El profile_id especificado no existe",
              timestamp: new Date().toISOString(),
            };
            return false;
          }
    return true;
    
  }

  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    return await this.db.queryOne<User>(
      `SELECT * FROM ${this.tableName} WHERE email = $1`,
      [email]
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


  // Override create method to handle password hashing in a simpler way
  async createUser(data: CreateUserInput): Promise<User> {
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