# Manual Setup Steps (If Scripts Don't Work)

## Step 1: Add Domains to Hosts File

1. **Open Notepad as Administrator**
   - Right-click Notepad → "Run as administrator"

2. **Open the hosts file**
   - File → Open
   - Navigate to: `C:\Windows\System32\drivers\etc\hosts`
   - Change "Text Documents (*.txt)" to "All Files (*.*)"
   - Open `hosts` file

3. **Add these lines at the end:**
   ```
   127.0.0.1   taant.in
   127.0.0.1   admin.taant.in
   127.0.0.1   supplier.taant.in
   127.0.0.1   backend.taant.in
   ```

4. **Save and close the file**

## Step 2: Install OpenSSL (If needed)

1. **Download OpenSSL:** https://slproweb.com/products/Win32OpenSSL.html
2. **Download the 64-bit Light version**
3. **Install with default settings**
4. **Restart your command prompt/PowerShell**

## Step 3: Generate SSL Certificates

**Option A: Using Git Bash (Recommended)**
```bash
# Navigate to your project directory
cd /d/project-taant-docker

# Run the certificate generation
bash scripts/generate-local-ca.bat
```

**Option B: Using Command Prompt**
```cmd
# Navigate to your project directory
cd D:\project-taant-docker

# Run the certificate generation
scripts\generate-local-ca.bat
```

**Option C: Manual OpenSSL Commands**
```cmd
# Create directories
mkdir traefik\ssl

# Generate CA
openssl genrsa -out traefik\ssl\ca-key.pem 4096
openssl req -new -x509 -days 3650 -key traefik\ssl\ca-key.pem -sha256 -out traefik\ssl\ca.pem -subj "/C=US/ST=State/L=City/O=Taant Local CA/CN=Taant Local Development"

# Generate wildcard certificate
openssl genrsa -out traefik\ssl\wildcard-key.pem 2048
openssl req -new -sha256 -key traefik\ssl\wildcard-key.pem -subj "/C=US/ST=State/L=City/O=Taant Development/CN=*.taant.in" -out traefik\ssl\wildcard.csr

# Create extension file
echo authorityKeyIdentifier=keyid,issuer > traefik\ssl\wildcard-ext.cnf
echo basicConstraints=CA:FALSE >> traefik\ssl\wildcard-ext.cnf
echo keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment >> traefik\ssl\wildcard-ext.cnf
echo subjectAltName = @alt_names >> traefik\ssl\wildcard-ext.cnf
echo [alt_names] >> traefik\ssl\wildcard-ext.cnf
echo DNS.1 = taant.in >> traefik\ssl\wildcard-ext.cnf
echo DNS.2 = *.taant.in >> traefik\ssl\wildcard-ext.cnf
echo DNS.3 = admin.taant.in >> traefik\ssl\wildcard-ext.cnf
echo DNS.4 = supplier.taant.in >> traefik\ssl\wildcard-ext.cnf
echo DNS.5 = backend.taant.in >> traefik\ssl\wildcard-ext.cnf

# Sign the certificate
openssl x509 -req -in traefik\ssl\wildcard.csr -CA traefik\ssl\ca.pem -CAkey traefik\ssl\ca-key.pem -CAcreateserial -out traefik\ssl\wildcard.pem -days 3650 -sha256 -extfile traefik\ssl\wildcard-ext.cnf

# Cleanup
del traefik\ssl\wildcard.csr
del traefik\ssl\wildcard-ext.cnf
```

## Step 4: Install the Local CA Certificate

1. **Navigate to:** `traefik\ssl\ca.pem`
2. **Double-click the file**
3. **Click "Install Certificate"**
4. **Select "Current User" or "Local Machine"**
5. **Choose "Trusted Root Certification Authorities"**
6. **Click "Next" and "Finish"**
7. **Click "Yes" on the security warning**
8. **Click "OK" when done**

## Step 5: Start Docker Services

```cmd
# Create Docker network
docker network create taant-network

# Start the services
docker-compose -f docker-compose.local-ssl.yml up -d
```

## Step 6: Test the Setup

Open your browser and navigate to:
- https://taant.in (Frontend)
- https://admin.taant.in (Admin Panel)
- https://supplier.taant.in (Supplier Panel)
- https://backend.taant.in (Backend API)
- http://localhost:8080 (Traefik Dashboard)

**Important:** If you see certificate warnings, make sure you:
1. Installed the CA certificate correctly
2. Restarted your browser after installation
3. Cleared browser cache and SSL state

## Troubleshooting

### Certificate Not Trusted
- Ensure you installed `ca.pem` as a trusted root certificate
- Restart browser after installing
- Check if certificate appears in "Trusted Root Certification Authorities"

### Domains Not Working
- Verify hosts file entries are correct
- Run `ipconfig /flushdns` in Command Prompt
- Check Docker containers are running

### Port Conflicts
- Stop other web servers using ports 80, 443, 8080
- Check if Skype or other apps are using port 443

### Docker Issues
- Ensure Docker Desktop is running
- Check if containers start: `docker-compose -f docker-compose.local-ssl.yml ps`
- View logs: `docker-compose -f docker-compose.local-ssl.yml logs`