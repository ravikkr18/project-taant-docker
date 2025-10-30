# Taant Backend API

NestJS TypeScript backend API for Taant marketplace with Supabase authentication.

## Development

### Prerequisites
- Node.js 20+
- Docker (optional, for containerized development)

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your Supabase configuration
```

3. Run development server:
```bash
npm run start:dev
```

API will be available at [http://localhost:4000](http://localhost:4000).

### Docker Development

This project is part of a workspace with multiple services. See the main workspace README for complete Docker setup instructions.

## API Endpoints

### Public Endpoints
- `GET /health` - Health check endpoint

### Protected Endpoints (Requires Bearer Token)
- `GET /profile` - Get current user profile

## Environment Variables

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key (server-only)
- `PORT`: Server port (default: 4000)

## Scripts

- `npm run start:dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint
- `npm run test`: Run tests