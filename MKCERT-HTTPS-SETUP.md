# Laravel Herd-Style HTTPS Setup with mkcert

This setup provides **trusted HTTPS certificates** for your local development, just like Laravel Herd! No browser warnings, no manual certificate installation - everything works automatically.

## 🚀 Quick Setup (Recommended)

**Run as Administrator:**
```cmd
scripts\setup-mkcert-https.bat
```

That's it! Your applications will be available with trusted HTTPS:
- 🌐 https://taant.in (Frontend)
- 🛡️ https://admin.taant.in (Admin Panel)
- 📦 https://supplier.taant.in (Supplier Panel)
- ⚙️ https://backend.taant.in (Backend API)

## ✨ What Makes This Special?

- **🔒 Zero SSL Warnings**: Certificates are automatically trusted by your system
- **🚀 One-Command Setup**: Just run the script and everything works
- **🔄 Auto-Renewal**: Certificates are valid for years
- **🎯 Laravel Herd Experience**: Same smooth development experience

## 🔧 Manual Setup Steps

### 1. Install mkcert
```cmd
# Install Chocolatey (if not already installed)
# Run as Administrator in PowerShell:
Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install mkcert
choco install mkcert -y
```

### 2. Create Local Certificate Authority
```cmd
mkcert -install
```
This creates and installs a local CA that your system and browsers will trust.

### 3. Generate Certificates
```cmd
# Create SSL directory
mkdir traefik\ssl

# Generate certificates for your domains
mkcert -cert-file traefik\ssl\wildcard.pem -key-file traefik\ssl\wildcard-key.pem "*.taant.in" "taant.in" "*.localhost" "localhost"
```

### 4. Setup Hosts File
Add to `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1   taant.in
127.0.0.1   admin.taant.in
127.0.0.1   supplier.taant.in
127.0.0.1   backend.taant.in
```

### 5. Start Services
```cmd
docker-compose -f docker-compose.mkcert.yml up -d
```

## 🎯 Why This Works Better Than Regular SSL

### Regular SSL Certificates (What you tried before)
- ❌ Browser shows "Not Secure" warnings
- ❌ Need manual certificate installation
- ❌ Complex setup process
- ❌ System doesn't trust the certificates

### mkcert Certificates (Laravel Herd style)
- ✅ **Zero browser warnings** - completely trusted
- ✅ **Automatic setup** - no manual installation
- ✅ **System-wide trust** - works in all browsers
- ✅ **Developer-friendly** - just like production HTTPS

## 🔍 How mkcert Works

1. **Creates a local Certificate Authority** that your system trusts
2. **Generates certificates** signed by your trusted local CA
3. **Browsers automatically trust** certificates from your local CA
4. **Perfect local HTTPS** without any warnings

## 📁 File Structure

```
taant-docker/
├── scripts/
│   ├── setup-mkcert-https.bat    # Complete automated setup
│   ├── install-mkcert.bat        # Install mkcert and generate certs
│   └── install-mkcert.ps1        # PowerShell version
├── docker-compose.mkcert.yml     # Docker setup for mkcert
├── traefik/
│   ├── dynamic/
│   │   └── mkcert-ssl.yml        # SSL configuration
│   └── ssl/
│       ├── wildcard.pem          # Certificate file
│       └── wildcard-key.pem      # Private key
└── hosts-entry                   # Hosts file entries
```

## 🛠️ Commands Reference

### Start Services
```cmd
docker-compose -f docker-compose.mkcert.yml up -d
```

### Stop Services
```cmd
docker-compose -f docker-compose.mkcert.yml down
```

### View Logs
```cmd
docker-compose -f docker-compose.mkcert.yml logs -f
```

### Restart Services
```cmd
docker-compose -f docker-compose.mkcert.yml restart
```

### Access Traefik Dashboard
- URL: http://localhost:8080
- View routes, certificates, and service status

## 🔧 Troubleshooting

### Certificate Still Not Trusted?
1. **Restart your browser** after installing mkcert
2. **Clear browser cache** and SSL state
3. **Check if mkcert is installed**: `mkcert -version`
4. **Reinstall CA**: `mkcert -install`

### Port Conflicts?
```cmd
# Check what's using ports 80/443
netstat -ano | findstr :80
netstat -ano | findstr :443

# Stop conflicting services
net stop W3SVC  # Stop IIS if running
```

### Docker Issues?
```cmd
# Reset Docker network
docker network rm taant-network
docker network create taant-network

# Restart Docker Desktop
```

### regenerate Certificates?
```cmd
# Delete old certificates
del traefik\ssl\wildcard.*
# Generate new ones
mkcert -cert-file traefik\ssl\wildcard.pem -key-file traefik\ssl\wildcard-key.pem "*.taant.in" "taant.in"
```

## 🆚 Comparison: mkcert vs Regular SSL

| Feature | Regular SSL | mkcert |
|---------|-------------|---------|
| Browser Warnings | ❌ Always shows | ✅ Never shows |
| Setup Complexity | 🔴 Complex | 🟢 Simple |
| Certificate Trust | ❌ Manual install | ✅ Automatic |
| Developer Experience | 😕 Frustrating | 🎉 Smooth |
| Like Production | ❌ Different | ✅ Same feeling |

## 🎉 Success Criteria

When it's working correctly, you'll see:
- ✅ **Green padlock** in browser address bar
- ✅ **No security warnings** or certificate errors
- ✅ **HTTPS works automatically** in all browsers
- ✅ **Perfect local development** experience

That's it! You now have Laravel Herd-style HTTPS for your local development! 🚀