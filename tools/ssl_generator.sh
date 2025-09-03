#!/bin/bash

# directory for SSL certificates
mkdir -p backend/nginx/ssl

# get the local IP
LOCAL_IP=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -n1 | awk '{print $2}')

echo "Generating SSL certificates for IP: $LOCAL_IP"

# create configuration file for the certificate
cat > backend/nginx/ssl/openssl.conf << EOF
[req]
distinguished_name = req_distinguished_name
req_extensions = v3_req
prompt = no

[req_distinguished_name]
C = US
ST = State
L = City
O = Organization
CN = $LOCAL_IP

[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = localhost
DNS.2 = *.localhost
IP.1 = 127.0.0.1
IP.2 = $LOCAL_IP
IP.3 = 0.0.0.0
EOF

# gen private key
openssl genrsa -out backend/nginx/ssl/server.key 2048

# gen self-signed certificate
openssl req -new -x509 -key backend/nginx/ssl/server.key \
    -out backend/nginx/ssl/server.crt \
    -days 365 \
    -config backend/nginx/ssl/openssl.conf \
    -extensions v3_req

# verify the certificate
openssl x509 -in backend/nginx/ssl/server.crt -text -noout | grep -A 1 "Subject Alternative Name"

echo "SSL certificates generated successfully"
echo "Certificate: backend/nginx/ssl/server.crt"
echo "Private key: backend/nginx/ssl/server.key"
echo ""
echo "To access to the site use: https://$LOCAL_IP"
echo "Note: You will need to accept the self-signed certificate in your browser"

# set appropriate permissions
chmod 600 backend/nginx/ssl/server.key
chmod 644 backend/nginx/ssl/server.crt

echo "File permissions set correctly"
