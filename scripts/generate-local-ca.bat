@echo off
echo Generating local SSL certificates for Taant domains...
echo.

REM Check if OpenSSL is available
openssl version >nul 2>&1
if %errorLevel% neq 0 (
    echo OpenSSL is not found in your PATH.
    echo Please install OpenSSL or use Git Bash which includes OpenSSL.
    echo.
    echo You can install OpenSSL from: https://slproweb.com/products/Win32OpenSSL.html
    echo Or use Git Bash and run this script from there.
    pause
    exit /b 1
)

echo Creating local Certificate Authority...
echo.

REM Create local CA
openssl genrsa -out traefik\ssl\ca-key.pem 4096
openssl req -new -x509 -days 3650 -key traefik\ssl\ca-key.pem -sha256 -out traefik\ssl\ca.pem -subj "/C=US/ST=State/L=City/O=Taant Local CA/CN=Taant Local Development"

echo Creating certificates for *.taant.in domains...
echo.

REM Create certificate for *.taant.in
openssl genrsa -out traefik\ssl\wildcard-key.pem 2048
openssl req -new -sha256 -key traefik\ssl\wildcard-key.pem -subj "/C=US/ST=State/L=City/O=Taant Development/CN=*.taant.in" -out traefik\ssl\wildcard.csr

echo Creating certificate extension for wildcard domains...
echo.

REM Create config for wildcard certificate
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

echo Signing certificate with local CA...
echo.

REM Sign the certificate
openssl x509 -req -in traefik\ssl\wildcard.csr -CA traefik\ssl\ca.pem -CAkey traefik\ssl\ca-key.pem -CAcreateserial -out traefik\ssl\wildcard.pem -days 3650 -sha256 -extfile traefik\ssl\wildcard-ext.cnf

echo.
echo Certificates generated successfully!
echo.
echo To trust the local CA on Windows:
echo 1. Right-click on traefik\ssl\ca.pem and select "Install Certificate"
echo 2. Select "Current User" or "Local Machine"
echo 3. Choose "Trusted Root Certification Authorities" as the store
echo 4. Click "Next" and "Finish"
echo.
echo After installing the CA, your browser will trust the HTTPS certificates.
echo.
pause