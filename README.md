# InkAlchemy - Worldbuilding Management Platform

A comprehensive worldbuilding and story management platform designed for writers and creators. InkAlchemy provides an intuitive system for organizing complex narrative universes, managing characters, locations, timelines, magic systems, lore, and notes.

## Features

- **Project Management**: Create and organize multiple worldbuilding projects
- **Character Development**: Detailed character profiles with relationships and magic system connections
- **Location Mapping**: Rich location descriptions with hierarchical relationships
- **Timeline Events**: Chronicle important events with character involvement
- **Magic Systems**: Define and document magical frameworks and spells
- **Lore & Notes**: Organize world history, cultures, and quick ideas
- **Rich Text Editor**: Powered by Editor.js for comprehensive content creation
- **Activity Logging**: Track all changes across your projects
- **Image Management**: Upload and organize visual assets
- **User Authentication**: Secure account management with Supabase

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast builds and development
- **Tailwind CSS** for styling with custom brand colors
- **Shadcn/ui** component library
- **TanStack Query** for server state management
- **Wouter** for client-side routing
- **React Hook Form** with Zod validation
- **Editor.js** for rich text editing

### Backend
- **Node.js** with Express.js and TypeScript
- **Drizzle ORM** for type-safe database operations
- **PostgreSQL** database (Supabase)
- **Supabase Auth** for user authentication
- **Supabase Storage** for image uploads

## Prerequisites

Before deploying InkAlchemy, ensure you have:

