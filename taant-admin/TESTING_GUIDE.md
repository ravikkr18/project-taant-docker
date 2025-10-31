# 🧪 Taant Admin Panel - Testing Guide

## 🎯 Testing Overview

This guide provides step-by-step instructions to test your Taant Admin Panel setup and ensure everything is working correctly.

## 🚀 Quick Test Checklist

- [ ] **Environment Setup**: Verify environment variables are configured
- [ ] **Server Access**: Confirm admin panel loads correctly
- [ ] **Setup Page**: Test setup status detection
- [ ] **Database Setup**: Verify manual SQL setup process
- [ ] **Admin Creation**: Test admin user creation
- [ ] **Login Flow**: Verify authentication works
- [ ] **Dashboard Access**: Confirm admin dashboard loads

## 📋 Detailed Testing Steps

### 1. Environment & Server Test

1. **Verify server is running**:
   - Open browser: http://localhost:3002
   - Should redirect to `/setup` if database not configured
   - Should show setup page with proper status

2. **Check setup status detection**:
   - Visit: http://localhost:3002/api/setup/database
   - Should return JSON response with setup status
   - Example response:
     ```json
     {
       "setup": {
         "tablesExist": false,
         "profilesTable": false,
         "adminRolesTable": false
       }
     }
     ```

### 2. Setup Page Testing

1. **Visual verification**:
   - ✅ Setup page loads without errors
   - ✅ Shows setup status with "❌ Not Set Up" indicators
   - ✅ Displays SQL script with syntax highlighting
   - ✅ "📋 Copy SQL" button works
   - ✅ "🔄 Refresh Status" button works

2. **Manual setup instructions**:
   - ✅ Clear step-by-step instructions are displayed
   - ✅ SQL script is properly formatted and complete
   - ✅ Copy-to-clipboard functionality works

### 3. Database Setup Testing

⚠️ **Important**: This requires manual intervention in Supabase Dashboard

1. **Test SQL script execution**:
   - Copy SQL from setup page
   - Go to your Supabase Dashboard → SQL Editor
   - Paste and execute the SQL
   - Verify all tables are created successfully

2. **Verify table creation**:
   ```sql
   -- Check if tables exist
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public'
   AND table_name IN ('profiles', 'admin_roles', 'admin_users');
   ```

3. **Test setup status refresh**:
   - Return to setup page: http://localhost:3002/setup
   - Click "🔄 Refresh Status"
   - Should show "✅ Ready" for all tables

### 4. Admin User Creation Testing

1. **Test form validation**:
   - Submit empty form → Should show validation errors
   - Test with invalid email → Should show email validation
   - Test with weak password → Should show password requirements

2. **Create admin user**:
   - Fill in admin form with valid data:
     - Email: `test@taant.com`
     - Password: `Test@123!`
     - Full Name: `Test Admin`
     - Role: `Super Admin`
   - Click "Create Admin User"

3. **Verify admin creation**:
   - Should show success message with credentials
   - Should redirect to login page after 3 seconds
   - Check browser console for any errors

### 5. Login Flow Testing

1. **Test login page**:
   - Visit: http://localhost:3002/login
   - Should show login form with email/password fields
   - Should have "Sign In" button

2. **Test authentication**:
   - Use the admin credentials created in previous step
   - Click "Sign In"
   - Should redirect to dashboard on success

3. **Test invalid login**:
   - Try wrong password → Should show error message
   - Try non-existent email → Should show error message
   - Try empty fields → Should show validation errors

### 6. Dashboard Testing

1. **Verify dashboard access**:
   - After successful login, should redirect to `/dashboard`
   - Should show admin dashboard interface
   - Should display user information and navigation

2. **Test authentication middleware**:
   - Try accessing `/dashboard` without login → Should redirect to `/login`
   - Try accessing `/setup` after setup → Should redirect to `/dashboard`

## 🔍 Common Issues & Solutions

### Issue: "User profile not found" error

**Cause**: Database tables not created or admin user not properly created

**Solution**:
1. Verify SQL script executed successfully in Supabase
2. Check `profiles` table for the admin user record
3. Ensure admin_users record was created

### Issue: Setup page shows connection errors

**Cause**: Supabase credentials incorrect or project not active

**Solution**:
1. Verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
2. Check Supabase project is active (not paused)
3. Test connection with curl or browser API call

### Issue: Admin user creation fails

**Cause**: Tables don't exist or role constraint violation

**Solution**:
1. Refresh setup status to confirm tables exist
2. Check admin_roles table contains required roles
3. Verify email isn't already in use

## 🧪 Automated Testing Commands

### Test API endpoints

```bash
# Test setup status endpoint
curl http://localhost:3002/api/setup/database

# Test admin creation endpoint
curl -X POST http://localhost:3002/api/setup/admin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test@123!","fullName":"Test User","role":"Super Admin"}'
```

### Test database connection (via browser console)

```javascript
// Test in browser console on setup page
fetch('/api/setup/database')
  .then(r => r.json())
  .then(console.log)
```

## ✅ Success Criteria

Your Taant Admin Panel is successfully set up when:

- [x] Setup page loads and shows proper status
- [x] SQL script can be copied and executed in Supabase
- [x] Setup status shows "✅ Ready" after SQL execution
- [x] Admin user can be created without errors
- [x] Login works with created admin credentials
- [x] Dashboard loads after successful authentication
- [x] Navigation between pages works correctly
- [x] Authentication middleware protects routes properly

## 📝 Test Results Template

Use this template to track your testing progress:

```
Date: [Test Date]
Environment: [Development/Production]
Tester: [Your Name]

✅ Environment Setup - PASS/FAIL
✅ Server Access - PASS/FAIL
✅ Setup Page - PASS/FAIL
✅ Database Setup - PASS/FAIL
✅ Admin Creation - PASS/FAIL
✅ Login Flow - PASS/FAIL
✅ Dashboard Access - PASS/FAIL

Notes:
[Additional notes about issues or observations]

Issues Found:
[Document any issues discovered]

Resolution:
[How issues were resolved]
```

---

**🎯 Complete all testing steps before proceeding to supplier panel development!**