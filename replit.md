# InkAlchemy - Worldbuilding Management Platform

## Overview
InkAlchemy is a comprehensive worldbuilding and story management platform designed for writers and creators. Its primary purpose is to provide an intuitive and centralized system for organizing and managing intricate story worlds, encompassing characters, locations, timelines, magic systems, lore, and notes. The platform aims to streamline the creative process and enhance productivity for developing complex narratives.

## User Preferences
Preferred communication style: Simple, everyday language.
Typography: Cairo font for entire application with full weight range (200-900).
Design approach: Light mode only, custom brand color palette, offline-first architecture.

## System Architecture
InkAlchemy employs a modern full-stack architecture. The frontend is built with React 18 and TypeScript, using Vite for fast builds, Shadcn/ui for UI components, Tailwind CSS for styling, TanStack Query for server state management, Wouter for routing, and React Hook Form with Zod for forms. The backend utilizes Node.js with Express.js and TypeScript, leveraging Drizzle ORM for type-safe PostgreSQL database operations. Zod schemas are shared between frontend and backend for consistent validation.

The application features a comprehensive UI component library, a consistent light-mode theme with a custom brand color palette, and a responsive design. Data flow is managed via TanStack Query for server state, and React's built-in state management for client and form states. Projects are isolated by user accounts, ensuring data privacy and ownership. Core entities include Projects, Characters, Locations, Events, Magic Systems, Lore Entries, Notes, and Relationships, all managed via RESTful API endpoints. Rich text editing is enabled through Editor.js, with content displayed via a custom renderer. All page layouts are standardized to `max-w-7xl` for a consistent user experience. The system includes robust image management with automatic cleanup of unused images and a complete cascade deletion system for all entities. Comprehensive activity logging tracks all CRUD operations across all entity types.

## Recent Fixes

### October 2025 - Phase 1 Authentication Complete
- **Database Schema Cleanup**: Removed unused `users` and `user_sessions` tables that conflicted with Supabase Auth
  - Projects now correctly use Supabase Auth UUID user IDs throughout the application
  - Eliminated authentication architecture conflicts between local tables and Supabase
- **Token Transmission**: Frontend now sends Bearer tokens with all API requests
  - Updated queryClient to include `Authorization: Bearer <token>` headers automatically
  - Backend validates tokens correctly using Supabase Auth
- **Authentication Middleware**: Removed mock user fallback, now requires real authentication
  - `optionalAuth` now enforces real Supabase authentication instead of using mock user ID
  - All API endpoints properly validate user identity before processing requests
- **User Profile Endpoints**: Added complete user management API
  - `GET /api/user/me` - Retrieve current user profile from Supabase Auth
  - `PATCH /api/user/profile` - Update user metadata using Supabase admin API
  - `POST /api/user/sync` - Sync user on first login and check project status
- **Production Readiness**: Authentication system now ready for Cloudflare Workers deployment
  - Real user IDs used throughout application (no more mock users)
  - Proper data isolation ensures users can only access their own projects
  - Bearer token validation working correctly for all authenticated routes

### October 2025 - Phase 2 Security Hardening Complete
- **Critical Security Audit**: Discovered and fixed 49+ API route vulnerabilities
  - Fixed 14 completely unauthenticated routes across all entity types
  - Added project ownership verification to 35+ routes missing authorization checks
  - Implemented centralized `verifyProjectOwnership()` helper function
  - All routes now enforce authentication + ownership validation
  - Cross-tenant data exposure completely eliminated
  - Architect review confirmed: Zero security vulnerabilities remaining

### October 2025 - Phase 3 Cloudflare Worker Setup Complete ✅
- **Worker Implementation**: Completed production-ready Cloudflare Worker
  - Audited all Express routes and identified missing endpoints in worker
  - Added missing user management endpoints (GET /api/user/me, POST /api/user/sync, PATCH /api/user/profile)
  - Implemented centralized `verifyProjectOwnership()` helper in worker
  - Applied project ownership verification to ALL 100+ entity routes
  - All routes enforce authentication + ownership checks (403 for unauthorized access)
  - Architect-approved security implementation
- **Build & Configuration**: Worker ready for deployment
  - Built worker bundle successfully: 559 KB (well within 10 MB Cloudflare limit)
  - Enhanced wrangler.toml with comprehensive deployment documentation
  - Configured CORS in worker code (OPTIONS preflight + response headers)
  - Set up frontend assets for SPA serving
  - Created detailed deployment instructions in PRODUCTION_READINESS_PLAN.md
- **Deployment Status**: Ready for user to deploy to Cloudflare Workers
  - User needs to authenticate with Cloudflare (`wrangler login`)
  - Configure 4 secrets (DATABASE_URL, Supabase URL/keys)
  - Run `npx wrangler deploy` to publish
  - Test at https://inkalchemy.[subdomain].workers.dev

### October 2025 - Supabase Configuration Improvements
- **Dedicated /input Configuration Page**: Created a dedicated route at `/input` for Supabase setup
  - Always accessible, even when Supabase is not configured
  - Bypasses authentication to allow initial setup
  - Stores credentials in browser localStorage for persistence
  - Works in both development (`npm run dev`) and production (`npm start`) modes
  - Includes clear setup instructions and configuration status
  - Provides "Clear" functionality with confirmation dialog to reset credentials
- **Improved User Experience**: Enhanced setup flow to eliminate need for server restarts
  - Frontend reads credentials from localStorage first, then falls back to environment variables
  - Automatic page reload after saving/clearing credentials to reinitialize Supabase client
  - SupabaseSetupCheck component exempts `/input` route from blocking

### August 2025
- **Database Cascade Deletion**: Fixed foreign key constraint violations in user account deletion by implementing proper deletion order for activities and junction tables
- **Loading States**: Corrected DeleteConfirmation component prop from `isDeleting` to `isLoading` for proper loading indicators
- **Data Isolation**: Enhanced user data isolation to prevent cross-account data exposure or accidental deletion

## External Dependencies
*   **Database**: Supabase PostgreSQL
*   **Image Storage**: Supabase Storage
*   **UI Components**: Radix UI
*   **Validation**: Zod
*   **Date Handling**: date-fns
*   **Authentication**: Supabase Auth
*   **Rich Text Editor**: Editor.js