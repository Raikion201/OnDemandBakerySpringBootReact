#!/bin/bash

# Exit on error
set -e

# Set variables
DOMAIN="your-domain.com"
EMAIL="your-email@example.com"

# Create required directories
mkdir -p nginx/conf nginx/ssl nginx/logs
mkdir -p certbot/www certbot/conf
mkdir -p mysql/init mysql/conf

# Create initial Nginx config for Let's Encrypt
cat > nginx/conf/default.conf <<EOL
server {
    listen 80;
    server_name _;
    
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
    
    location / {
        return 301 https://\$host\$request_uri;
    }
}
EOL

# Start Nginx to obtain SSL certificate
docker-compose up -d nginx

# Get SSL certificate
docker-compose run --rm certbot certonly --webroot -w /var/www/certbot \
    --email $EMAIL --agree-tos --no-eff-email \
    -d $DOMAIN

# Replace SSL certificate paths in Nginx config
sed -i "s/your-domain.com/$DOMAIN/g" nginx/conf/default.conf

# Start all services
docker-compose up -d

echo "Deployment completed successfully!"
echo "Visit https://$DOMAIN to access your application"