1. **Supabase Account**: [Sign up at supabase.com](https://supabase.com)
2. **Node.js 18+**: For local development
3. **Replit Account**: For deployment (if using Replit)

## Environment Variables

The following environment variables are required:

```env
# Supabase Configuration
DATABASE_URL=your_supabase_database_url
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Supabase Setup

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/projects)
2. Create a new project
3. Wait for the project to initialize

### 2. Get Database URL
1. In your project dashboard, click "Connect" in the top toolbar
2. Copy the URI from "Connection string" → "Transaction pooler"
3. Replace `[YOUR-PASSWORD]` with your database password
4. Use this as your `DATABASE_URL`

### 3. Get API Keys
1. Go to "Settings" → "API" in your Supabase dashboard
2. Copy the "Project URL" for `VITE_SUPABASE_URL`
3. Copy the "anon public" key for `VITE_SUPABASE_ANON_KEY`
4. Copy the "service_role" key for `SUPABASE_SERVICE_ROLE_KEY`

### 4. Configure Storage
1. Go to "Storage" in your Supabase dashboard
2. Create a new bucket called `profile-images`
3. Set the bucket to "Public bucket" for profile image access

### 5. Set Up Authentication
1. Go to "Authentication" → "Settings" in Supabase
2. Configure your site URL (your deployment URL)
3. Add redirect URLs for authentication flows

## Database Schema

The application will automatically create the necessary database tables on first run. The schema includes:

- **projects**: Main project containers
- **characters**: Character profiles and details
- **locations**: World locations and settings
- **events**: Timeline events and occurrences
- **magic_systems**: Magical frameworks
- **spells**: Individual spells and abilities
- **lore_entries**: World lore and history
- **notes**: Quick notes and ideas
- **races**: Character races and species
- **relationships**: Connections between entities
- **activities**: Audit log of all changes
- **Junction tables**: For many-to-many relationships

## Deployment Options

### Option 1: Replit Deployment

1. **Fork or Import**: Import this repository into Replit
2. **Configure Secrets**: Add environment variables in the Secrets tab:
   - `DATABASE_URL`
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. **Run the Project**: Use the "Run" button or `npm run dev`
4. **Deploy**: Click the "Deploy" button in Replit for production deployment

### Option 2: VPS/Server Deployment

#### Prerequisites for VPS
- **Node.js 18+**: `curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs`
- **PM2** (Process Manager): `npm install -g pm2`
- **Nginx** (Reverse Proxy): `sudo apt update && sudo apt install nginx`
- **Git**: `sudo apt install git`

#### VPS Deployment Steps

1. **Clone Repository**:
   ```bash
   git clone <your-repo-url>
   cd inkalchemy
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**:
   ```bash
   # Create production environment file
   nano .env
   
   # Add your configuration:
   DATABASE_URL=your_supabase_database_url
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NODE_ENV=production
   PORT=5000
   ```

4. **Build Application**:
   ```bash
   npm run build
   ```

5. **Configure PM2**:
   ```bash
   # Create PM2 ecosystem file
   nano ecosystem.config.js
   ```
   
   Add this configuration:
   ```javascript
   module.exports = {
     apps: [{
       name: 'inkalchemy',
       script: 'server/index.js',
       instances: 'max',
       exec_mode: 'cluster',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       },
       error_file: './logs/err.log',
       out_file: './logs/out.log',
       log_file: './logs/combined.log',
       time: true
     }]
   };
   ```

6. **Start with PM2**:
   ```bash
   # Create logs directory
   mkdir logs
   
   # Start application
   pm2 start ecosystem.config.js
   
   # Save PM2 configuration
   pm2 save
   
   # Setup PM2 to start on system boot
   pm2 startup
   ```

7. **Configure Nginx**:
   ```bash
   # Create Nginx configuration
   sudo nano /etc/nginx/sites-available/inkalchemy
   ```
   
   Add this configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;

       # Increase upload size limit for images
       client_max_body_size 10M;

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
           
           # Timeout settings
           proxy_connect_timeout 60s;
           proxy_send_timeout 60s;
           proxy_read_timeout 60s;
       }

       # Serve static files directly
       location /static/ {
           alias /path/to/your/app/dist/;
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

8. **Enable Nginx Site**:
   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/inkalchemy /etc/nginx/sites-enabled/
   
   # Test configuration
   sudo nginx -t
   
   # Restart Nginx
   sudo systemctl restart nginx
   ```

9. **Configure SSL with Let's Encrypt** (Optional but recommended):
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Get SSL certificate
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

#### VPS Management Commands

```bash
# View application logs
pm2 logs inkalchemy

# Restart application
pm2 restart inkalchemy

# Stop application
pm2 stop inkalchemy

# Monitor application
pm2 monit

# Update application
git pull
npm install
npm run build
pm2 restart inkalchemy

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Option 3: Cloud Platforms (Vercel/Netlify/Railway)

1. **Connect Repository**: Link your Git repository
2. **Configure Build Settings**:
   - Build command: `npm run build`
   - Output directory: `dist`
3. **Add Environment Variables**: Configure in your hosting platform
4. **Deploy**: Follow platform-specific deployment process

## Development

### Local Development Setup

1. **Clone Repository**:
   ```bash
   git clone <your-repo-url>
   cd inkalchemy
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment**: Copy `.env.example` to `.env` and fill in your values

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

5. **Access Application**: Open `http://localhost:5000`

### Development Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build for production
- `npm run preview`: Preview production build locally
- `npm run type-check`: Run TypeScript type checking

## Production Considerations

### Performance Optimization
- **Database Connection Pooling**: Supabase handles connection pooling automatically
- **Caching**: TanStack Query provides client-side caching
- **Image Optimization**: Images are served directly from Supabase Storage CDN
- **Compression**: Enable gzip compression in your reverse proxy (Nginx)

### Security Best Practices
- **Environment Variables**: Never commit secrets to version control
- **HTTPS**: Always use SSL certificates in production
- **CORS**: Configure proper CORS headers for your domain
- **Rate Limiting**: Consider implementing rate limiting for API endpoints
- **Firewall**: Configure UFW or iptables to restrict unnecessary ports

### Monitoring & Logging
- **PM2 Monitoring**: Use `pm2 monit` for real-time process monitoring
- **Log Rotation**: Configure log rotation to prevent disk space issues
- **Uptime Monitoring**: Set up external monitoring (UptimeRobot, Pingdom)
- **Error Tracking**: Consider integrating Sentry or similar error tracking

### Backup Strategy
- **Database**: Supabase provides automatic backups
- **User Uploads**: Supabase Storage has built-in redundancy
- **Application Code**: Ensure your code is in version control
- **Environment Config**: Keep secure backups of your environment variables

### Scaling Considerations
- **Horizontal Scaling**: PM2 cluster mode utilizes multiple CPU cores
- **Database**: Supabase handles database scaling automatically
- **CDN**: Consider adding Cloudflare for additional caching and DDoS protection
- **Load Balancing**: For high traffic, implement load balancing across multiple servers

## Configuration

### Custom Styling
The application uses a custom brand color palette defined in `client/src/index.css`. Colors can be customized by modifying the CSS custom properties.

### Font Configuration
The app uses Cairo font with weights 200-900. This is loaded from Google Fonts in the main HTML file.

### Image Upload Limits
- Maximum file size: 5MB
- Supported formats: PNG, JPG, JPEG, GIF, WebP, SVG
- Images are stored in Supabase Storage

## Security Features

- **User Data Isolation**: Each user can only access their own projects and data
- **Authentication Required**: All API endpoints require valid authentication
- **Input Validation**: All data is validated using Zod schemas
- **Secure File Uploads**: Image uploads are validated and stored securely
- **Activity Logging**: All user actions are logged for audit purposes

## Performance Features

- **Optimistic Updates**: UI updates immediately with server sync
- **Query Caching**: TanStack Query caches server responses
- **Image Optimization**: Automatic image cleanup for unused assets
- **Lazy Loading**: Components and routes are loaded on demand

## Troubleshooting

### Common Issues

1. **Database Connection Errors**:
   - Verify your `DATABASE_URL` is correct
   - Ensure your Supabase project is active
   - Check that your database password is correct

2. **Authentication Issues**:
   - Verify Supabase API keys are correct
   - Check that redirect URLs are configured in Supabase
   - Ensure your site URL is set correctly

3. **Image Upload Problems**:
   - Verify the `profile-images` bucket exists in Supabase Storage
   - Check that the bucket is set to public
   - Ensure you have the correct storage permissions

4. **Build Errors**:
   - Run `npm run type-check` to identify TypeScript issues
   - Ensure all environment variables are set
   - Clear node_modules and reinstall dependencies

### Getting Help

If you encounter issues not covered here:

1. Check the browser console for error messages
2. Review the server logs for backend errors
3. Verify all environment variables are correctly set
4. Ensure your Supabase project is properly configured

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing

Contributions are welcome! Please read the contributing guidelines and submit pull requests for any improvements.

---

**Note**: This application is designed for creative writers and worldbuilders. Ensure you have proper backups of your creative work, as this is still in active development.