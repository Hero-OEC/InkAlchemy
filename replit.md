# InkAlchemy - Worldbuilding Management Platform

## Overview
InkAlchemy is a comprehensive worldbuilding and story management platform for writers and creators. It provides tools to organize characters, locations, timelines, magic systems, lore, and notes within structured projects. The platform aims to streamline the creative process by offering a centralized, intuitive system for developing intricate story worlds.

## Migration Status: ✅ COMPLETE  
Successfully migrated from Replit Agent to standard Replit environment (August 2025).
Connected to Supabase PostgreSQL database with full authentication support.

## User Preferences
Preferred communication style: Simple, everyday language.
Typography: Cairo font for entire application with full weight range (200-900).
Design approach: Light mode only, custom brand color palette, offline-first architecture.

## System Architecture
InkAlchemy employs a modern full-stack architecture. The frontend is built with React 18 and TypeScript, utilizing Vite for fast builds, Shadcn/ui for UI components, Tailwind CSS for styling, TanStack Query for server state, Wouter for routing, and React Hook Form with Zod for forms. The backend uses Node.js with Express.js and TypeScript, leveraging Drizzle ORM for type-safe PostgreSQL database operations. Zod schemas are shared between frontend and backend for consistent validation. The application features a comprehensive UI component library, a consistent light-mode theme with a custom brand color palette, and responsive design. Data flow is managed via TanStack Query for server state, and React's built-in state management for client and form states. Projects are isolated by user accounts, ensuring data privacy and ownership. Core entities include Projects, Characters, Locations, Events, Magic Systems, Lore Entries, Notes, and Relationships, all managed via RESTful API endpoints. Rich text editing is enabled through Editor.js, with content displayed via a custom renderer.

## External Dependencies
*   **Database**: Supabase PostgreSQL (Primary Database)
*   **Image Storage**: Supabase Storage
*   **UI Components**: Radix UI
*   **Validation**: Zod
*   **Date Handling**: date-fns
*   **Authentication**: Supabase Auth
*   **Rich Text Editor**: Editor.js

## Database Configuration
The application uses Supabase as the primary database. Required environment variables:
- `DATABASE_URL`: postgresql://postgres.nkmtcxeahydditymadlw:123qweasdZXCrakan@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
- `VITE_SUPABASE_URL`: https://nkmtcxeahydditymadlw.supabase.co
- `VITE_SUPABASE_ANON_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbXRjeGVhaHlkZGl0eW1hZGx3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzNTg5NDEsImV4cCI6MjA2ODkzNDk0MX0.Pj3LuJkY_lREQiwnSb3-kaabPyNXouAp8LZfjg5s3r0
- `SUPABASE_SERVICE_ROLE_KEY`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5rbXRjeGVhaHlkZGl0eW1hZGx3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzM1ODk0MSwiZXhwIjoyMDY4OTM0OTQxfQ.S89sI5ZjiQLR6St5EhVSrkmKjov-TcOLnrE0kdUGCkk

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
- **Cache Invalidation Enhancement**: Improved race deletion to properly invalidate all related queries (characters, activities, stats) for immediate UI updates
- **React State Warning Fix**: Resolved React development warning about state updates during rendering in race-details component
- **Cache Invalidation Issue Fix**: Resolved critical UI update bug where location creation/editing didn't show new data without page reload. Root cause was staleTime: Infinity preventing refetch after cache invalidation. Fixed by adding staleTime: 0 to location queries to force immediate refetch when invalidated
- **Magic System Edit Cache Fix**: Fixed magic system editing not updating UI until page reload. Root cause was incorrect query key patterns in cache invalidation. Updated to match actual query keys used in components for immediate UI updates after edits
- **Magic System Delete Authentication Fix**: Fixed magic system deletion authorization errors by replacing raw fetch() with proper apiRequest function that includes JWT authentication headers automatically
- **Layout Width Consistency Improvements**: Fixed width inconsistencies across all entity pages for better user experience and consistent design. Updated magic system edit/create pages to use full-width WordProcessor layout, fixed location create/edit pages from max-w-4xl to max-w-7xl, event form from max-w-6xl to max-w-7xl, and spell/effect pages from max-w-4xl to max-w-6xl to match their respective details pages

### August 2025 - Replit Environment Migration Complete
- **Successful Migration**: InkAlchemy successfully migrated from Replit Agent to standard Replit environment
- **Database Configuration**: Switched to Supabase PostgreSQL as primary database with schema deployment
- **Authentication Setup**: Supabase authentication fully configured with proper credentials
- **Image Storage**: Supabase storage buckets connected for character images and rich text content
- **Full Functionality**: All core features operational including user authentication, database operations, image management
- **Environment Compatibility**: Application running smoothly on port 5000 with proper client/server separation
- **Security Maintained**: All security practices preserved with proper authentication middleware
- **Database Standardization**: Configured Supabase as default database solution for consistent deployment
- **Supabase Connection Verified**: Successfully connected to production Supabase database with all environment variables properly configured in Replit Secrets
- **Spell Activity Tracking Fixed**: Added comprehensive activity logging for spell CRUD operations with proper authentication
- **Complete Activity System**: All entities now properly tracked in edit history including spells within magic systems
- **Terminology Migration Complete**: Successfully updated all UI components from "Magic Systems/Power Systems" → "Systems" throughout application. Implemented contextual terminology where users see "Spells" for magic systems and "Abilities" for power systems, while using "Effects" as internal/database terminology. All navigation, pages, forms, and component labels updated consistently while maintaining backend compatibility
- **Activity Dashboard Enhancement**: Fixed spell/effect activities showing as "Other" category in dashboard edit history. Added proper entity type mappings for 'spell' and 'effect' types to display as "Spells" and "Effects" categories with Sparkles icons, ensuring comprehensive activity tracking across all entity types