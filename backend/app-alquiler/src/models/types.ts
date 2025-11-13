

// Profile Model - Represents user profiles/roles
export interface Profile {
  id: number;
  description: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// User Model - Represents users (owners and tenants)
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_id: number;
  profile?: Profile; // Relación opcional para joins
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
  updated_at: Date;
}



// Create User Input
export interface CreateUserInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  profile_id: number;
}

// Update User Input
export interface UpdateUserInput extends Partial<Omit<CreateUserInput, "password">> {
  is_active?: boolean;
  email_verified?: boolean;
}

// Login Input
export interface LoginInput {
  email: string;
  password: string;
}

// Create Rental Input



// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}


export interface CreateArriendoInput {
  catastroid: number;
	fechapago: Date;
	importe: number;
	quien: string;
	observaciones?: string;
	arriendotipoid: number;

}

// Update User Input
export interface UpdateArriendoInput extends CreateArriendoInput {
}