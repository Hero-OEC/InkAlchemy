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