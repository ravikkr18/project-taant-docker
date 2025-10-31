# 🚀 Taant Admin Panel - Complete Setup Guide

## 📋 Overview

This guide will help you set up your Taant Admin Panel with Supabase database and authentication. The setup process involves:

1. **Environment Configuration** - Setting up your Supabase credentials
2. **Database Setup** - Creating necessary tables and security policies
3. **Admin User Creation** - Setting up your admin account
4. **Login & Dashboard Access** - Accessing your admin panel

## 🔧 Prerequisites

- A Supabase project (create one at [supabase.com](https://supabase.com))
- Node.js 18+ installed
- Your Supabase project URL and API keys

## 🌐 Step 1: Environment Setup

1. **Get your Supabase credentials**:
   - Go to your Supabase Dashboard
   - Navigate to **Project Settings** → **API**
   - Copy the **Project URL** and **anon public** key

2. **Configure environment variables**:
   Create a `.env.local` file in the `taant-admin` directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_APP_URL=http://localhost:3002
   ```

3. **Start the development server**:
   ```bash
   cd taant-admin
   npm run dev
   ```

4. **Access the setup page**:
   Open http://localhost:3002/setup in your browser

## 🗄️ Step 2: Database Setup

### Manual Database Setup (Recommended)

Since Supabase doesn't provide a direct SQL execution API, you'll need to manually run the SQL script:

1. **Open Supabase Dashboard**:
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Open SQL Editor**:
   - Click "SQL Editor" in the left sidebar
   - Click "New query" button

3. **Copy and Execute SQL**:
   - Copy the complete SQL script from the setup page
   - Paste it into the SQL Editor
   - Click "Run" to execute

4. **Verify Setup**:
   - Return to the setup page
   - Click "🔄 Refresh Status" button
   - You should see all tables marked as "✅ Ready"

### What the SQL Script Creates

- **`profiles` table** - User profiles with role management
- **`admin_roles` table** - Admin role definitions and permissions
- **`admin_users` table** - Admin user access control
- **Row Level Security (RLS) policies** - Data protection and access control
- **Triggers and functions** - Automated profile creation and timestamp updates
- **Default admin roles** - Super Admin, Admin, and Moderator roles

## 👤 Step 3: Admin User Creation

Once the database is set up, you can create your admin user:

1. **Fill in the admin form**:
   - **Email**: admin@taant.com (or your preferred email)
   - **Password**: Choose a secure password (minimum 8 characters)
   - **Full Name**: Admin User (or your name)
   - **Role**: Super Admin (recommended for initial setup)

2. **Click "Create Admin User"**

3. **Save your credentials**:
   The setup page will display your login credentials. Save them securely!

### Admin Roles Explained

- **Super Admin**: Full access to all platform features `{ "all": true }`
- **Admin**: Standard admin access to users, products, orders, and analytics
- **Moderator**: Content moderation access to products and orders only

## 🔐 Step 4: Login and Dashboard Access

1. **Automatic Redirect**:
   After successful admin user creation, you'll be automatically redirected to the login page.

2. **Login with your credentials**:
   - Use the email and password you created in Step 3
   - Click "Sign In"

3. **Access the Dashboard**:
   Upon successful login, you'll be redirected to the admin dashboard where you can:
   - View platform statistics
   - Manage users and suppliers
   - Configure system settings
   - Monitor activities

## 🎯 Success! What's Next?

Your Taant Admin Panel is now ready! Here's what you can do:

### ✅ Available Features

- **User Management**: Create and manage customer, supplier, and admin accounts
- **Role-Based Access Control**: Assign appropriate permissions to different user types
- **Dashboard Analytics**: View platform statistics and insights
- **Security Features**: RLS policies, secure authentication, and session management

### 🔄 Ongoing Setup

- **Additional Admin Users**: Create more admin accounts through the dashboard
- **Supplier Panel Setup**: Set up the supplier panel (taant-supplier) next
- **Product Management**: Configure product categories and attributes

## 🔍 Troubleshooting

### Database Setup Issues

**Problem**: Tables not created after running SQL
- **Solution**: Verify the SQL executed successfully in Supabase SQL Editor
- **Check for any error messages in the SQL Editor output**

### Login Issues

**Problem**: "User profile not found" error
- **Solution**: Ensure the database tables were created successfully
- **Check that the admin user creation completed without errors**

### Connection Issues

**Problem**: Supabase connection errors
- **Solution**: Verify your environment variables are correct
- **Check that your Supabase project is active and not paused**

## 📞 Need Help?

If you encounter any issues:

1. **Check the browser console** for JavaScript errors
2. **Review error messages** on the setup page
3. **Verify your Supabase project** is properly configured
4. **Ensure environment variables** are correct

## 🎉 Congratulations!

You've successfully set up your Taant Admin Panel! You now have a fully functional admin backend with:

- ✅ Secure authentication system
- ✅ Role-based access control
- ✅ Database with proper security policies
- ✅ Admin dashboard for platform management

You're ready to move on to setting up the supplier panel (taant-supplier) next!

---

**📁 Next Steps**: Work on `taant-supplier` panel for product and supplier management