export class User {
  id: string;
  phone: string;
  name?: string;
  email?: string;
  role: 'user' | 'admin' | 'supplier';
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  id: string;
  phone: string;
  name?: string; // Maps to full_name in database
  email?: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserData {
  phone: string;
  name?: string;
  email?: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
}

export interface LoginRequest {
  phone: string;
}

export interface SendOtpRequest {
  phone: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
}

export interface AuthResponse {
  user: UserProfile;
  access_token: string;
  refresh_token?: string;
}