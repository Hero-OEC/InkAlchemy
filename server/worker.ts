// Cloudflare Workers entry point
// This replaces the Express server for Workers deployment

import { storage } from "./db-storage";
import { uploadImage, handleImageUpload, handleImageUploadByUrl } from "./image-upload";
import { deleteImageFromStorage, cleanupContentImages } from "./image-cleanup";
import { supabase } from "./auth-middleware";
import { 
  insertProjectSchema, insertCharacterSchema, insertLocationSchema, 
  insertEventSchema, insertMagicSystemSchema, insertSpellSchema, 
  insertLoreEntrySchema, insertNoteSchema, insertRelationshipSchema,
  insertCharacterSpellSchema, insertRaceSchema 
} from "../shared/schema";
import { ActivityLogger } from "./activity-logger";
import { config } from "dotenv";
config(); // Load environment variables from .env file
// Types for Workers environment
export interface Env {
  DATABASE_URL: string;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
}

// Basic types for Cloudflare Workers
interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

interface ExportedHandler<Env = unknown> {
  fetch?(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response>;
}

// Auth helper for Workers
async function authenticateUser(request: Request, env: Env): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    if (!supabase) {
      console.error('Supabase client not configured');
      return null;
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Authentication error:', error);
      return null;
    }

    return user.id;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

// Router class for handling different API endpoints
class WorkersRouter {
  private routes: Map<string, (request: Request, env: Env, params: Record<string, string>) => Promise<Response>> = new Map();

  register(method: string, pattern: string, handler: (request: Request, env: Env, params: Record<string, string>) => Promise<Response>) {
    this.routes.set(`${method}:${pattern}`, handler);
  }

  async handle(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;

    // Find matching route  
    for (const [key, handler] of Array.from(this.routes.entries())) {
      const [routeMethod, routePattern] = key.split(':', 2);
      
      if (method !== routeMethod) continue;
      
      const params = this.extractParams(routePattern, pathname);
      if (params !== null) {
        return handler(request, env, params);
      }
    }

    return new Response('Not Found', { status: 404 });
  }

  private extractParams(pattern: string, pathname: string): Record<string, string> | null {
    const patternParts = pattern.split('/');
    const pathnameParts = pathname.split('/');

    if (patternParts.length !== pathnameParts.length) {
      return null;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < patternParts.length; i++) {
      const patternPart = patternParts[i];
      const pathnamePart = pathnameParts[i];

      if (patternPart.startsWith(':')) {
        // This is a parameter
        const paramName = patternPart.substring(1);
        params[paramName] = pathnamePart;
      } else if (patternPart !== pathnamePart) {
        // Static part doesn't match
        return null;
      }
    }

    return params;
  }
}

// Create router instance
const router = new WorkersRouter();

// Helper function to send JSON response
function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Helper function to handle authentication required endpoints
async function withAuth(
  request: Request,
  env: Env,
  handler: (userId: string, request: Request, env: Env, params: Record<string, string>) => Promise<Response>,
  params: Record<string, string>
): Promise<Response> {
  const userId = await authenticateUser(request, env);
  if (!userId) {
    return jsonResponse({ message: 'Authentication required' }, 401);
  }
  return handler(userId, request, env, params);
}

// Register API routes

// Projects
router.register('GET', '/api/projects', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const projects = await storage.getProjects();
      const userProjects = projects.filter(project => project.userId === userId);
      return jsonResponse(userProjects);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch projects" }, 500);
    }
  }, params);
});

router.register('GET', '/api/projects/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const project = await storage.getProject(id);
      if (!project) {
        return jsonResponse({ message: "Project not found" }, 404);
      }
      if (project.userId !== userId) {
        return jsonResponse({ message: "Access denied" }, 403);
      }
      return jsonResponse(project);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch project" }, 500);
    }
  }, params);
});

router.register('POST', '/api/projects', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const body = await request.json();
      const projectBodySchema = insertProjectSchema.omit({ userId: true });
      const bodyData = projectBodySchema.parse(body);
      const projectData = { ...bodyData, userId };
      const project = await storage.createProject(projectData);
      
      await ActivityLogger.logCreate(
        project.id,
        'project',
        project.id,
        project.name,
        userId
      );
      
      return jsonResponse(project, 201);
    } catch (error) {
      return jsonResponse({ 
        message: "Invalid project data",
        error: error instanceof Error ? error.message : "Unknown error" 
      }, 400);
    }
  }, params);
});

// Characters
router.register('GET', '/api/projects/:projectId/characters', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const projectId = parseInt(params.projectId);
      const project = await storage.getProject(projectId);
      if (!project || project.userId !== userId) {
        return jsonResponse({ message: "Access denied" }, 403);
      }
      const characters = await storage.getCharacters(projectId);
      return jsonResponse(characters);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch characters" }, 500);
    }
  }, params);
});

router.register('GET', '/api/characters/:id', async (request, env, params) => {
  try {
    const id = parseInt(params.id);
    const character = await storage.getCharacter(id);
    if (!character) {
      return jsonResponse({ message: "Character not found" }, 404);
    }
    return jsonResponse(character);
  } catch (error) {
    return jsonResponse({ message: "Failed to fetch character" }, 500);
  }
});

// Add more routes as needed...
// For brevity, I'm showing the pattern. The full conversion would include all endpoints.

// Export the main fetch handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // Route API requests
    if (new URL(request.url).pathname.startsWith('/api')) {
      return router.handle(request, env);
    }

    // For non-API requests, serve static files (handled by Cloudflare)
    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;