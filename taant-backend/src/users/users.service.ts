import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  CreateUserData,
  UpdateUserData,
  UserProfile,
  SendOtpRequest,
  VerifyOtpRequest,
  AuthResponse
} from './user.entity';

@Injectable()
export class UsersService {
  private supabase: SupabaseClient;
  private otpStore: Map<string, { otp: string; expiresAt: Date; phone: string }> = new Map();

  constructor() {
    this.supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  async sendOtp(sendOtpData: SendOtpRequest): Promise<{ message: string; otp?: string }> {
    const { phone } = sendOtpData;

    // Validate phone number
    if (!phone || phone.length !== 10) {
      throw new UnauthorizedException('Valid 10-digit phone number is required');
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    // Store OTP (in production, use Redis or database)
    this.otpStore.set(phone, { otp, expiresAt, phone });

    // TODO: Send OTP via SMS service (for now, return for demo)
    console.log(`OTP for ${phone}: ${otp}`);

    return {
      message: 'OTP sent successfully',
      otp: process.env.NODE_ENV === 'development' ? otp : undefined, // Return OTP only in development
    };
  }

  async verifyOtp(verifyOtpData: VerifyOtpRequest): Promise<AuthResponse> {
    const { phone, otp } = verifyOtpData;

    // Validate inputs
    if (!phone || phone.length !== 10) {
      throw new UnauthorizedException('Valid 10-digit phone number is required');
    }

    if (!otp || otp.length !== 6) {
      throw new UnauthorizedException('Valid 6-digit OTP is required');
    }

    // Check OTP
    const storedOtpData = this.otpStore.get(phone);
    if (!storedOtpData) {
      throw new UnauthorizedException('OTP not found or expired. Please request a new OTP.');
    }

    if (storedOtpData.expiresAt < new Date()) {
      this.otpStore.delete(phone);
      throw new UnauthorizedException('OTP expired. Please request a new OTP.');
    }

    if (storedOtpData.otp !== otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Clear OTP after successful verification
    this.otpStore.delete(phone);

    // Find existing user in profiles first (by phone)
    let user = await this.getUserByPhone(phone);

    if (!user) {
      // User doesn't have a profile, this means they're a new user
      // Create new auth user and profile
      user = await this.createNewUserWithAuth(phone);
    }

    // Generate custom token for the user
    const token = this.generateCustomToken(user);
    return {
      user,
      access_token: token,
    };
  }

  async createUser(userData: CreateUserData): Promise<UserProfile> {
    const { phone, name, email } = userData;

    // Check if user already exists
    const existingUser = await this.getUserByPhone(phone);
    if (existingUser) {
      throw new ConflictException('User with this phone number already exists');
    }

    // Use Supabase Auth to create user first
    const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
      email: email || `${phone}@placeholder.com`,
      phone: `+91${phone}`,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: {
        full_name: name,
        role: 'supplier'
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);

      // User likely exists in auth, check for existing profile
      const existingProfile = await this.getUserByPhone(phone);
      if (existingProfile) {
        console.log('Found existing profile for user:', existingProfile.id);
        return existingProfile;
      }

      // If auth user exists but no profile, create a real profile
      console.log('Creating real profile for existing auth user');

      // Since we can't easily get the existing auth user ID without creating conflict,
      // let's create a unique profile without foreign key constraint
      // Use a deterministic ID based on phone number
      const deterministicId = `profile-${phone}`;

      // Create a proper user profile record (without foreign key constraint)
      const { data: newProfile, error: profileError } = await this.supabase
        .from('profiles')
        .insert([
          {
            id: deterministicId,
            phone,
            full_name: name,
            email: email || `${phone}@taant.user`,
            role: 'supplier',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (profileError) {
        console.error('Error creating user profile for existing auth user:', profileError);
        throw new ConflictException('Failed to create user profile');
      }

      return {
        ...newProfile,
        name: newProfile.full_name,
      };
    }

    // Get the user profile from auth metadata
    const userProfile = {
      id: authData.user.id,
      phone,
      name: authData.user.user_metadata?.full_name || name,
      email: authData.user.email,
      role: authData.user.user_metadata?.role || 'supplier',
      created_at: new Date(authData.user.created_at),
      updated_at: new Date(authData.user.updated_at || authData.user.created_at),
    };

    return userProfile;
  }

  async getUserByPhone(phone: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('phone', phone)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      console.error('Error fetching user by phone:', error);
      return null;
    }

    // Map database result to interface (full_name -> name)
    return {
      ...data,
      name: data.full_name,
    };
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // No rows found
      }
      console.error('Error fetching user by ID:', error);
      return null;
    }

    // Map database result to interface (full_name -> name)
    return {
      ...data,
      name: data.full_name,
    };
  }

  async updateUser(id: string, updateData: UpdateUserData): Promise<UserProfile> {
    // Map interface field names to database column names
    const dbUpdateData = {
      ...updateData,
      ...(updateData.name && { full_name: updateData.name }),
      updated_at: new Date().toISOString(),
    };

    // Remove 'name' from update data as it doesn't exist in the database
    delete dbUpdateData.name;

    const { data, error } = await this.supabase
      .from('profiles')
      .update(dbUpdateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user:', error);
      throw new NotFoundException('Failed to update user');
    }

    // Map database result to interface (full_name -> name)
    return {
      ...data,
      name: data.full_name,
    };
  }

  async deleteUser(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting user:', error);
      throw new NotFoundException('Failed to delete user');
    }
  }

  private async createProfileForAuthUser(authUserId: string, phone: string): Promise<UserProfile> {
    const { data: newProfile, error: profileError } = await this.supabase
      .from('profiles')
      .insert([
        {
          id: authUserId,
          phone,
          full_name: `User${phone.slice(-4)}`,
          email: `${phone}@taant.user`,
          role: 'supplier',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (profileError) {
      console.error('Error creating profile for auth user:', profileError);
      throw new ConflictException('Failed to create user profile');
    }

    return {
      ...newProfile,
      name: newProfile.full_name,
    };
  }

  private async createNewUserWithAuth(phone: string): Promise<UserProfile> {
    const defaultName = `User${phone.slice(-4)}`;
    const defaultEmail = `${phone}@taant.user`;

    // Create auth user first
    const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
      email: defaultEmail,
      phone: `+91${phone}`,
      phone_confirm: true,
      user_metadata: {
        full_name: defaultName,
        role: 'supplier'
      }
    });

    if (authError) {
      console.error('Error creating auth user:', authError);
      throw new ConflictException('Failed to create user account');
    }

    // Then create profile with the same ID
    return await this.createProfileForAuthUser(authData.user.id, phone);
  }

  private generateCustomToken(user: UserProfile): string {
    // Simple JWT-like token for development
    // In production, use proper JWT library
    const payload = {
      id: user.id,
      phone: user.phone,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60), // 24 hours
    };

    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  // Cleanup expired OTPs (call this periodically)
  cleanupExpiredOtps(): void {
    const now = new Date();
    for (const [key, value] of this.otpStore.entries()) {
      if (value.expiresAt < now) {
        this.otpStore.delete(key);
      }
    }
  }
}