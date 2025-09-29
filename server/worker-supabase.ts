
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

// Initialize Supabase client with anon key for RLS-enforced operations
function createSupabaseClient(env: Env) {
  return createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Initialize Supabase client with service role for admin operations only when needed
function createAdminSupabaseClient(env: Env) {
  return createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Initialize Supabase client with user token for RLS-enforced operations
function createUserSupabaseClient(env: Env, userToken: string) {
  const client = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  // Set the user's JWT token for RLS
  await client.auth.setSession({
    access_token: userToken,
    refresh_token: '',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: null
  });
  
  return client;
}

// Auth helper for Workers
async function authenticateUser(request: Request, env: Env): Promise<{ userId: string; token: string } | null> {
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

    return { userId: user.id, token };
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
  handler: (userId: string, token: string, request: Request, env: Env, params: Record<string, string>) => Promise<Response>,
  params: Record<string, string>
): Promise<Response> {
  const auth = await authenticateUser(request, env);
  if (!auth) {
    return jsonResponse({ message: 'Authentication required' }, 401);
  }
  return handler(auth.userId, auth.token, request, env, params);
}

// Register API routes using Supabase with RLS

// Projects
router.register('GET', '/api/projects', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const supabase = createUserSupabaseClient(env, token);
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
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
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
  return withAuth(request, env, async (userId, token) => {
    try {
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
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

router.register('PUT', '/api/projects/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: project, error } = await supabase
        .from('projects')
        .update(body)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(project);
    } catch (error) {
      return jsonResponse({ message: "Failed to update project" }, 500);
    }
  }, params);
});

router.register('DELETE', '/api/projects/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      
      if (error) throw error;
      return jsonResponse({ message: "Project deleted successfully" });
    } catch (error) {
      return jsonResponse({ message: "Failed to delete project" }, 500);
    }
  }, params);
});

// Characters
router.register('GET', '/api/projects/:projectId/characters', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const projectId = parseInt(params.projectId);
      const supabase = createUserSupabaseClient(env, token);
      
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
  return withAuth(request, env, async (userId, token) => {
    try {
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
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

router.register('PUT', '/api/characters/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: character, error } = await supabase
        .from('characters')
        .update(body)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(character);
    } catch (error) {
      return jsonResponse({ message: "Failed to update character" }, 500);
    }
  }, params);
});

router.register('DELETE', '/api/characters/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return jsonResponse({ message: "Character deleted successfully" });
    } catch (error) {
      return jsonResponse({ message: "Failed to delete character" }, 500);
    }
  }, params);
});

// Locations
router.register('GET', '/api/projects/:projectId/locations', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const projectId = parseInt(params.projectId);
      const supabase = createUserSupabaseClient(env, token);
      
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();
      
      if (!project) {
        return jsonResponse({ message: "Access denied" }, 403);
      }
      
      const { data: locations, error } = await supabase
        .from('locations')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return jsonResponse(locations);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch locations" }, 500);
    }
  }, params);
});

router.register('POST', '/api/locations', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: location, error } = await supabase
        .from('locations')
        .insert([body])
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(location, 201);
    } catch (error) {
      return jsonResponse({ message: "Invalid location data" }, 400);
    }
  }, params);
});

// Magic Systems
router.register('GET', '/api/projects/:projectId/magic-systems', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const projectId = parseInt(params.projectId);
      const supabase = createUserSupabaseClient(env, token);
      
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();
      
      if (!project) {
        return jsonResponse({ message: "Access denied" }, 403);
      }
      
      const { data: magicSystems, error } = await supabase
        .from('magic_systems')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return jsonResponse(magicSystems);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch magic systems" }, 500);
    }
  }, params);
});

router.register('POST', '/api/magic-systems', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: magicSystem, error } = await supabase
        .from('magic_systems')
        .insert([body])
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(magicSystem, 201);
    } catch (error) {
      return jsonResponse({ message: "Invalid magic system data" }, 400);
    }
  }, params);
});

// Events
router.register('GET', '/api/projects/:projectId/events', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const projectId = parseInt(params.projectId);
      const supabase = createUserSupabaseClient(env, token);
      
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();
      
      if (!project) {
        return jsonResponse({ message: "Access denied" }, 403);
      }
      
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return jsonResponse(events);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch events" }, 500);
    }
  }, params);
});

