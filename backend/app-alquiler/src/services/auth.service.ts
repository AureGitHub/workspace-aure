// Auth Service - Authentication and user management
import { UserRepository,ValidationError, UnauthorizedError,CommonAuthService, createAuthService } from "../../mod.ts";
import { User, CreateUserInput, LoginInput } from "../models/types.ts";

export class AuthenticationService {
  private authService: CommonAuthService;
  private userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.authService = createAuthService();
    this.userRepository = userRepository;
  }

  // Register new user
  async register(userData: CreateUserInput): Promise<{ user: Omit<User, "password_hash">, token: string }> {
    // Validate input
    if (!userData.email || !userData.password || !userData.username) {
      throw new ValidationError("Email, username, and password are required");
    }

    // Check if user already exists
    const existingEmail = await this.userRepository.emailExists(userData.email);
    if (existingEmail) {
      throw new ValidationError("Email already registered");
    }

    const existingUsername = await this.userRepository.usernameExists(userData.username);
    if (existingUsername) {
      throw new ValidationError("Username already taken");
    }

    // Hash password
    const passwordHash = await this.authService.hashPassword(userData.password);

    // Create user
    const user = await this.userRepository.createUser(userData, passwordHash);

    // Generate token
    const token = await this.authService.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      roles: [user.user_type],
    });

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  // Login user
  async login(loginData: LoginInput): Promise<{ user: Omit<User, "password_hash">, token: string }> {
    const { email, password } = loginData;

    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedError("Account is inactive");
    }

    // Verify password
    const isValidPassword = await this.authService.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Generate token
    const token = await this.authService.generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      roles: [user.user_type],
    });

    // Return user without password hash
    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  // Get user profile
  async getProfile(userId: number): Promise<Omit<User, "password_hash"> | null> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      return null;
    }

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // Update user profile
  async updateProfile(userId: number, updateData: Partial<CreateUserInput>): Promise<Omit<User, "password_hash">> {
    // Check if email/username already exists (excluding current user)
    if (updateData.email) {
      const emailExists = await this.userRepository.emailExists(updateData.email, userId);
      if (emailExists) {
        throw new ValidationError("Email already registered");
      }
    }

    if (updateData.username) {
      const usernameExists = await this.userRepository.usernameExists(updateData.username, userId);
      if (usernameExists) {
        throw new ValidationError("Username already taken");
      }
    }

    // Update user
    const updatedUser = await this.userRepository.update(userId, updateData);
    if (!updatedUser) {
      throw new Error("Failed to update user");
    }

    const { password_hash, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  // Change password
  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Verify current password
    const isValidPassword = await this.authService.verifyPassword(currentPassword, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    // Hash new password
    const newPasswordHash = await this.authService.hashPassword(newPassword);

    // Update password
    await this.userRepository.updatePassword(userId, newPasswordHash);
  }

  // Verify email
  async verifyEmail(userId: number): Promise<void> {
    await this.userRepository.verifyEmail(userId);
  }

  // Get auth middleware
  getAuthMiddleware() {
    return this.authService.authMiddleware();
  }

  // Get role middleware
  requireRoles(roles: string[]) {
    return this.authService.requireRoles(roles);
  }

  // DEBUG METHOD - TEMPORAL - Get all users for debugging
  async getAllUsersForDebug(): Promise<any[]> {
    const users = await this.userRepository.findAll();
    
    // Return users with password hash visible for debugging
    return users.map((user: any) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.user_type,
      password_hash: user.password_hash,
      is_active: user.is_active,
      email_verified: user.email_verified,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone,
      created_at: user.created_at,
      updated_at: user.updated_at
    }));
  }

  // DEBUG METHOD - TEMPORAL - Debug login process
  async debugLogin(email: string, password: string): Promise<any> {
    console.log(`🔍 DEBUG LOGIN - Email: ${email}, Password: ${password}`);
    
    // Step 1: Find user by email
    const user = await this.userRepository.findByEmail(email);
    console.log(`🔍 User found:`, user ? `Yes (id: ${user.id})` : 'No');
    
    if (!user) {
      return { step: 1, status: 'FAILED', message: 'User not found' };
    }

    // Step 2: Check if user is active
    console.log(`🔍 User active:`, user.is_active);
    if (!user.is_active) {
      return { step: 2, status: 'FAILED', message: 'User inactive' };
    }

    // Step 3: Hash the provided password
    const providedPasswordHash = await this.authService.hashPassword(password);
    console.log(`🔍 Provided password hash: ${providedPasswordHash}`);
    console.log(`🔍 Stored password hash:   ${user.password_hash}`);
    
    // Step 4: Verify password
    const isValidPassword = await this.authService.verifyPassword(password, user.password_hash);
    console.log(`🔍 Password valid:`, isValidPassword);
    
    if (!isValidPassword) {
      return { 
        step: 4, 
        status: 'FAILED', 
        message: 'Invalid password',
        providedHash: providedPasswordHash,
        storedHash: user.password_hash,
        hashesMatch: providedPasswordHash === user.password_hash
      };
    }

    return { 
      step: 'COMPLETE', 
      status: 'SUCCESS', 
      message: 'Login would succeed',
      user: {
        id: user.id,
        email: user.email,
        username: user.username
      }
    };
  }
}