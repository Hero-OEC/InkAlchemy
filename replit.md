# InkAlchemy - Worldbuilding Management Platform

## Overview
InkAlchemy is a comprehensive worldbuilding and story management platform for writers and creators. It provides tools to organize characters, locations, timelines, magic systems, lore, and notes within structured projects. The platform aims to streamline the creative process by offering a centralized, intuitive system for developing intricate story worlds.

## User Preferences
Preferred communication style: Simple, everyday language.
Typography: Cairo font for entire application with full weight range (200-900).
Design approach: Light mode only, custom brand color palette, offline-first architecture.

## System Architecture
InkAlchemy employs a modern full-stack architecture. The frontend is built with React 18 and TypeScript, utilizing Vite for fast builds, Shadcn/ui for UI components, Tailwind CSS for styling, TanStack Query for server state, Wouter for routing, and React Hook Form with Zod for forms. The backend uses Node.js with Express.js and TypeScript, leveraging Drizzle ORM for type-safe PostgreSQL database operations. Zod schemas are shared between frontend and backend for consistent validation. The application features a comprehensive UI component library, a consistent light-mode theme with a custom brand color palette, and responsive design. Data flow is managed via TanStack Query for server state, and React's built-in state management for client and form states. Projects are isolated by user accounts, ensuring data privacy and ownership. Core entities include Projects, Characters, Locations, Events, Magic Systems, Lore Entries, Notes, and Relationships, all managed via RESTful API endpoints. Rich text editing is enabled through Editor.js, with content displayed via a custom renderer.

## External Dependencies
*   **Database**: PostgreSQL (Supabase)
*   **Image Storage**: Supabase Storage
*   **UI Components**: Radix UI
*   **Validation**: Zod
*   **Date Handling**: date-fns
*   **Authentication**: Supabase Auth
*   **Rich Text Editor**: Editor.js

## Recent Changes

### August 2025 - Successful Migration to Replit Environment
- **Migration Completed**: Successfully migrated InkAlchemy from Replit Agent to standard Replit environment
- **Database Setup**: Connected application to Supabase PostgreSQL database with proper schema synchronization
- **Component Bug Fix**: Resolved CharacterMagicSelector component crashes caused by complex useEffect loops
- **Simplified Logic**: Replaced complex state management with simple Set-based tracking for added magic systems
- **Performance Improvement**: Eliminated unnecessary API calls and state loops that were causing console errors
- **Environment Setup**: All required dependencies installed and working, server running on port 5000
- **Authentication**: Supabase authentication middleware properly initialized and connected
- **Image Upload Fix**: Fixed character image upload preview issue by handling Editor.js response format correctly
- **Enhanced Word Processor**: Added resizable images, borders, backgrounds, and captions to Editor.js
- **Image Storage**: Two separate buckets configured - character-images for character profiles, content-images for rich text
- **Image Deletion System**: Automatic cleanup of unused images from storage when deleted from word processor or character forms
- **Character Image Management**: Remove button for character images with immediate storage cleanup
- **Smart Image Cleanup**: Word processor automatically detects and removes unused images from content with debounced change detection
- **Editor.js Header Configuration Fix**: Resolved authentication header error in word processor image uploads
- **Image Upload API**: Configured with optional authentication middleware for seamless editor integration
- **Cache Invalidation Fix**: Fixed React Query cache invalidation in character forms to ensure real-time content updates
- **Image Renderer Enhancement**: Added comprehensive debugging and error handling for image display in Editor.js content
- **Multiple Image Deletion**: Optimized word processor to handle multiple image deletions with batch processing and increased debounce timing
- **Cascade Deletion**: Complete cascade deletion system - deleting any entity (character, location, event, lore, note, magic system) automatically cleans up all associated images from storage
- **Enhanced Security**: Added authentication middleware to all deletion endpoints for proper access control
- **Full Functionality**: All core features working including authentication, database operations, comprehensive image management, real-time content updates, and complete cascade deletion
- **Final Migration Fix**: Fixed event deletion authentication error by replacing manual localStorage token access with proper apiRequest function that handles Supabase authentication correctly
- **Cache Invalidation Fix**: Added React Query cache invalidation to event deletion for automatic timeline page updates
- **Timeline Auto-Update Fix**: Resolved timeline page not updating after event deletion by adding staleTime: 0 to events query and dynamic key prop to force SerpentineTimeline re-rendering
- **Race Deletion Implementation**: Added proper race deletion with confirmation dialog, server-side foreign key constraint checking, and informative error messages when race is used by characters
- **Navigation Error Fix**: Fixed useNavigate runtime error in character-details.tsx by replacing with wouter's setLocation navigation
- **Character Deletion Fix**: Fixed character deletion authentication error by replacing manual fetch with apiRequest function for proper Supabase JWT handling
- **Character Deletion UI**: Added proper loading indication to delete confirmation dialog with isPending state from React Query mutation
- **Race Deletion Cache Fix**: Fixed race deletion not updating page automatically by setting staleTime: 0 and using removeQueries for immediate cache refresh
- **Replit Environment Migration**: Successfully migrated InkAlchemy from Replit Agent to standard Replit environment with PostgreSQL database
- **Location Deletion Fix**: Fixed location deletion authentication error by replacing manual fetch with apiRequest function for proper Supabase JWT handling
- **Location Deletion UI**: Added proper loading indication to delete confirmation dialog with isPending state from React Query mutation
- **Enhanced Activity Tracking**: Fixed editing history dashboard to properly track all entity types including races, with comprehensive create/edit tracking and real-time data refresh
- **Complete Activity System**: Implemented comprehensive activity logging across all CRUD operations for all entities (projects, characters, locations, events, magic systems, lore entries, notes, races) with proper authentication and cache invalidation
- **Race Deletion Authentication Fix**: Fixed race deletion authentication error by replacing raw fetch with proper apiRequest function and React Query mutation pattern

### August 2025 - Replit Environment Migration Complete
- **Successful Migration**: InkAlchemy successfully migrated from Replit Agent to standard Replit environment
- **Database Migration**: PostgreSQL database created and schema pushed with all tables properly configured
- **Authentication Setup**: Supabase authentication fully configured with proper credentials
- **Image Storage**: Supabase storage buckets connected for character images and rich text content
- **Full Functionality**: All core features operational including user authentication, database operations, image management
- **Environment Compatibility**: Application running smoothly on port 5000 with proper client/server separation
- **Security Maintained**: All security practices preserved with proper authentication middleware