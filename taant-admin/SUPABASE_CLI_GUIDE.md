# 🚀 Supabase CLI Setup Guide for Taant Admin

## 📋 Overview

We've implemented a **Supabase CLI-like system** directly within the Next.js application. This provides automated database migrations without requiring external CLI installation, making the setup process seamless and web-based.

## 🎯 What This System Does

✅ **Initialize Project Structure** - Creates Supabase project files and directories
✅ **Create Migration Files** - Timestamped SQL migration files like `supabase migration new`
✅ **Apply Migrations** - Push pending migrations to database like `supabase db push`
✅ **Track Migration Status** - Monitor applied vs pending migrations
✅ **Web-Based Interface** - Complete setup through browser UI
✅ **Version Control Ready** - All migrations are git-tracked SQL files

## 🌐 Access the CLI System

**Development Server**: http://localhost:3004/setup
**API Endpoints**:
- `GET/POST /api/supabase/status` - Check migration status
- `POST /api/supabase/init` - Initialize project
- `POST /api/supabase/push` - Apply migrations

## 📁 Project Structure

```
taant-admin/
├── supabase/
│   ├── config.toml              # Supabase project configuration
│   ├── migrations/              # SQL migration files
│   │   ├── 20251031_17210_initial_schema.sql
│   │   └── ...
│   └── functions/               # Edge functions (future)
├── src/
│   ├── lib/
│   │   └── supabase-cli.ts    # CLI implementation
│   └── app/api/supabase/       # CLI API endpoints
│       ├── init/route.ts
│       ├── push/route.ts
│       └── status/route.ts
└── app/setup/page.tsx           # CLI-based setup UI
```

## 🔄 CLI Workflow

### 1. **Initialize Project** (like `supabase init`)
```bash
# Through the UI:
1. Visit http://localhost:3004/setup
2. Click "Initialize" button
3. Creates initial migration files

# Or via API:
curl -X POST http://localhost:3004/api/supabase/init
```

### 2. **Check Status** (like `supabase db status`)
```bash
# Through the UI:
1. View "Migration Status" section
2. Shows applied/pending migrations

# Or via API:
curl http://localhost:3004/api/supabase/status
```

### 3. **Push Migrations** (like `supabase db push`)
```bash
# Through the UI:
1. Click "Push" button in setup actions
2. Applies all pending migrations
3. Shows applied migration results

# Or via API:
curl -X POST http://localhost:3004/api/supabase/push
```

### 4. **Create New Migration** (like `supabase migration new`)
```bash
# Create timestamped migration files:
# Example: 20251031_15000_add_products_table.sql

# Edit migration files in supabase/migrations/
```

## 🧩 Migration Files

### **Initial Schema Migration**
`supabase/migrations/20251031_17210_initial_schema.sql`:
- ✅ Profiles table with user management
- ✅ Admin roles and permissions system
- ✅ Row Level Security (RLS) policies
- ✅ Triggers and functions
- ✅ Default admin roles

### **Adding New Migrations**
1. **Create migration file manually**:
   ```bash
   # Format: TIMESTAMP_name.sql
   # Example: 20251031_15000_add_products_table.sql
   ```

