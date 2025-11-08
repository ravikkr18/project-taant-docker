import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

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

  async verifyToken(token: string): Promise<User | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser(token);

      if (error) {
        console.error('Token verification error:', error.message);
        return null;
      }

      return user;
    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  createServiceClient(): SupabaseClient {
    return this.supabase;
  }

  async getUserProfile(userId: string): Promise<{ id: string; email: string; role: string } | null> {
    try {
      const { data, error } = await this.supabase
        .from('profiles')
        .select('id, email, role')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async getSupplierByUserId(userId: string): Promise<{ id: string; business_name: string } | null> {
    try {
      // Find supplier by user_id
      const { data, error } = await this.supabase
        .from('suppliers')
        .select('id, business_name')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching supplier:', error.message);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching supplier:', error);
      return null;
    }
  }

  async canAccessSupplierData(userId: string, supplierId?: string): Promise<boolean> {
    const profile = await this.getUserProfile(userId);

    if (!profile) {
      return false;
    }

    // Admins can access any supplier data
    if (profile.role === 'admin') {
      return true;
    }

    // Suppliers can only access their own data
    if (profile.role === 'supplier') {
      if (supplierId) {
        const supplier = await this.getSupplierByUserId(userId);
        return supplier ? supplier.id === supplierId : false;
      }
      return true; // If no supplierId specified, they can access their own data
    }

    return false;
  }
}