# 🚀 Taant Admin Panel

A comprehensive admin backend panel built with Next.js 14, TypeScript, Tailwind CSS, and Supabase for managing users, suppliers, products, and platform settings.

## 🎯 Features

### ✅ Completed Features

- **🔐 Authentication System**
  - Supabase-based authentication with secure session management
  - Role-based access control (Super Admin, Admin, Moderator)
  - Protected routes with middleware
  - Login/logout functionality

- **🗄️ Database Management**
  - Complete PostgreSQL schema with Row Level Security (RLS)
  - User profiles with role management
  - Admin roles and permissions system
  - Automated triggers and functions

- **⚙️ Setup System**
  - User-friendly setup interface
  - Manual SQL setup with clear instructions
  - Real-time setup status checking
  - Admin user creation workflow

- **🎨 Modern UI/UX**
  - Responsive design with Tailwind CSS
  - shadcn/ui components
  - Dark/light theme support (ready)
  - Mobile-friendly interface

### 🔄 In Development

- Dashboard analytics and charts
- User management interface
- Supplier management system
- Product catalog management
- Order management system
- Site settings configuration

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI primitives
- **Backend**: Next.js API routes, Supabase Edge Functions
- **Database**: Supabase PostgreSQL with RLS
- **Authentication**: Supabase Auth
- **State Management**: Zustand (planned)
- **Forms**: React Hook Form (planned)
- **Charts**: Recharts (planned)

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ installed
- Supabase account and project

### 2. Setup Environment

Create `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Start Development Server

```bash
npm run dev
```

### 5. Setup Database

1. Open http://localhost:3002/setup
2. Follow the manual setup instructions
3. Copy SQL script to Supabase SQL Editor
4. Execute script and refresh status
5. Create admin user account

### 6. Login and Access

- Use your admin credentials to login at http://localhost:3002/login
- Access dashboard at http://localhost:3002/dashboard

## 📁 Project Structure

```
taant-admin/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   └── setup/         # Setup endpoints
│   │   ├── dashboard/         # Dashboard pages
│   │   ├── login/             # Login page
│   │   └── setup/             # Setup page
│   ├── components/            # React components
│   │   └── ui/               # shadcn/ui components
│   ├── lib/                  # Utility libraries
│   │   └── supabase/         # Supabase client
│   └── middleware.ts         # Next.js middleware
├── public/                   # Static assets
└── docs/                     # Documentation
```

## 🔧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checks
```

### Database Schema

The system uses three main tables:

- **`profiles`**: User profiles with role management
- **`admin_roles`**: Role definitions and permissions
- **`admin_users`**: Admin user access control

### Authentication Flow

1. User registers/logs in via Supabase Auth
2. Profile automatically created in `profiles` table
3. For admin users, additional record created in `admin_users`
4. Session managed via secure cookies
5. Middleware protects routes based on authentication status

## 📋 Setup Guide

### Manual Database Setup

Since Supabase doesn't provide direct SQL execution API:

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Copy SQL script** from setup page
3. **Execute script** to create tables and policies
4. **Refresh setup status** to verify completion
5. **Create admin user** via setup form

### Admin User Creation

Default credentials (customizable):
- **Email**: admin@taant.com
- **Password**: Admin@123!
- **Role**: Super Admin
- **Full Name**: Admin User

## 🧪 Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing instructions.

### Quick Tests

```bash
# Test setup status
curl http://localhost:3002/api/setup/database

# Test admin creation
curl -X POST http://localhost:3002/api/setup/admin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123!","fullName":"Test User","role":"Super Admin"}'
```

## 🔒 Security Features

- **Row Level Security (RLS)** on all database tables
- **Secure session management** with httpOnly cookies
- **CSRF protection** via Next.js middleware
- **Input validation** and sanitization
- **Role-based access control** (RBAC)
- **Environment variable protection**

## 🎨 UI Components

Built with shadcn/ui components:
- Buttons, inputs, labels
- Cards, dialogs, sheets
- Tables, forms, navigation
- Responsive design system

## 🚀 Deployment

### Environment Setup

1. Set production environment variables
2. Configure Supabase project settings
3. Update NEXT_PUBLIC_APP_URL
4. Build and deploy to Vercel/Netlify

### Production Build

```bash
npm run build
npm start
```

## 🔄 Next Steps

### Immediate Priorities

1. **Complete Dashboard**: Analytics and user management
2. **Supplier Management**: CRUD operations for suppliers
3. **Product Catalog**: Product management interface
4. **Order System**: Order tracking and management

### Future Enhancements

- Real-time notifications
- Advanced analytics with charts
- Email integration
- File upload handling
- API documentation
- Multi-language support

## 📚 Documentation

- [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) - Detailed setup guide
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing procedures
- [AUTOMATED_SETUP_GUIDE.md](./AUTOMATED_SETUP_GUIDE.md) - Setup overview

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit your changes
4. Push to branch
5. Create Pull Request

## 📞 Support

For issues and questions:

1. Check browser console for errors
2. Review setup documentation
3. Verify environment variables
4. Test database connection

---

**🎯 Current Status**: Development environment ready for testing and further development!

**📁 Next Project**: taant-supplier panel for supplier and product management