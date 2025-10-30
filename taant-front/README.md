# Taant Frontend

Next.js frontend for Taant marketplace.

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
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Development

This project is part of a workspace with multiple services. See the main workspace README for complete Docker setup instructions.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_API_URL`: Backend API URL (http://localhost:4000 for local development)

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## Docker Development

This project is part of a workspace with multiple services. To run the complete development environment:

1. Clone all three repositories:
   - `taant-front` (this repo)
   - `taant-supplier`
   - `taant-backend`

2. Create a workspace directory and place all three repos inside:
   ```
   taant-workspace/
   ├── taant-front/
   ├── taant-supplier/
   ├── taant-backend/
   └── docker-compose.dev.yml
   ```

3. Copy the provided `docker-compose.dev.yml` to the workspace root

4. Configure environment variables for each service:
   ```bash
   # In taant-front/
   cp .env.example .env

   # In taant-supplier/
   cp .env.example .env

   # In taant-backend/
   cp .env.example .env
   ```

5. Run the development environment:
   ```bash
   docker-compose -f docker-compose.dev.yml up
   ```

Services will be available at:
- Frontend: http://localhost:3000
- Supplier Portal: http://localhost:3001
- Backend API: http://localhost:4000