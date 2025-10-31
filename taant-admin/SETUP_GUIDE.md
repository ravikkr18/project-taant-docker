# Taant Admin Panel - Complete Setup Guide

## 📋 Prerequisites

- Supabase project set up and running
- Access to Supabase Dashboard
- Node.js 18+ installed

## 🚀 Setup Instructions

### **Step 1: Configure Environment Variables**

1. Copy the example environment file:
```bash
cp .env.local.example .env.local
```

2. Update `.env.local` with your Supabase credentials:
```env
# Get these from your Supabase Dashboard > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3001
NEXT_PUBLIC_SITE_NAME=Taant Admin Panel
```

### **Step 2: Setup Supabase Database Tables**

1. **Open Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**
3. **Go to SQL Editor** (left sidebar)
4. **Copy and paste the entire content of `supabase-setup.sql`**
5. **Click "Run" to execute the SQL**

This will create:
- `profiles` table (extends auth.users)
- `admin_roles` table (Super Admin, Admin, Moderator)
- `admin_users` table (admin access management)
- Row Level Security policies
- Triggers and functions

### **Step 3: Create Admin User Account**

#### **Option A: Via Supabase Dashboard (Recommended)**

1. **Go to Authentication** → **Users** in Supabase Dashboard
2. **Click "Add user"**
3. **Enter admin details**:
   - **Email**: `admin@taant.com` (or your preferred admin email)
   - **Password**: Choose a strong password
   - **Full Name**: `Admin User`
4. **Click "Save"**

4. **Update user to admin role**:
   - Go to **SQL Editor**
   - Run the `create-admin-user.sql` script
   - **Replace the email** in the script with your admin email
   - **Click "Run"**

#### **Option B: Via SQL (Advanced)**

If you want to create users directly via SQL:

```sql
-- First, run the supabase-setup.sql script if you haven't already

-- Then execute this SQL to create admin user:
-- (Replace email with your desired admin email)

-- Update existing user to admin role
UPDATE public.profiles
SET role = 'admin', full_name = 'Admin User'
WHERE email = 'your-admin-email@example.com';

-- Create admin user record
INSERT INTO public.admin_users (id, role_id, permissions)
SELECT p.id, r.id, r.permissions
FROM public.profiles p
CROSS JOIN public.admin_roles r
WHERE p.email = 'your-admin-email@example.com'
AND r.name = 'Super Admin';
```

### **Step 4: Test the Setup**

1. **Start the development server** (if not running):
```bash
npm run dev
```

2. **Access the admin panel**: http://localhost:3001

3. **Login with your admin credentials**:
   - **Email**: `admin@taant.com` (or your admin email)
   - **Password**: The password you set in Step 3

4. **You should be redirected to the dashboard** if successful!

## 🔐 Default Login Credentials

After following the setup:

- **Email**: `admin@taant.com`
- **Password**: (Whatever you set when creating the user)

## 🛠️ Troubleshooting

### **Common Issues:**

1. **"Access denied. Admin privileges required"**
   - Check if the user was created correctly in Supabase Auth
   - Verify the profile role is set to 'admin'
   - Make sure the admin_users record exists

2. **"User profile not found"**
   - Run the SQL setup script again
   - Check if the profiles table exists
   - Verify the trigger was created successfully

3. **Database connection errors**
   - Check your `.env.local` file
   - Verify Supabase URL and keys are correct
   - Ensure your Supabase project is active

### **Debugging Steps:**

1. **Check user profile**:
```sql
SELECT * FROM public.profiles WHERE email = 'your-admin-email@example.com';
```

2. **Check admin user record**:
```sql
SELECT * FROM public.admin_users au
JOIN public.profiles p ON au.id = p.id
WHERE p.email = 'your-admin-email@example.com';
```

3. **Check browser console** for any JavaScript errors
4. **Check network tab** for failed API calls

## 📱 Accessing the Admin Panel

- **Login Page**: http://localhost:3001/login
- **Dashboard**: http://localhost:3001/dashboard (after login)

## 🔄 After Setup

Once logged in, you can:

1. **View dashboard statistics**
2. **Manage other admin users**
3. **Access user management**
4. **Configure platform settings**
5. **View analytics and reports**

## 🚀 Next Steps

After successful setup:

1. **Create additional admin users** as needed
2. **Customize dashboard metrics**
3. **Add more admin features** (user management, product oversight, etc.)
4. **Set up proper backup and monitoring**

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Verify all SQL scripts executed successfully
3. Ensure environment variables are correct
4. Check browser console for errors

---

**🎉 Your Taant Admin Panel is now ready to use!**