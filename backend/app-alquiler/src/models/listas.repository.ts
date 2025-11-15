// Profile Repository - Database operations for profiles
import { BaseRepository, DatabaseService } from "../../mod.ts";;

export class ListasRepository extends BaseRepository {


  
  constructor(db: DatabaseService) {
    super(db, '"app-alquiler".profiles');
  }


  async dameLista(cual: string) {
    let result=null;
    switch(cual){

        
      case 'profiles':
        result = await this.perfilesUserActivos();
        return result;

      case 'catastro_tipo':
        result = await this.catastroTipos();
        return result;
        
      case 'arriendo_tipo':
        result = await this.arriendoTipos();
        return result;
        
    }
  }



  // Find all active profiles
  async perfilesUserActivos(): Promise<any[]> {
    const result = await this.db.query<any>(
      `SELECT * FROM "app-alquiler".profiles WHERE is_active = true ORDER BY description`,
      []
    );
    return result.rows; 
  }


    async arriendoTipos(): Promise<any[]> {
    const result = await this.db.query<any>(
      `SELECT * FROM "app-alquiler".arriendo_tipo`,
      []
    );
    return result.rows; 
  }


    async catastroTipos(): Promise<any[]> {
    const result = await this.db.query<any>(
      `SELECT * FROM "app-alquiler".catastro_tipo`,
      []
    );
    return result.rows; 
  }
}