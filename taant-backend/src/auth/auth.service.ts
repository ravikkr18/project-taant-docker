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

  async createServiceClient(): Promise<SupabaseClient> {
    return this.supabase;
  }
}