router.register('POST', '/api/events', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: event, error } = await supabase
        .from('events')
        .insert([body])
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(event, 201);
    } catch (error) {
      return jsonResponse({ message: "Invalid event data" }, 400);
    }
  }, params);
});

// Add missing endpoints for locations, magic systems, events, spells, lore, notes, races

// Individual location endpoint
router.register('GET', '/api/locations/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { data: location, error } = await supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return jsonResponse({ message: "Location not found" }, 404);
        }
        throw error;
      }
      
      return jsonResponse(location);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch location" }, 500);
    }
  }, params);
});

router.register('PUT', '/api/locations/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: location, error } = await supabase
        .from('locations')
        .update(body)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(location);
    } catch (error) {
      return jsonResponse({ message: "Failed to update location" }, 500);
    }
  }, params);
});

router.register('DELETE', '/api/locations/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { error } = await supabase
        .from('locations')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return jsonResponse({ message: "Location deleted successfully" });
    } catch (error) {
      return jsonResponse({ message: "Failed to delete location" }, 500);
    }
  }, params);
});

// Individual magic system endpoint
router.register('GET', '/api/magic-systems/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { data: magicSystem, error } = await supabase
        .from('magic_systems')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return jsonResponse({ message: "Magic system not found" }, 404);
        }
        throw error;
      }
      
      return jsonResponse(magicSystem);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch magic system" }, 500);
    }
  }, params);
});

router.register('PUT', '/api/magic-systems/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: magicSystem, error } = await supabase
        .from('magic_systems')
        .update(body)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(magicSystem);
    } catch (error) {
      return jsonResponse({ message: "Failed to update magic system" }, 500);
    }
  }, params);
});

router.register('DELETE', '/api/magic-systems/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { error } = await supabase
        .from('magic_systems')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return jsonResponse({ message: "Magic system deleted successfully" });
    } catch (error) {
      return jsonResponse({ message: "Failed to delete magic system" }, 500);
    }
  }, params);
});

// Individual event endpoint
router.register('GET', '/api/events/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return jsonResponse({ message: "Event not found" }, 404);
        }
        throw error;
      }
      
      return jsonResponse(event);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch event" }, 500);
    }
  }, params);
});

router.register('PUT', '/api/events/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: event, error } = await supabase
        .from('events')
        .update(body)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(event);
    } catch (error) {
      return jsonResponse({ message: "Failed to update event" }, 500);
    }
  }, params);
});

router.register('DELETE', '/api/events/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return jsonResponse({ message: "Event deleted successfully" });
    } catch (error) {
      return jsonResponse({ message: "Failed to delete event" }, 500);
    }
  }, params);
});

// Spells endpoints
router.register('GET', '/api/projects/:projectId/spells', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const projectId = parseInt(params.projectId);
      const supabase = createUserSupabaseClient(env, token);
      
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();
      
      if (!project) {
        return jsonResponse({ message: "Access denied" }, 403);
      }
      
      const { data: spells, error } = await supabase
        .from('spells')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return jsonResponse(spells);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch spells" }, 500);
    }
  }, params);
});

router.register('GET', '/api/spells/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { data: spell, error } = await supabase
        .from('spells')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return jsonResponse({ message: "Spell not found" }, 404);
        }
        throw error;
      }
      
      return jsonResponse(spell);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch spell" }, 500);
    }
  }, params);
});

router.register('POST', '/api/spells', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: spell, error } = await supabase
        .from('spells')
        .insert([body])
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(spell, 201);
    } catch (error) {
      return jsonResponse({ message: "Invalid spell data" }, 400);
    }
  }, params);
});

router.register('PUT', '/api/spells/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: spell, error } = await supabase
        .from('spells')
        .update(body)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(spell);
    } catch (error) {
      return jsonResponse({ message: "Failed to update spell" }, 500);
    }
  }, params);
});

router.register('DELETE', '/api/spells/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { error } = await supabase
        .from('spells')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return jsonResponse({ message: "Spell deleted successfully" });
    } catch (error) {
      return jsonResponse({ message: "Failed to delete spell" }, 500);
    }
  }, params);
});

// Lore endpoints
router.register('GET', '/api/projects/:projectId/lore', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const projectId = parseInt(params.projectId);
      const supabase = createUserSupabaseClient(env, token);
      
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();
      
      if (!project) {
        return jsonResponse({ message: "Access denied" }, 403);
      }
      
      const { data: lore, error } = await supabase
        .from('lore_entries')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return jsonResponse(lore);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch lore" }, 500);
    }
  }, params);
});

