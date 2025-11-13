// Profile Repository - Database operations for profiles
import { BaseRepository, DatabaseService } from "@common-lib/database/mod.ts";

export class ListasRepository extends BaseRepository {
  constructor(db: DatabaseService) {
    super(db, '"app-alquiler".profiles');
  }



  // Find all active profiles
  async perfilesUserActivos(): Promise<any[]> {
    const result = await this.db.query<any>(
      `SELECT * FROM "app-alquiler".profiles WHERE is_active = true ORDER BY description`,
      []
    );
    return result.rows; 
  }


}