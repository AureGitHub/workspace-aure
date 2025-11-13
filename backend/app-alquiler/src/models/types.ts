// Property Model - Represents a property available for rental
export interface Property {
  id: number;
  title: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  property_type: "apartment" | "house" | "room" | "studio" | "other";
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  monthly_rent: number;
  currency: string;
  availability_status: "available" | "rented" | "maintenance" | "inactive";
  images?: string[];
  amenities?: string[];
  owner_id: number;
  created_at: Date;
  updated_at: Date;
}

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

// Rental Model - Represents rental agreements
export interface Rental {
  id: number;
  property_id: number;
  tenant_id: number;
  owner_id: number;
  start_date: Date;
  end_date: Date;
  monthly_rent: number;
  security_deposit: number;
  status: "active" | "pending" | "completed" | "cancelled";
  terms_conditions?: string;
  created_at: Date;
  updated_at: Date;
}

// Payment Model - Represents rental payments
export interface Payment {
  id: number;
  rental_id: number;
  amount: number;
  payment_date: Date;
  due_date: Date;
  payment_type: "rent" | "deposit" | "fee" | "refund";
  payment_method: "cash" | "bank_transfer" | "credit_card" | "other";
  status: "paid" | "pending" | "overdue" | "failed";
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// Message Model - For communication between users
export interface Message {
  id: number;
  sender_id: number;
  recipient_id: number;
  property_id?: number;
  subject: string;
  content: string;
  is_read: boolean;
  created_at: Date;
  updated_at: Date;
}

// Review Model - Property reviews
export interface Review {
  id: number;
  property_id: number;
  tenant_id: number;
  rating: number; // 1-5
  comment?: string;
  created_at: Date;
  updated_at: Date;
}

// Create Property Input
export interface CreatePropertyInput {
  title: string;
  description?: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  property_type: Property["property_type"];
  bedrooms: number;
  bathrooms: number;
  area_sqm: number;
  monthly_rent: number;
  currency: string;
  images?: string[];
  amenities?: string[];
}

// Update Property Input
export interface UpdatePropertyInput extends Partial<CreatePropertyInput> {
  availability_status?: Property["availability_status"];
}

// Create Profile Input
export interface CreateProfileInput {
  description: string;
  is_active?: boolean;
}

// Update Profile Input
export interface UpdateProfileInput extends Partial<CreateProfileInput> {}

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
export interface CreateRentalInput {
  property_id: number;
  tenant_id: number;
  start_date: Date;
  end_date: Date;
  monthly_rent: number;
  security_deposit: number;
  terms_conditions?: string;
}

// Property Search Filters
export interface PropertySearchFilters {
  city?: string;
  state?: string;
  property_type?: Property["property_type"];
  min_rent?: number;
  max_rent?: number;
  min_bedrooms?: number;
  max_bedrooms?: number;
  min_bathrooms?: number;
  max_bathrooms?: number;
  min_area?: number;
  max_area?: number;
  availability_status?: Property["availability_status"];
  amenities?: string[];
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sort_by?: string;
  sort_order?: "ASC" | "DESC";
}