router.register('GET', '/api/lore/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { data: lore, error } = await supabase
        .from('lore_entries')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return jsonResponse({ message: "Lore entry not found" }, 404);
        }
        throw error;
      }
      
      return jsonResponse(lore);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch lore entry" }, 500);
    }
  }, params);
});

router.register('POST', '/api/lore', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: lore, error } = await supabase
        .from('lore_entries')
        .insert([body])
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(lore, 201);
    } catch (error) {
      return jsonResponse({ message: "Invalid lore data" }, 400);
    }
  }, params);
});

router.register('PUT', '/api/lore/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: lore, error } = await supabase
        .from('lore_entries')
        .update(body)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(lore);
    } catch (error) {
      return jsonResponse({ message: "Failed to update lore entry" }, 500);
    }
  }, params);
});

router.register('DELETE', '/api/lore/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { error } = await supabase
        .from('lore_entries')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return jsonResponse({ message: "Lore entry deleted successfully" });
    } catch (error) {
      return jsonResponse({ message: "Failed to delete lore entry" }, 500);
    }
  }, params);
});

// Notes endpoints
router.register('GET', '/api/projects/:projectId/notes', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const projectId = parseInt(params.projectId);
      const supabase = createUserSupabaseClient(env, token);
      
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();
      
      if (!project) {
        return jsonResponse({ message: "Access denied" }, 403);
      }
      
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return jsonResponse(notes);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch notes" }, 500);
    }
  }, params);
});

router.register('GET', '/api/notes/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { data: note, error } = await supabase
        .from('notes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return jsonResponse({ message: "Note not found" }, 404);
        }
        throw error;
      }
      
      return jsonResponse(note);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch note" }, 500);
    }
  }, params);
});

router.register('POST', '/api/notes', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: note, error } = await supabase
        .from('notes')
        .insert([body])
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(note, 201);
    } catch (error) {
      return jsonResponse({ message: "Invalid note data" }, 400);
    }
  }, params);
});

router.register('PUT', '/api/notes/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: note, error } = await supabase
        .from('notes')
        .update(body)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(note);
    } catch (error) {
      return jsonResponse({ message: "Failed to update note" }, 500);
    }
  }, params);
});

router.register('DELETE', '/api/notes/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return jsonResponse({ message: "Note deleted successfully" });
    } catch (error) {
      return jsonResponse({ message: "Failed to delete note" }, 500);
    }
  }, params);
});

// Races endpoints
router.register('GET', '/api/projects/:projectId/races', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const projectId = parseInt(params.projectId);
      const supabase = createUserSupabaseClient(env, token);
      
      const { data: project } = await supabase
        .from('projects')
        .select('id')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();
      
      if (!project) {
        return jsonResponse({ message: "Access denied" }, 403);
      }
      
      const { data: races, error } = await supabase
        .from('races')
        .select('*')
        .eq('project_id', projectId);
      
      if (error) throw error;
      return jsonResponse(races);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch races" }, 500);
    }
  }, params);
});

router.register('GET', '/api/races/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { data: race, error } = await supabase
        .from('races')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          return jsonResponse({ message: "Race not found" }, 404);
        }
        throw error;
      }
      
      return jsonResponse(race);
    } catch (error) {
      return jsonResponse({ message: "Failed to fetch race" }, 500);
    }
  }, params);
});

router.register('POST', '/api/races', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: race, error } = await supabase
        .from('races')
        .insert([body])
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(race, 201);
    } catch (error) {
      return jsonResponse({ message: "Invalid race data" }, 400);
    }
  }, params);
});

router.register('PUT', '/api/races/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const body = await request.json();
      const supabase = createUserSupabaseClient(env, token);
      const { data: race, error } = await supabase
        .from('races')
        .update(body)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return jsonResponse(race);
    } catch (error) {
      return jsonResponse({ message: "Failed to update race" }, 500);
    }
  }, params);
});

router.register('DELETE', '/api/races/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const id = parseInt(params.id);
      const supabase = createUserSupabaseClient(env, token);
      const { error } = await supabase
        .from('races')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return jsonResponse({ message: "Race deleted successfully" });
    } catch (error) {
      return jsonResponse({ message: "Failed to delete race" }, 500);
    }
  }, params);
});

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
