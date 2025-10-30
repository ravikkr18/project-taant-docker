# Taant Marketplace - Complete Development Workspace

This workspace contains the complete development setup for the Taant marketplace, including three interconnected applications:

- **taant-front** - Main customer frontend (Next.js)
- **taant-supplier** - Supplier portal (Next.js)
- **taant-backend** - API server (NestJS)

## Quick Start

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- Git

### 1. Repository Setup

All repositories are already created and pushed to GitHub:
- https://github.com/ravikkr18/taant-front
- https://github.com/ravikkr18/taant-supplier
- https://github.com/ravikkr18/taant-backend

### 2. Environment Configuration

The workspace is already configured with your Supabase credentials. Just need to add the service role key:

1. Get your service role key from [Supabase Dashboard](https://supabase.com/dashboard/project/lyteoxnqkjrpilrfcimc/settings/api)
2. Update `.env` file and `taant-backend/.env` with the service role key

### 3. Supabase Database Setup

Apply the database schema:

1. Go to [Supabase SQL Editor](https://supabase.com/dashboard/project/lyteoxnqkjrpilrfcimc/sql)
2. Run the contents of `001_init_tables.sql`
3. Run the contents of `rls_policies.sql`
4. Run the contents of `storage_policies.sql`

### 4. Docker Development

Start the complete development environment:

```bash
docker-compose -f docker-compose.dev.yml up
```

Services will be available at:
- **Frontend**: http://localhost:3000
- **Supplier Portal**: http://localhost:3001
- **Backend API**: http://localhost:4000

### 5. Local Development (Alternative)

You can also run services individually:

```bash
# Frontend
cd taant-front
npm install
npm run dev

# Supplier Portal
cd taant-supplier
npm install
npm run dev

# Backend API
cd taant-backend
npm install
npm run start:dev
```

## Environment Variables

All services are pre-configured with your Supabase project details:

- **Project URL**: https://lyteoxnqkjrpilrfcimc.supabase.co
- **Anon Key**: Already configured in all services
- **Service Role Key**: Add to backend environments

## API Endpoints

### Public
- `GET http://localhost:4000/health` - Health check

### Protected (Requires JWT token)
- `GET http://localhost:4000/profile` - User profile

## Authentication Setup

1. Go to [Supabase Authentication](https://supabase.com/dashboard/project/lyteoxnqkjrpilrfcimc/auth/providers)
2. Enable Google OAuth (or other providers)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3001/auth/callback`

## Development Workflow

### Making Changes
- Edit files in respective service directories
- Docker containers support hot-reload for automatic updates
- Changes are reflected immediately in browser

### Database Changes
- Make changes in Supabase Dashboard SQL Editor
- Or create new migration files and apply via Supabase CLI

### Adding Dependencies
```bash
cd service-name
npm install new-package
docker-compose -f ../docker-compose.dev.yml build service-name
```

## File Structure

```
taant-project/
├── taant-front/          # Customer frontend
├── taant-supplier/       # Supplier portal
├── taant-backend/        # API server
├── docker-compose.dev.yml # Docker orchestration
├── .env                  # Environment variables
├── 001_init_tables.sql   # Database schema
├── rls_policies.sql      # Security policies
├── storage_policies.sql  # File upload policies
└── README.md            # This file
```

## Troubleshooting

### Port Conflicts
Ensure ports 3000, 3001, and 4000 are available

### Docker Issues
```bash
# Rebuild containers
docker-compose -f docker-compose.dev.yml build

# View logs
docker-compose -f docker-compose.dev.yml logs

# Reset environment
docker-compose -f docker-compose.dev.yml down
docker system prune -f
```

### Database Connection
- Verify Supabase project is active
- Check service role key is correctly configured
- Ensure RLS policies are applied

## Production Deployment

When ready for production:

1. Configure GitHub repository secrets
2. Set up production domains and SSL
3. Configure CI/CD pipelines
4. Set up monitoring and logging

## Support

For issues or questions:
- Check individual service README files
- Review Supabase documentation
- Contact development team

---

**Generated with [Claude Code](https://claude.com/claude-code)**