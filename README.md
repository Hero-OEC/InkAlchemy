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

### Option 2: Manual Deployment

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Set Environment Variables**: Create a `.env` file with your configuration

3. **Build the Application**:
   ```bash
   npm run build
   ```

4. **Start Production Server**:
   ```bash
   npm start
   ```

### Option 3: Vercel/Netlify

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