2. **Add SQL content**:
   ```sql
   -- Migration: add_products_table
   -- Created: 2025-10-31T15:00:00.000Z
   CREATE TABLE IF NOT EXISTS public.products (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     name TEXT NOT NULL,
     price NUMERIC(10,2) NOT NULL,
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

3. **Apply migration**:
   - Click "Push" in setup UI
   - Or call `POST /api/supabase/push`

## 🛠️ Advanced CLI Features

### **Migration Tracking**
- **Schema Migrations Table**: Tracks applied migrations
- **Version Control**: Each migration has unique timestamp version
- **Dependency Management**: Migrations applied in timestamp order
- **Rollback Support**: Can reset database to clean state

### **Web Interface Features**
- **Real-time Status**: Live migration status updates
- **Progress Indicators**: Visual feedback during operations
- **Error Handling**: Clear error messages and recovery options
- **Manual SQL Display**: SQL content for manual execution if needed

## 🔄 Development Workflow

### **Standard Development Cycle**
1. **Make schema changes** → Create new migration
2. **Test locally** → Push migrations to test database
3. **Commit to Git** → Migration files are version controlled
4. **Deploy to Production** → Push migrations to production database

### **Example: Adding New Table**
1. **Create migration**:
   ```sql
   -- File: 20251031_15000_add_orders_table.sql
   CREATE TABLE IF NOT EXISTS public.orders (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     customer_id UUID REFERENCES profiles(id),
     total_amount NUMERIC(10,2) NOT NULL,
     status TEXT DEFAULT 'pending',
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Apply migrations**:
   ```bash
   # Push via UI or API
   curl -X POST http://localhost:3004/api/supabase/push
   ```

3. **Verify**:
   - Check status in UI
   - Verify table exists in database
   - Update application code to use new table

## 🔒 Security Considerations

### **Service Role Access**
- Uses `SUPABASE_SERVICE_ROLE_KEY` for database operations
- Service role key has elevated permissions for schema changes
- Never expose service role key to client-side code

### **Migration Safety**
- **Idempotent Migrations**: Uses `IF NOT EXISTS` statements
- **Transaction Safety**: Each migration runs independently
- **Error Handling**: Failed migrations don't corrupt database state
- **Backup Tracking**: Migration history preserved

### **Web Security**
- API endpoints protected by Next.js middleware
- Authentication required for admin operations
- Input validation on all migration operations

## 🧪 Testing the CLI System

### **Test Setup Commands**
```bash
# Check current status
curl http://localhost:3004/api/supabase/status

# Initialize project (if not already done)
curl -X POST http://localhost:3004/api/supabase/init

# Apply pending migrations
curl -X POST http://localhost:3004/api/supabase/push

# Test setup page
curl http://localhost:3004/setup
```

### **Expected Responses**
```json
// Status Response
{
  "success": true,
  "message": "✅ All migrations applied",
  "applied": ["20251031_17210_initial_schema"],
  "pending": []
}

// Push Response
{
  "success": true,
  "message": "✅ Applied 1 migration(s) successfully!",
  "applied": [
    {
      "version": "20251031_17210_initial_schema",
      "name": "initial_schema",
      "filename": "20251031_17210_initial_schema.sql"
    }
  ]
}
```

## 📱 Deployment Integration

### **CI/CD Ready**
The CLI system is designed to work with automated deployment pipelines:

```yaml
# Example GitHub Actions
name: Apply Supabase Migrations
on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Apply migrations
        run: curl -X POST ${{ secrets.API_URL }}/api/supabase/push
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
```

### **Environment Configuration**
```env
# .env.local (development)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXT_PUBLIC_APP_URL=http://localhost:3004

# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supababase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🎯 Benefits Over Manual Setup

### **Before Manual Setup**
- ❌ Copy/paste SQL manually
- ❌ Track applied migrations manually
- ❌ Risk of schema drift between environments
- ❌ No version control of database changes
- ❌ Error-prone manual process

### **After CLI-Based Setup**
- ✅ One-click initialization
- ✅ Automated migration tracking
- ✅ Version-controlled schema changes
- ✅ Consistent environments
- ✅ Professional development workflow
- ✅ CI/CD integration ready
- ✅ Rollback capabilities

## 📊 Migration Status Examples

### **Fresh Installation**
```json
{
  "success": true,
  "message": "⚠️ 1 pending migration",
  "applied": [],
  "pending": [
    {
      "version": "20251031_17210_initial_schema",
      "name": "initial_schema",
      "filename": "20251031_17210_initial_schema.sql"
    }
  ]
}
```

### **After Initial Setup**
```json
{
  "success": true,
  "message": "✅ All migrations applied",
  "applied": ["20251031_17210_initial_schema"],
  "pending": []
}
```

### **Multiple Pending Migrations**
```json
{
  "success": true,
  "message": "⚠️ 3 pending migrations",
  "applied": ["20251031_17210_initial_schema"],
  "pending": [
    {
      "version": "20251031_17300_add_categories_table",
      "name": "add_categories_table",
      "filename": "20251031_17300_add_categories_table.sql"
    },
    {
      "version": "20251031_17400_add_products_table",
      "name": "add_products_table",
      "filename": "20251031_17400_add_products_table.sql"
    },
    {
      "version": "20251031_17500_add_orders_table",
      "name": "add_orders_table",
      "filename": "20251031_17500_add_orders_table.sql"
    }
  ]
}
```

## 🎉 Ready for Production!

Your Taant Admin Panel now has a **production-ready Supabase CLI system** that provides:

- **✅ Automated database setup**
- **✅ Version-controlled migrations**
- **✅ Professional development workflow**
- **✅ CI/CD integration ready**
- **✅ No external dependencies**
- **✅ Complete web-based interface**

The CLI system eliminates manual SQL execution and provides a seamless, automated setup experience that rivals the official Supabase CLI while being fully integrated into your Next.js application.

---

**🚀 Start using your CLI-powered admin panel at http://localhost:3004/setup!**