# OnDemandBakerySpringBootReact
# Best practice for an ecommerce project

## Deployment with Docker on Digital Ocean

This project is containerized using Docker, making it easy to deploy to Digital Ocean Droplets.

### Prerequisites

- Digital Ocean account
- Domain name pointing to your Digital Ocean Droplet (optional but recommended)
- SSH access to your Droplet

### Ubuntu 24 Deployment Steps

1. **Initial Server Setup**:
   ```bash
   # SSH into your server
   ssh root@your_droplet_ip
   
   # Update system packages
   apt update && apt upgrade -y
   
   # Install required packages (Docker already comes pre-installed on DO Ubuntu 24 images)
   apt install -y git curl certbot
   
   # Install Docker Compose v2 (Docker is already installed)
   mkdir -p ~/.docker/cli-plugins/
   curl -SL https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-linux-x86_64 -o ~/.docker/cli-plugins/docker-compose
   chmod +x ~/.docker/cli-plugins/docker-compose
   
   # Configure firewall if needed
   ufw allow ssh
   ufw allow http
   ufw allow https
   ufw enable
   ```

2. **Create Project Directory**:
   ```bash
   mkdir -p /opt/bakery-app
   cd /opt/bakery-app
   ```

3. **Get the Application Code**:
   ```bash
   # Option 1: Clone your repository (if you have one)
   git clone https://your-repository-url.git .
   
   # Option 2: Use SFTP to upload files from your local machine
   # From your local machine in a new terminal:
   # sftp root@your_droplet_ip
   # mkdir /opt/bakery-app
   # cd /opt/bakery-app
   # put -r * .
   ```

4. **Create Required Directories**:
   ```bash
   mkdir -p nginx/conf nginx/ssl nginx/logs
   mkdir -p certbot/www certbot/conf
   mkdir -p mysql/init mysql/conf
   ```

5. **Set Up Environment Files**:
   ```bash
   # Create backend .env file
   cat > ecspring/.env << 'EOL'
   MYSQL_HOST=db
   MYSQL_PORT=3306
   MYSQL_DATABASE=ec
   MYSQL_USER=bakery_user
   MYSQL_PASSWORD=secure_password
   MYSQL_ROOT_PASSWORD=secure_root_password
   
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USERNAME=your_email@gmail.com
   MAIL_PASSWORD=your_app_password
   
   JWT_SECRET=$(openssl rand -base64 32)
   JWT_ACCESS_EXPIRATION=3600000
   JWT_REFRESH_EXPIRATION=604800000
   
   FRONTEND_URL=https://your-domain.com
   EOL
   
   # Create frontend .env file
   cat > ecfront/ec-front/.env << 'EOL'
   NEXT_PUBLIC_API_BASE_URL=/api
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   EOL
   
   # Edit the environment files with your actual values
   nano ecspring/.env
   nano ecfront/ec-front/.env
   ```

6. **Set Up Nginx Configuration**:
   ```bash
   # Create basic Nginx config
   cat > nginx/conf/default.conf << 'EOL'
   server {
       listen 80;
       server_name _;
       
       location /.well-known/acme-challenge/ {
           root /var/www/certbot;
       }
       
       location / {
           proxy_pass http://frontend:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_cache_bypass $http_upgrade;
       }
       
       location /api/ {
           proxy_pass http://backend:8080/;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_read_timeout 90;
       }
   }
   EOL
   ```

7. **Start the Application**:
   ```bash
   # Run Docker Compose to start all services
   docker compose up -d
   ```

8. **SSL Setup (if you have a domain)**:
   ```bash
   # Install certbot Docker image
   docker run -it --rm \
     -v "$(pwd)/certbot/conf:/etc/letsencrypt" \
     -v "$(pwd)/certbot/www:/var/www/certbot" \
     certbot/certbot certonly --webroot \
     --webroot-path=/var/www/certbot \
     --email your-email@example.com \
     --agree-tos --no-eff-email \
     -d your-domain.com
   
   # Update Nginx config with SSL
   cat > nginx/conf/default.conf << 'EOL'
   server {
       listen 80;
       server_name your-domain.com;
       
       location /.well-known/acme-challenge/ {
           root /var/www/certbot;
       }
       
       location / {
           return 301 https://$host$request_uri;
       }
   }
   
   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       
       location / {
           proxy_pass http://frontend:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_cache_bypass $http_upgrade;
       }
       
       location /api/ {
           proxy_pass http://backend:8080/;
           proxy_http_version 1.1;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_read_timeout 90;
       }
   }
   EOL
   
   # Reload Nginx to apply SSL config
   docker compose restart nginx
   ```

9. **Set Up Auto-Renewal for SSL Certificate**:
   ```bash
   # Create renewal script
   cat > renew-cert.sh << 'EOL'
   #!/bin/bash
   docker compose run --rm certbot renew
   docker compose restart nginx
   EOL
   
   chmod +x renew-cert.sh
   
   # Set up cron job to run twice a month
   (crontab -l 2>/dev/null; echo "0 0 1,15 * * /opt/bakery-app/renew-cert.sh") | crontab -
   ```

10. **Verify Deployment**:
    ```bash
    # Check if containers are running
    docker compose ps
    
    # Check backend logs
    docker compose logs backend
    
    # Check frontend logs
    docker compose logs frontend
    ```

### Troubleshooting

If you encounter issues:

1. **Container won't start**:
   ```bash
   # Check logs
   docker compose logs [service_name]
   ```

2. **Database connection issues**:
   ```bash
   # Check if MySQL is running
   docker compose ps db
   
   # Check MySQL logs
   docker compose logs db
   ```

3. **Nginx errors**:
   ```bash
   # Check Nginx logs
   docker compose logs nginx
   
   # Test Nginx configuration
   docker compose exec nginx nginx -t
   ```

4. **Permission issues**:
   ```bash
   # Fix ownership
   chown -R 1001:1001 /opt/bakery-app/ecfront/ec-front/.next
   chown -R 1001:1001 /opt/bakery-app/ecfront/ec-front/node_modules
   ```

### Management Commands

* **Restart services**:
  ```bash
  docker compose restart [service_name]
  ```

* **Update application**:
  ```bash
  # Pull latest code
  git pull
  
  # Rebuild and restart
  docker compose up -d --build
  ```

* **View application logs**:
  ```bash
  docker compose logs -f [service_name]
  ```

* **Backup database**:
  ```bash
  docker compose exec db sh -c 'exec mysqldump -u$MYSQL_USER -p$MYSQL_PASSWORD $MYSQL_DATABASE' > backup.sql
  ```

### Security Considerations

1. All sensitive environment variables are kept in `.env` files
2. Database is only accessible within the Docker network
3. Use strong passwords for all credentials
4. Set up SSL for encrypted connections
5. Keep your system updated with `apt update && apt upgrade -y`
6. Consider using a firewall with limited open ports
7. Set up regular database backups
