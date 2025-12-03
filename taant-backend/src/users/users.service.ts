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

    // Check if user exists
    let user = await this.getUserByPhone(phone);

    if (!user) {
      // Create new user
      user = await this.createUser({
        phone,
        name: `User${phone.slice(-4)}`, // Default name
      });
    }

    // Create Supabase session for the user
    const { data: authData, error: authError } = await this.supabase.auth.admin.createUser({
      email: `${phone}@taant.user`, // Use dummy email for Supabase auth
      phone: `+91${phone}`,
      phone_confirm: true,
      user_metadata: {
        phone,
        name: user.name,
        role: user.role,
      },
    });

    if (authError && !authError.message.includes('duplicate') && authError.code !== 'phone_exists') {
      console.error('Supabase auth error:', authError);
      throw new ConflictException('Failed to create user session');
    }

    // For now, always create a custom token to avoid Supabase auth complexity
    // TODO: Implement proper Supabase session management later
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

      // Fallback: Try direct insert without foreign key constraint
      const { data, error } = await this.supabase
        .from('profiles')
        .insert([
          {
            id: authData.user?.id || crypto.randomUUID(),
            phone,
            full_name: name,
            email,
            role: 'supplier',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        console.error('Error creating user profile:', error);
        throw new ConflictException('Failed to create user');
      }

      // Map database result to interface (full_name -> name)
      return {
        ...data,
        name: data.full_name,
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