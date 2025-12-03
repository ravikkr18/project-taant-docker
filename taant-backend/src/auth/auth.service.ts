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
      // First try Supabase token verification
      const { data: { user }, error } = await this.supabase.auth.getUser(token);

      if (error) {
        // Try custom token verification (base64 encoded JSON)
        try {
          const decoded = JSON.parse(Buffer.from(token, 'base64').toString());

          // Check if token has expired
          if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
            console.error('Custom token has expired');
            return null;
          }

          // Create a mock user object that matches Supabase User structure
          const customUser: User = {
            id: decoded.id,
            email: decoded.email || `${decoded.phone}@placeholder.com`,
            phone: decoded.phone,
            user_metadata: {
              phone: decoded.phone,
              name: decoded.name || `User${decoded.phone?.slice(-4)}`,
              role: decoded.role,
            },
            app_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
            confirmed_at: new Date().toISOString(),
          };

          return customUser;
        } catch (customError) {
          console.error('Custom token verification error:', customError);
          return null;
        }
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