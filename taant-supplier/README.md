# Taant Supplier Portal

Next.js TypeScript supplier portal for Taant marketplace.

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

Open [http://localhost:3001](http://localhost:3001) in your browser.

### Docker Development

This project is part of a workspace with multiple services. See the main workspace README for complete Docker setup instructions.

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint