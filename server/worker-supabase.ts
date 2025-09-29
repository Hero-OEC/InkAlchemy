// Cloudflare Workers entry point using Supabase for everything
// This avoids Node.js dependencies and uses Supabase's edge-compatible client

import { createClient } from '@supabase/supabase-js';

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

// Initialize Supabase client with service role for auth verification only
function createAdminSupabaseClient(env: Env) {
  return createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Initialize Supabase client with anon key and user token for RLS-enforced operations
function createUserSupabaseClient(env: Env, userToken: string) {
  const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  // Set the user's JWT token for RLS
  client.auth.setSession({
    access_token: userToken,
    refresh_token: ''
  });
  
  return client;
}

// Auth helper for Workers
async function authenticateUser(request: Request, env: Env): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    const supabase = createSupabaseClient(env);
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
  private routes: Array<{ method: string; pattern: string; handler: (request: Request, env: Env, params: Record<string, string>) => Promise<Response> }> = [];

  register(method: string, pattern: string, handler: (request: Request, env: Env, params: Record<string, string>) => Promise<Response>) {
    this.routes.push({ method, pattern, handler });
  }

  async handle(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;

    // Find matching route
    for (const route of this.routes) {
      if (method !== route.method) continue;
      
      const params = this.extractParams(route.pattern, pathname);
      if (params !== null) {
        return route.handler(request, env, params);
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

// Register API routes using Supabase directly

// Projects
router.register('GET', '/api/projects', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const supabase = createSupabaseClient(env);
      const { data: projects, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      return jsonResponse(projects);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch projects" }, 500);
    }
  }, params);
});

router.register('GET', '/api/projects/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const supabase = createSupabaseClient(env);
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          return jsonResponse({ message: "Project not found" }, 404);
        }
        throw error;
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
      const supabase = createSupabaseClient(env);
      const { data: project, error } = await supabase
        .from('projects')
        .insert([{ ...body, user_id: userId }])
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(project, 201);
    } catch (error) {
      return jsonResponse({ message: "Invalid project data" }, 400);
    }
  }, params);
});

// Characters
router.register('GET', '/api/projects/:projectId/characters', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const projectId = parseInt(params.projectId);
      const supabase = createSupabaseClient(env);
      
      // First verify user owns the project
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();
      
      if (!project) {
        return jsonResponse({ message: "Access denied" }, 403);
      }
      
      const { data: characters, error } = await supabase
        .from('characters')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return jsonResponse(characters);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch characters" }, 500);
    }
  }, params);
});

router.register('GET', '/api/characters/:id', async (request, env, params) => {
  try {
    const id = parseInt(params.id);
    const supabase = createSupabaseClient(env);
    const { data: character, error } = await supabase
      .from('characters')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        return jsonResponse({ message: "Character not found" }, 404);
      }
      throw error;
    }
    
    return jsonResponse(character);
  } catch (error) {
    return jsonResponse({ message: "Failed to fetch character" }, 500);
  }
});

router.register('POST', '/api/characters', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const body = await request.json();
      const supabase = createSupabaseClient(env);
      const { data: character, error } = await supabase
        .from('characters')
        .insert([body])
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(character, 201);
    } catch (error) {
      return jsonResponse({ message: "Invalid character data" }, 400);
    }
  }, params);
});

// Add similar patterns for other endpoints...
// Locations, Events, Magic Systems, etc.

// Health check endpoint
router.register('GET', '/api/health', async (request, env, params) => {
  return jsonResponse({ status: 'ok', message: 'InkAlchemy Workers API is running' });
});

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