# InkAlchemy - Fandom Wiki Integration & User Authentication Documentation

## Table of Contents
1. [Overview](#overview)
2. [User Authentication System](#user-authentication-system)
3. [Fandom Wiki Export Feature](#fandom-wiki-export-feature)
4. [Supabase Migration](#supabase-migration)
5. [Implementation Timeline](#implementation-timeline)
6. [Cost Analysis](#cost-analysis)

---

## Overview

This document outlines the complete technical requirements and implementation plan for:
- Adding user authentication to InkAlchemy
- Implementing Fandom Wiki export functionality
- Migrating to Supabase for better backend infrastructure

### Key Benefits
- **For Writers**: Build privately in InkAlchemy, publish publicly to Fandom Wiki
- **One-Click Publishing**: Export entire worldbuilding projects to organized wiki structure
- **User Accounts**: Secure storage of wiki credentials and project ownership

---

## User Authentication System

### Why User Accounts Are Essential

1. **Security & Credentials**
   - Store encrypted Fandom wiki credentials per user
   - Each user manages their own wiki connections
   - Prevent credential sharing or unauthorized access

2. **Rate Limiting Management**
   - Track API usage per user across their wikis
   - Prevent one user's exports from affecting others
   - Maintain separate rate limit buckets

3. **Project Ownership**
   - Users own their worldbuilding projects
   - Control who can export their content
   - Privacy settings for sensitive story content

4. **Export History & Settings**
   - Track export status and history per user
   - Save wiki preferences and templates
   - Resume interrupted exports

### Database Schema Requirements

```sql
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User sessions
CREATE TABLE user_sessions (
  id VARCHAR(255) PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Modify projects table
ALTER TABLE projects ADD COLUMN user_id INTEGER REFERENCES users(id);

-- Wiki credentials per user
CREATE TABLE user_wiki_credentials (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  wiki_url VARCHAR(255) NOT NULL,
  credentials_encrypted TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Authentication Implementation Options

#### Option 1: Full Authentication System (Production-Ready)
- Complete user registration/login
- Secure password storage with bcrypt
- Session management with PostgreSQL
- CSRF protection and secure cookies
- **Time Required**: 8-10 days

#### Option 2: OAuth Integration (Recommended)
- Google OAuth (completely free)
- GitHub OAuth (completely free)
- No password management needed
- Users trust existing providers
- **Time Required**: 3-4 days

#### Option 3: Supabase Auth (Built-in)
- Included in Supabase (even free tier)
- Email/password + OAuth providers
- Magic links and phone auth
- Row Level Security integration
- **Time Required**: 1-2 days

---

## Fandom Wiki Export Feature

### How It Works

1. **Complete Your Project in InkAlchemy**
   - Build characters, locations, magic systems, timeline
   - Organize everything in private workspace
   - Test and refine your worldbuilding

2. **One-Click Export to Fandom**
   - Click "Export to Fandom Wiki"
   - Enter wiki URL and credentials
   - Choose content to publish
   - Preview wiki structure
   - Hit "Publish" - everything created automatically

### Technical Requirements

#### 1. Authentication System
```javascript
// MediaWiki OAuth 2.0 or Bot Password integration
- User provides: Fandom wiki URL + credentials
- Generate access tokens via MediaWiki API
- Handle session management with CSRF tokens
- Store credentials securely (encrypted)
```

#### 2. Content Conversion Engine
```javascript
// Editor.js JSON → MediaWiki Markup
- Parse Editor.js structured data blocks
- Convert each block type:
  * Headers → == Header Text ==
  * Paragraphs → Plain text
  * Lists → * Item or # Item
  * Images → [[File:image.jpg|thumb|caption]]
  * Tables → MediaWiki table syntax
```

#### 3. Rate Limiting & API Management
```javascript
// Critical for Fandom compliance
- Max 40 edits/minute (80 for bot accounts)
- Sequential requests only (no parallel)
- Exponential backoff on rate limit errors
- Queue system for batch operations
```

#### 4. Page Structure Generator
```javascript
// Auto-generate wiki organization
- Main project page with navigation
- Category pages (Characters, Locations, etc.)
- Infobox templates for characters/locations
- Cross-reference links between pages
```

### Fandom API Details

#### Rate Limits
- **Regular users**: 40 edits per minute
- **Bot accounts**: 80 edits per minute
- **Read requests**: No hard limit, but be considerate

#### API Endpoint
```
https://yourwiki.fandom.com/api.php
```

#### Required API Actions
- `action=login` - Authentication
- `action=query&meta=tokens` - Get CSRF tokens
- `action=edit` - Create/update pages
- `action=upload` - Upload images

### Wiki Structure Example

```
Your Project Wiki Structure:
├── Main Page (Project overview)
├── Characters/
│   ├── Aria Stormwind
│   ├── Marcus the Bold
│   └── Character Index
├── Locations/
│   ├── Silvermoon City
│   ├── Thornvale Forest
│   └── Location Index
├── Timeline/
│   ├── The Great War
│   ├── Meeting at Crossroads
│   └── Chronicle of Events
└── Magic Systems/
    ├── Elemental Magic
    └── Arcane Studies
```

### Content Mapping

- **Character details** → Character infobox + description
- **Location details** → Location page with sections
- **Timeline events** → Chronicle pages with dates
- **Magic systems** → System pages with rules
- **Rich text content** → MediaWiki markup
- **Cross-references** → Wiki internal links

---

## Supabase Migration

### Why Migrate to Supabase

1. **Built-in Features Save Development Time**
   - Authentication system (would take 5-8 days to build)
   - File storage with CDN (2-3 days to build)
   - Auto-generated REST/GraphQL APIs
   - Real-time subscriptions

2. **Professional Infrastructure**
   - Daily automated backups
   - Point-in-time recovery
   - 99.9% uptime SLA
   - Global CDN for images

3. **Cost Effective**
   - $25/month includes everything
   - Cheaper than development time
   - Predictable pricing

### Supabase Pricing Breakdown

#### Free Tier - $0/month
```
✅ What you get:
- 500MB database storage
- 1GB file storage  
- Up to 10K monthly active users
- Built-in authentication
- Real-time features
- Auto-generated APIs

❌ Limitations:
- 500MB fills up fast with worldbuilding
- Projects pause after 7 days inactivity
- No backups
```

#### Pro Tier - $25/month (Recommended)
```
✅ What you get:
- 8GB database storage
- 100GB file storage
- Unlimited projects (no pausing)
- Daily automated backups
- Built-in authentication system
- Custom domains
- Point-in-time recovery
- Auto-generated REST/GraphQL APIs
- Real-time subscriptions
```

### Migration Benefits for Wiki Export

1. **Authentication Already Solved**
   - User accounts ready to use
   - OAuth providers configured
   - Secure credential storage

2. **File Storage for Wiki Images**
   - Character portraits
   - Location maps
   - Magic system diagrams
   - Automatic CDN delivery

3. **Better API Structure**
   - REST API auto-generated
   - GraphQL for complex queries
   - Real-time updates during export

---

## Implementation Timeline

### Phase 1: Supabase Migration (2-3 days)
- Set up Supabase project
- Migrate existing database schema
- Configure authentication
- Update API endpoints

### Phase 2: User Authentication (1-2 days with Supabase)
- Enable Supabase Auth
- Add login/register pages
- Implement project ownership
- Secure API endpoints

### Phase 3: Content Converter (2-3 days)
- Build Editor.js → MediaWiki converter
- Handle all content types
- Generate infobox templates
- Create cross-references

### Phase 4: Wiki API Integration (2-3 days)
- MediaWiki authentication
- Page creation functions
- Rate limiting system
- Error handling

### Phase 5: UI Implementation (1-2 days)
- Export settings page
- Progress tracking
- Preview system
- Error messages

### Phase 6: Testing & Polish (1-2 days)
- Test with real Fandom wikis
- Handle edge cases
- Performance optimization
- User documentation

### Total Timeline: 10-15 days

---

## Cost Analysis

### Development Costs

#### Option 1: Build Everything Yourself
```
Authentication System: 5-8 days
File Storage System: 2-3 days
API Optimization: Ongoing
Wiki Export Feature: 10-15 days

Total: 20-30 days of development
```

#### Option 2: Use Supabase + Build Wiki Export
```
Supabase Setup: 2-3 days
Wiki Export Feature: 10-15 days

Total: 12-18 days of development
Cost: $25/month
```

### Ongoing Costs

#### Current Setup (Replit)
- Database: $0 (included)
- Hosting: $0 (current plan)
- Total: $0/month

#### Supabase Migration
- Supabase Pro: $25/month
- Includes: Database, Auth, Storage, APIs
- No additional costs needed

### Cost-Benefit Analysis

**$25/month gets you:**
- 5-8 days saved on authentication
- 2-3 days saved on file storage
- Professional backup system
- Scalable infrastructure
- Better user experience

**Break-even point:**
If your time is worth more than $25/day, Supabase pays for itself in saved development time within the first month.

---

## Next Steps

1. **Set up Supabase account** (Free to start)
2. **Migrate database schema** to Supabase
3. **Enable authentication** with OAuth providers
4. **Start building wiki export** content converter
5. **Test with sample Fandom wiki**
6. **Add UI for export settings**
7. **Launch to users!**

---

## Key Decisions Needed

1. **Authentication Method**
   - Supabase Auth (recommended - fastest)
   - Custom OAuth implementation
   - Full custom auth system

2. **Export Features for MVP**
   - Basic text content only
   - Include images
   - Full formatting preservation

3. **User Limits**
   - Exports per day
   - Wiki size limits
   - Concurrent exports

4. **Pricing Model** (Future)
   - Free for all users
   - Premium features
   - Export limits for free tier

---

## Resources

### MediaWiki API Documentation
- Main API: https://www.mediawiki.org/wiki/API:Main_page
- Edit API: https://www.mediawiki.org/wiki/API:Edit
- Upload API: https://www.mediawiki.org/wiki/API:Upload

### Supabase Documentation
- Getting Started: https://supabase.com/docs
- Auth: https://supabase.com/docs/guides/auth
- Storage: https://supabase.com/docs/guides/storage

### NPM Packages Needed
```bash
# For Wiki Export
npm install wikiapi              # MediaWiki API client
npm install rate-limiter-flexible # Rate limiting

# For Supabase
npm install @supabase/supabase-js # Supabase client
npm install @supabase/auth-helpers-react # Auth helpers
```

---

This document contains all the technical details discussed for implementing user authentication and Fandom Wiki export functionality in InkAlchemy. The Supabase migration provides the fastest path to implementation while maintaining professional quality and scalability.