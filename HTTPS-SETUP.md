# Taant Local HTTPS Setup with Traefik

This setup provides secure HTTPS access to your Taant applications using custom local domains with valid SSL certificates.

## Quick Setup

1. **Run the automated setup script (as Administrator):**
   ```bash
   scripts\setup-traefik-ssl.bat
   ```

2. **Install the local CA certificate:**
   - Open `traefik\ssl\ca.pem`
   - Right-click and select "Install Certificate"
   - Choose "Current User" or "Local Machine"
   - Select "Trusted Root Certification Authorities"
   - Complete the installation

3. **Start the services:**
   ```bash
   docker-compose -f docker-compose.local-ssl.yml up -d
   ```

## Access Your Applications

- **Frontend**: https://taant.in
- **Admin Panel**: https://admin.taant.in
- **Supplier Panel**: https://supplier.taant.in
- **Backend API**: https://backend.taant.in
- **Traefik Dashboard**: http://localhost:8080

## Manual Setup Steps

### 1. Configure Local DNS

Add these entries to your `C:\Windows\System32\drivers\etc\hosts` file:
```
127.0.0.1   taant.in
127.0.0.1   admin.taant.in
127.0.0.1   supplier.taant.in
127.0.0.1   backend.taant.in
```

Or run: `scripts\setup-hosts.bat` (as Administrator)

### 2. Generate SSL Certificates

```bash
scripts\generate-local-ca.bat
```

This creates:
- Local Certificate Authority (`ca.pem`)
- Wildcard certificate for `*.taant.in` domains
- Valid for 10 years

### 3. Install Local CA Certificate

1. Double-click `traefik\ssl\ca.pem`
2. Select "Install Certificate"
3. Choose "Current User" or "Local Machine"
4. Browse to "Trusted Root Certification Authorities"
5. Complete the wizard

### 4. Start Services

```bash
# For local SSL certificates
docker-compose -f docker-compose.local-ssl.yml up -d

# Or for Let's Encrypt (requires real domains)
docker-compose -f docker-compose.traefik.yml up -d
```

## Docker Compose Files

### `docker-compose.local-ssl.yml`
- Uses locally generated SSL certificates
- Works offline
- Best for development

### `docker-compose.traefik.yml`
- Uses Let's Encrypt for automatic certificates
- Requires real domains and internet connectivity
- Best for production

## Directory Structure

```
taant-docker/
├── traefik/
│   ├── traefik.yml           # Traefik static configuration
│   ├── dynamic/
│   │   └── ssl.yml          # SSL certificate configuration
│   ├── ssl/
│   │   ├── ca.pem           # Local Certificate Authority
│   │   ├── ca-key.pem       # CA private key
│   │   ├── wildcard.pem     # Wildcard certificate
│   │   └── wildcard-key.pem # Certificate private key
│   └── acme/
│       └── acme.json        # Let's Encrypt storage (if used)
├── scripts/
│   ├── setup-hosts.bat      # Add domains to hosts file
│   ├── remove-hosts.bat     # Remove domains from hosts file
│   ├── generate-local-ca.bat # Generate SSL certificates
│   ├── setup-traefik-ssl.bat # Complete setup script
│   └── teardown-traefik-ssl.bat # Cleanup script
├── docker-compose.local-ssl.yml  # Local SSL setup
└── docker-compose.traefik.yml    # Let's Encrypt setup
```

## Configuration Details

### Environment Variables

Update your `.env` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Application URLs

The applications are configured to use HTTPS URLs:

- Frontend: `https://taant.in`
- Admin: `https://admin.taant.in`
- Supplier: `https://supplier.taant.in`
- Backend: `https://backend.taant.in`

### CORS Configuration

Backend is configured to accept requests from all HTTPS subdomains.

## Troubleshooting

### Certificate Not Trusted
1. Ensure you installed `ca.pem` as a trusted root certificate
2. Restart your browser after installing the certificate
3. Clear browser cache and SSL state

### Domains Not Resolving
1. Verify hosts file entries are correct
2. Run `ipconfig /flushdns` in Command Prompt
3. Check that Docker containers are running

### Traefik Issues
1. Check Traefik logs: `docker logs traefik-local`
2. Access Traefik dashboard: http://localhost:8080
3. Verify configuration files exist and are readable

### Port Conflicts
1. Ensure ports 80, 443, and 8080 are available
2. Stop other web servers or services using these ports

## Cleanup

To remove the complete setup:

```bash
scripts\teardown-traefik-ssl.bat
```

This will:
- Stop and remove Docker containers
- Remove domain entries from hosts file
- Leave SSL certificates for potential reuse

## Security Notes

- The local CA certificate should only be used for development
- Never share the CA private key (`ca-key.pem`)
- For production, use real domains and Let's Encrypt
- Keep your `.env` file secure and never commit it to version control