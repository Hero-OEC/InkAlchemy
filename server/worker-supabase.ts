// Cloudflare Workers entry point using Supabase for everything
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SupabaseStorage } from './supabase-storage';
import { 
  insertProjectSchema, insertCharacterSchema, insertLocationSchema, 
  insertEventSchema, insertMagicSystemSchema, insertSpellSchema, 
  insertLoreEntrySchema, insertNoteSchema, insertRelationshipSchema,
  insertCharacterSpellSchema, insertRaceSchema 
} from '@shared/schema';

// Types for Workers environment  
export interface Env {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

// Basic types for Cloudflare Workers
interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
  passThroughOnException(): void;
}

interface ExportedHandler<Env = unknown> {
  fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response>;
}

// Helper to create Supabase client
function createSupabaseClient(env: Env): SupabaseClient {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  
  return createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

// Simple router
class Router {
  private routes: Map<string, (request: Request, env: Env, params?: any) => Promise<Response>> = new Map();

  register(method: string, pattern: string, handler: (request: Request, env: Env, params?: any) => Promise<Response>) {
    this.routes.set(`${method}:${pattern}`, handler);
  }

  async handle(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    
    for (const [key, handler] of Array.from(this.routes.entries())) {
      const [routeMethod, routePattern] = key.split(':');
      if (routeMethod !== method) continue;
      
      const params = this.matchRoute(url.pathname, routePattern);
      if (params) {
        return await handler(request, env, params);
      }
    }

    return new Response('Not Found', { status: 404 });
  }

  private matchRoute(path: string, pattern: string): Record<string, string> | null {
    const pathParts = path.split('/').filter(Boolean);
    const patternParts = pattern.split('/').filter(Boolean);
    
    if (pathParts.length !== patternParts.length) return null;
    
    const params: Record<string, string> = {};
    
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        params[patternParts[i].slice(1)] = pathParts[i];
      } else if (patternParts[i] !== pathParts[i]) {
        return null;
      }
    }
    
    return params;
  }
}

const router = new Router();

// Helper to send JSON responses
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

// Auth middleware helper
async function withAuth(
  request: Request,
  env: Env,
  handler: (userId: string, token: string) => Promise<Response>
): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error('❌ Auth failed: No authorization header or invalid format');
    return jsonResponse({ message: 'Unauthorized', error: 'Missing or invalid authorization header' }, 401);
  }

  const token = authHeader.substring(7);
  
  try {
    const supabase = createSupabaseClient(env);
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error) {
      console.error('❌ Auth failed: Supabase error:', error);
      return jsonResponse({ message: 'Unauthorized', error: error.message }, 401);
    }
    
    if (!user) {
      console.error('❌ Auth failed: No user found for token');
      return jsonResponse({ message: 'Unauthorized', error: 'Invalid token' }, 401);
    }

    console.log('✅ Auth success for user:', user.id);
    return await handler(user.id, token);
  } catch (error) {
    console.error('❌ Auth exception:', error);
    return jsonResponse({ 
      message: 'Authentication error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
}

// ============================================================================
// ROUTES
// ============================================================================

// Health check
router.register('GET', '/api/health', async (request, env) => {
  return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
});

// ============================================================================
// PROJECTS
// ============================================================================

router.register('GET', '/api/projects', async (request, env) => {
  return withAuth(request, env, async (userId) => {
    try {
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const projects = await storage.getProjects();
      const userProjects = projects.filter(p => p.userId === userId);
      return jsonResponse(userProjects);
    } catch (error) {
      return jsonResponse({ message: 'Failed to fetch projects' }, 500);
    }
  });
});

router.register('GET', '/api/projects/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const project = await storage.getProject(id);
      
      if (!project) {
        return jsonResponse({ message: 'Project not found' }, 404);
      }
      
      if (project.userId !== userId) {
        return jsonResponse({ message: 'Access denied' }, 403);
      }
      
      return jsonResponse(project);
    } catch (error) {
      return jsonResponse({ message: 'Failed to fetch project' }, 500);
    }
  });
});

router.register('POST', '/api/projects', async (request, env) => {
  return withAuth(request, env, async (userId) => {
    try {
      const body = await request.json();
      console.log('📝 Creating project with data:', JSON.stringify(body, null, 2));
      
      const projectBodySchema = insertProjectSchema.omit({ userId: true });
      const bodyData = projectBodySchema.parse(body);
      const projectData = { ...bodyData, userId };
      
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const project = await storage.createProject(projectData);
      
      console.log('✅ Project created successfully:', project.id);
      return jsonResponse(project, 201);
    } catch (error) {
      console.error('❌ Project creation failed:', error);
      return jsonResponse({ 
        message: 'Invalid project data',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }, 400);
    }
  });
});

router.register('PATCH', '/api/projects/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const project = await storage.getProject(id);
      
      if (!project) {
        return jsonResponse({ message: 'Project not found' }, 404);
      }
      
      if (project.userId !== userId) {
        return jsonResponse({ message: 'Access denied' }, 403);
      }
      
      const body = await request.json();
      const data = insertProjectSchema.partial().parse(body);
      const updatedProject = await storage.updateProject(id, data);
      
      if (!updatedProject) {
        return jsonResponse({ message: 'Project not found' }, 404);
      }
      
      return jsonResponse(updatedProject);
    } catch (error) {
      return jsonResponse({ message: 'Invalid project data' }, 400);
    }
  });
});

router.register('DELETE', '/api/projects/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const project = await storage.getProject(id);
      
      if (!project) {
        return jsonResponse({ message: 'Project not found' }, 404);
      }
      
      if (project.userId !== userId) {
        return jsonResponse({ message: 'Access denied' }, 403);
      }
      
      await storage.deleteProject(id);
      return new Response(null, { status: 204 });
    } catch (error) {
      return jsonResponse({ message: 'Failed to delete project' }, 500);
    }
  });
});

// ============================================================================
// CHARACTERS
// ============================================================================

router.register('GET', '/api/projects/:projectId/characters', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const projectId = parseInt(params.projectId);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const project = await storage.getProject(projectId);
      
      if (!project || project.userId !== userId) {
        return jsonResponse({ message: 'Access denied' }, 403);
      }
      
      const characters = await storage.getCharacters(projectId);
      return jsonResponse(characters);
    } catch (error) {
      return jsonResponse({ message: 'Failed to fetch characters' }, 500);
    }
  });
});

router.register('GET', '/api/characters/:id', async (request, env, params) => {
  try {
    const id = parseInt(params.id);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const character = await storage.getCharacter(id);
    
    if (!character) {
      return jsonResponse({ message: 'Character not found' }, 404);
    }
    
    return jsonResponse(character);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch character' }, 500);
  }
});

router.register('POST', '/api/characters', async (request, env) => {
  return withAuth(request, env, async (userId) => {
    try {
      const body = await request.json();
      const data = insertCharacterSchema.parse(body);
      
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const character = await storage.createCharacter(data);
      
      return jsonResponse(character, 201);
    } catch (error) {
      return jsonResponse({ message: 'Invalid character data' }, 400);
    }
  });
});

router.register('PATCH', '/api/characters/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const currentCharacter = await storage.getCharacter(id);
      
      if (!currentCharacter) {
        return jsonResponse({ message: 'Character not found' }, 404);
      }
      
      const body = await request.json();
      const data = insertCharacterSchema.partial().parse(body);
      const character = await storage.updateCharacter(id, data);
      
      if (!character) {
        return jsonResponse({ message: 'Character not found' }, 404);
      }
      
      return jsonResponse(character);
    } catch (error) {
      return jsonResponse({ message: 'Invalid character data' }, 400);
    }
  });
});

router.register('DELETE', '/api/characters/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const character = await storage.getCharacter(id);
      
      if (!character) {
        return jsonResponse({ message: 'Character not found' }, 404);
      }
      
      const deleted = await storage.deleteCharacter(id);
      
      if (!deleted) {
        return jsonResponse({ message: 'Failed to delete character' }, 500);
      }
      
      return new Response(null, { status: 204 });
    } catch (error) {
      return jsonResponse({ message: 'Failed to delete character' }, 500);
    }
  });
});

// Character Spells
router.register('GET', '/api/characters/:characterId/spells', async (request, env, params) => {
  try {
    const characterId = parseInt(params.characterId);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const spells = await storage.getCharacterSpells(characterId);
    return jsonResponse(spells);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch character spells' }, 500);
  }
});

router.register('POST', '/api/characters/:characterId/spells', async (request, env, params) => {
  try {
    const characterId = parseInt(params.characterId);
    const body = await request.json();
    const data = insertCharacterSpellSchema.parse({ ...body, characterId });
    
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const characterSpell = await storage.addCharacterSpell(data);
    
    return jsonResponse(characterSpell, 201);
  } catch (error) {
    return jsonResponse({ message: 'Invalid character spell data' }, 400);
  }
});

router.register('DELETE', '/api/characters/:characterId/spells/:spellId', async (request, env, params) => {
  try {
    const characterId = parseInt(params.characterId);
    const spellId = parseInt(params.spellId);
    
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const deleted = await storage.removeCharacterSpell(characterId, spellId);
    
    if (!deleted) {
      return jsonResponse({ message: 'Character spell not found' }, 404);
    }
    
    return new Response(null, { status: 204 });
  } catch (error) {
    return jsonResponse({ message: 'Failed to remove character spell' }, 500);
  }
});

// ============================================================================
// LOCATIONS
// ============================================================================

router.register('GET', '/api/projects/:projectId/locations', async (request, env, params) => {
  try {
    const projectId = parseInt(params.projectId);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const locations = await storage.getLocations(projectId);
    return jsonResponse(locations);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch locations' }, 500);
  }
});

router.register('GET', '/api/locations/:id', async (request, env, params) => {
  try {
    const id = parseInt(params.id);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const location = await storage.getLocation(id);
    
    if (!location) {
      return jsonResponse({ message: 'Location not found' }, 404);
    }
    
    return jsonResponse(location);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch location' }, 500);
  }
});

router.register('POST', '/api/locations', async (request, env) => {
  return withAuth(request, env, async (userId) => {
    try {
      const body = await request.json();
      const data = insertLocationSchema.parse(body);
      
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const location = await storage.createLocation(data);
      
      return jsonResponse(location, 201);
    } catch (error) {
      return jsonResponse({ message: 'Invalid location data' }, 400);
    }
  });
});

router.register('PATCH', '/api/locations/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const currentLocation = await storage.getLocation(id);
      
      if (!currentLocation) {
        return jsonResponse({ message: 'Location not found' }, 404);
      }
      
      const body = await request.json();
      const data = insertLocationSchema.partial().parse(body);
      const location = await storage.updateLocation(id, data);
      
      if (!location) {
        return jsonResponse({ message: 'Location not found' }, 404);
      }
      
      return jsonResponse(location);
    } catch (error) {
      return jsonResponse({ message: 'Invalid location data' }, 400);
    }
  });
});

router.register('DELETE', '/api/locations/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const location = await storage.getLocation(id);
      
      if (!location) {
        return jsonResponse({ message: 'Location not found' }, 404);
      }
      
      // Handle cascade: remove location reference from events
      const eventsWithLocation = await storage.getEventsByLocation(id);
      for (const event of eventsWithLocation) {
        await storage.updateEvent(event.id, { locationId: null });
      }
      
      const deleted = await storage.deleteLocation(id);
      
      if (!deleted) {
        return jsonResponse({ message: 'Location not found' }, 404);
      }
      
      return new Response(null, { status: 204 });
    } catch (error) {
      return jsonResponse({ message: 'Failed to delete location' }, 500);
    }
  });
});

// ============================================================================
// EVENTS
// ============================================================================

router.register('GET', '/api/projects/:projectId/events', async (request, env, params) => {
  try {
    const projectId = parseInt(params.projectId);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const events = await storage.getEvents(projectId);
    return jsonResponse(events);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch events' }, 500);
  }
});

router.register('GET', '/api/events/:id', async (request, env, params) => {
  try {
    const id = parseInt(params.id);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const event = await storage.getEvent(id);
    
    if (!event) {
      return jsonResponse({ message: 'Event not found' }, 404);
    }
    
    return jsonResponse(event);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch event' }, 500);
  }
});

router.register('POST', '/api/events', async (request, env) => {
  return withAuth(request, env, async (userId) => {
    try {
      const body = await request.json();
      const data = insertEventSchema.parse(body);
      
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const event = await storage.createEvent(data);
      
      return jsonResponse(event, 201);
    } catch (error) {
      return jsonResponse({ message: 'Invalid event data' }, 400);
    }
  });
});

router.register('PATCH', '/api/events/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const currentEvent = await storage.getEvent(id);
      
      if (!currentEvent) {
        return jsonResponse({ message: 'Event not found' }, 404);
      }
      
      const body = await request.json();
      const data = insertEventSchema.partial().parse(body);
      const event = await storage.updateEvent(id, data);
      
      if (!event) {
        return jsonResponse({ message: 'Event not found' }, 404);
      }
      
      return jsonResponse(event);
    } catch (error) {
      return jsonResponse({ message: 'Invalid event data' }, 400);
    }
  });
});

router.register('DELETE', '/api/events/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const event = await storage.getEvent(id);
      
      if (!event) {
        return jsonResponse({ message: 'Event not found' }, 404);
      }
      
      const deleted = await storage.deleteEvent(id);
      
      if (!deleted) {
        return jsonResponse({ message: 'Event not found' }, 404);
      }
      
      return new Response(null, { status: 204 });
    } catch (error) {
      return jsonResponse({ message: 'Failed to delete event' }, 500);
    }
  });
});

// ============================================================================
// MAGIC SYSTEMS
// ============================================================================

router.register('GET', '/api/projects/:projectId/magic-systems', async (request, env, params) => {
  try {
    const projectId = parseInt(params.projectId);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const magicSystems = await storage.getMagicSystems(projectId);
    return jsonResponse(magicSystems);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch magic systems' }, 500);
  }
});

router.register('GET', '/api/magic-systems/:id', async (request, env, params) => {
  try {
    const id = parseInt(params.id);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const magicSystem = await storage.getMagicSystem(id);
    
    if (!magicSystem) {
      return jsonResponse({ message: 'Magic system not found' }, 404);
    }
    
    return jsonResponse(magicSystem);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch magic system' }, 500);
  }
});

router.register('POST', '/api/magic-systems', async (request, env) => {
  return withAuth(request, env, async (userId) => {
    try {
      const body = await request.json();
      const data = insertMagicSystemSchema.parse(body);
      
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const magicSystem = await storage.createMagicSystem(data);
      
      return jsonResponse(magicSystem, 201);
    } catch (error) {
      return jsonResponse({ message: 'Invalid magic system data' }, 400);
    }
  });
});

router.register('PATCH', '/api/magic-systems/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const currentMagicSystem = await storage.getMagicSystem(id);
      
      if (!currentMagicSystem) {
        return jsonResponse({ message: 'Magic system not found' }, 404);
      }
      
      const body = await request.json();
      const data = insertMagicSystemSchema.partial().parse(body);
      const magicSystem = await storage.updateMagicSystem(id, data);
      
      if (!magicSystem) {
        return jsonResponse({ message: 'Magic system not found' }, 404);
      }
      
      return jsonResponse(magicSystem);
    } catch (error) {
      return jsonResponse({ message: 'Invalid magic system data' }, 400);
    }
  });
});

router.register('DELETE', '/api/magic-systems/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const magicSystem = await storage.getMagicSystem(id);
      
      if (!magicSystem) {
        return jsonResponse({ message: 'Magic system not found' }, 404);
      }
      
      const deleted = await storage.deleteMagicSystem(id);
      
      if (!deleted) {
        return jsonResponse({ message: 'Failed to delete magic system' }, 500);
      }
      
      return new Response(null, { status: 204 });
    } catch (error) {
      return jsonResponse({ message: 'Failed to delete magic system' }, 500);
    }
  });
});

// ============================================================================
// SPELLS
// ============================================================================

router.register('GET', '/api/projects/:projectId/spells', async (request, env, params) => {
  try {
    const projectId = parseInt(params.projectId);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const spells = await storage.getAllSpellsForProject(projectId);
    return jsonResponse(spells);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch spells' }, 500);
  }
});

router.register('GET', '/api/magic-systems/:magicSystemId/spells', async (request, env, params) => {
  try {
    const magicSystemId = parseInt(params.magicSystemId);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const spells = await storage.getSpells(magicSystemId);
    return jsonResponse(spells);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch spells' }, 500);
  }
});

router.register('GET', '/api/spells/:id', async (request, env, params) => {
  try {
    const id = parseInt(params.id);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const spell = await storage.getSpell(id);
    
    if (!spell) {
      return jsonResponse({ message: 'Spell not found' }, 404);
    }
    
    return jsonResponse(spell);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch spell' }, 500);
  }
});

router.register('POST', '/api/spells', async (request, env) => {
  return withAuth(request, env, async (userId) => {
    try {
      const body = await request.json();
      const data = insertSpellSchema.parse(body);
      
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const spell = await storage.createSpell(data);
      
      return jsonResponse(spell, 201);
    } catch (error) {
      return jsonResponse({ message: 'Invalid spell data' }, 400);
    }
  });
});

router.register('PATCH', '/api/spells/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const currentSpell = await storage.getSpell(id);
      
      if (!currentSpell) {
        return jsonResponse({ message: 'Spell not found' }, 404);
      }
      
      const body = await request.json();
      const data = insertSpellSchema.partial().parse(body);
      const spell = await storage.updateSpell(id, data);
      
      if (!spell) {
        return jsonResponse({ message: 'Spell not found' }, 404);
      }
      
      return jsonResponse(spell);
    } catch (error) {
      return jsonResponse({ message: 'Invalid spell data' }, 400);
    }
  });
});

router.register('DELETE', '/api/spells/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const spell = await storage.getSpell(id);
      
      if (!spell) {
        return jsonResponse({ message: 'Spell not found' }, 404);
      }
      
      const deleted = await storage.deleteSpell(id);
      
      if (!deleted) {
        return jsonResponse({ message: 'Failed to delete spell' }, 500);
      }
      
      return new Response(null, { status: 204 });
    } catch (error) {
      return jsonResponse({ message: 'Failed to delete spell' }, 500);
    }
  });
});

router.register('GET', '/api/spells/by-magic-system/:magicSystemId', async (request, env, params) => {
  try {
    const magicSystemId = parseInt(params.magicSystemId);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const spells = await storage.getSpells(magicSystemId);
    return jsonResponse(spells);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch spells' }, 500);
  }
});

router.register('GET', '/api/spells/by-character/:characterId', async (request, env, params) => {
  try {
    const characterId = parseInt(params.characterId);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const spells = await storage.getCharacterSpells(characterId);
    return jsonResponse(spells);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch character spells' }, 500);
  }
});

// ============================================================================
// LORE ENTRIES
// ============================================================================

router.register('GET', '/api/projects/:projectId/lore', async (request, env, params) => {
  try {
    const projectId = parseInt(params.projectId);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const loreEntries = await storage.getLoreEntries(projectId);
    return jsonResponse(loreEntries);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch lore entries' }, 500);
  }
});

router.register('GET', '/api/lore/:id', async (request, env, params) => {
  try {
    const id = parseInt(params.id);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const loreEntry = await storage.getLoreEntry(id);
    
    if (!loreEntry) {
      return jsonResponse({ message: 'Lore entry not found' }, 404);
    }
    
    return jsonResponse(loreEntry);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch lore entry' }, 500);
  }
});

router.register('POST', '/api/lore', async (request, env) => {
  return withAuth(request, env, async (userId) => {
    try {
      const body = await request.json();
      const data = insertLoreEntrySchema.parse(body);
      
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const loreEntry = await storage.createLoreEntry(data);
      
      return jsonResponse(loreEntry, 201);
    } catch (error) {
      return jsonResponse({ message: 'Invalid lore entry data' }, 400);
    }
  });
});

router.register('PATCH', '/api/lore/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const currentLoreEntry = await storage.getLoreEntry(id);
      
      if (!currentLoreEntry) {
        return jsonResponse({ message: 'Lore entry not found' }, 404);
      }
      
      const body = await request.json();
      const data = insertLoreEntrySchema.partial().parse(body);
      const loreEntry = await storage.updateLoreEntry(id, data);
      
      if (!loreEntry) {
        return jsonResponse({ message: 'Lore entry not found' }, 404);
      }
      
      return jsonResponse(loreEntry);
    } catch (error) {
      return jsonResponse({ message: 'Invalid lore entry data' }, 400);
    }
  });
});

router.register('DELETE', '/api/lore/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const loreEntry = await storage.getLoreEntry(id);
      
      if (!loreEntry) {
        return jsonResponse({ message: 'Lore entry not found' }, 404);
      }
      
      const deleted = await storage.deleteLoreEntry(id);
      
      if (!deleted) {
        return jsonResponse({ message: 'Lore entry not found' }, 404);
      }
      
      return new Response(null, { status: 204 });
    } catch (error) {
      return jsonResponse({ message: 'Failed to delete lore entry' }, 500);
    }
  });
});

// ============================================================================
// NOTES
// ============================================================================

router.register('GET', '/api/projects/:projectId/notes', async (request, env, params) => {
  try {
    const projectId = parseInt(params.projectId);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const notes = await storage.getNotes(projectId);
    return jsonResponse(notes);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch notes' }, 500);
  }
});

router.register('GET', '/api/notes/:id', async (request, env, params) => {
  try {
    const id = parseInt(params.id);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const note = await storage.getNote(id);
    
    if (!note) {
      return jsonResponse({ message: 'Note not found' }, 404);
    }
    
    return jsonResponse(note);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch note' }, 500);
  }
});

router.register('POST', '/api/notes', async (request, env) => {
  return withAuth(request, env, async (userId) => {
    try {
      const body = await request.json();
      const data = insertNoteSchema.parse(body);
      
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const note = await storage.createNote(data);
      
      return jsonResponse(note, 201);
    } catch (error) {
      return jsonResponse({ message: 'Invalid note data' }, 400);
    }
  });
});

router.register('PATCH', '/api/notes/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const currentNote = await storage.getNote(id);
      
      if (!currentNote) {
        return jsonResponse({ message: 'Note not found' }, 404);
      }
      
      const body = await request.json();
      const data = insertNoteSchema.partial().parse(body);
      const note = await storage.updateNote(id, data);
      
      if (!note) {
        return jsonResponse({ message: 'Note not found' }, 404);
      }
      
      return jsonResponse(note);
    } catch (error) {
      return jsonResponse({ message: 'Invalid note data' }, 400);
    }
  });
});

router.register('DELETE', '/api/notes/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const note = await storage.getNote(id);
      
      if (!note) {
        return jsonResponse({ message: 'Note not found' }, 404);
      }
      
      const deleted = await storage.deleteNote(id);
      
      if (!deleted) {
        return jsonResponse({ message: 'Note not found' }, 404);
      }
      
      return new Response(null, { status: 204 });
    } catch (error) {
      return jsonResponse({ message: 'Failed to delete note' }, 500);
    }
  });
});

// ============================================================================
// RACES
// ============================================================================

router.register('GET', '/api/projects/:projectId/races', async (request, env, params) => {
  try {
    const projectId = parseInt(params.projectId);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const races = await storage.getRaces(projectId);
    return jsonResponse(races);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch races' }, 500);
  }
});

router.register('GET', '/api/races/:id', async (request, env, params) => {
  try {
    const id = parseInt(params.id);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const race = await storage.getRace(id);
    
    if (!race) {
      return jsonResponse({ message: 'Race not found' }, 404);
    }
    
    return jsonResponse(race);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch race' }, 500);
  }
});

router.register('POST', '/api/races', async (request, env) => {
  return withAuth(request, env, async (userId) => {
    try {
      const body = await request.json();
      console.log('📝 Creating race with data:', JSON.stringify(body, null, 2));
      
      const data = insertRaceSchema.parse(body);
      
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const race = await storage.createRace(data);
      
      console.log('✅ Race created successfully:', race.id);
      return jsonResponse(race, 201);
    } catch (error) {
      console.error('❌ Race creation failed:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      return jsonResponse({ 
        message: 'Invalid race data',
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error
      }, 400);
    }
  });
});

router.register('PATCH', '/api/races/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      
      const body = await request.json();
      const data = insertRaceSchema.partial().parse(body);
      const race = await storage.updateRace(id, data);
      
      if (!race) {
        return jsonResponse({ message: 'Race not found' }, 404);
      }
      
      return jsonResponse(race);
    } catch (error) {
      return jsonResponse({ message: 'Invalid race data' }, 400);
    }
  });
});

router.register('DELETE', '/api/races/:id', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const id = parseInt(params.id);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const race = await storage.getRace(id);
      
      if (!race) {
        return jsonResponse({ message: 'Race not found' }, 404);
      }
      
      // Check if any characters are using this race
      const charactersUsingRace = await storage.getCharactersByRace(id);
      if (charactersUsingRace.length > 0) {
        const characterNames = charactersUsingRace.map(c => c.name).join(', ');
        return jsonResponse({ 
          message: `Cannot delete race. It is being used by the following characters: ${characterNames}. Please update these characters to use a different race first.` 
        }, 400);
      }
      
      const deleted = await storage.deleteRace(id);
      
      if (!deleted) {
        return jsonResponse({ message: 'Race not found' }, 404);
      }
      
      return new Response(null, { status: 204 });
    } catch (error) {
      return jsonResponse({ message: 'Failed to delete race' }, 500);
    }
  });
});

// ============================================================================
// RELATIONSHIPS
// ============================================================================

router.register('GET', '/api/projects/:projectId/relationships', async (request, env, params) => {
  try {
    const projectId = parseInt(params.projectId);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const relationships = await storage.getRelationships(projectId);
    return jsonResponse(relationships);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch relationships' }, 500);
  }
});

router.register('POST', '/api/relationships', async (request, env) => {
  try {
    const body = await request.json();
    const data = insertRelationshipSchema.parse(body);
    
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const relationship = await storage.createRelationship(data);
    
    return jsonResponse(relationship, 201);
  } catch (error) {
    return jsonResponse({ message: 'Invalid relationship data' }, 400);
  }
});

router.register('DELETE', '/api/relationships/:id', async (request, env, params) => {
  try {
    const id = parseInt(params.id);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const deleted = await storage.deleteRelationship(id);
    
    if (!deleted) {
      return jsonResponse({ message: 'Relationship not found' }, 404);
    }
    
    return new Response(null, { status: 204 });
  } catch (error) {
    return jsonResponse({ message: 'Failed to delete relationship' }, 500);
  }
});

// ============================================================================
// ACTIVITIES & STATS
// ============================================================================

router.register('GET', '/api/projects/:projectId/activities', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    try {
      const projectId = parseInt(params.projectId);
      const storage = new SupabaseStorage(createSupabaseClient(env));
      const activities = await storage.getProjectActivities(projectId);
      return jsonResponse(activities);
    } catch (error) {
      return jsonResponse({ message: 'Failed to fetch project activities' }, 500);
    }
  });
});

router.register('GET', '/api/projects/:projectId/stats', async (request, env, params) => {
  try {
    const projectId = parseInt(params.projectId);
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const stats = await storage.getProjectStats(projectId);
    return jsonResponse(stats);
  } catch (error) {
    return jsonResponse({ message: 'Failed to fetch project stats' }, 500);
  }
});

// ============================================================================
// SEARCH
// ============================================================================

router.register('GET', '/api/projects/:projectId/search', async (request, env, params) => {
  try {
    const projectId = parseInt(params.projectId);
    const url = new URL(request.url);
    const query = url.searchParams.get('q');
    
    if (!query) {
      return jsonResponse({ message: 'Query parameter required' }, 400);
    }
    
    const storage = new SupabaseStorage(createSupabaseClient(env));
    const results = await storage.searchElements(projectId, query);
    return jsonResponse(results);
  } catch (error) {
    return jsonResponse({ message: 'Search failed' }, 500);
  }
});

// ============================================================================
// IMAGE MANAGEMENT
// ============================================================================

// Note: Image upload endpoints are simplified for Workers environment
// Full file upload functionality would require multipart/form-data handling

router.register('POST', '/api/upload-image', async (request, env) => {
  return jsonResponse({ message: 'Image upload not supported in Workers environment' }, 501);
});

router.register('POST', '/api/upload-image-by-url', async (request, env) => {
  return jsonResponse({ message: 'Image upload by URL not supported in Workers environment' }, 501);
});

router.register('POST', '/api/upload-character-image', async (request, env) => {
  return withAuth(request, env, async (userId) => {
    return jsonResponse({ message: 'Character image upload not supported in Workers environment' }, 501);
  });
});

router.register('POST', '/api/characters/:id/upload-image', async (request, env, params) => {
  return withAuth(request, env, async (userId) => {
    return jsonResponse({ message: 'Character image upload not supported in Workers environment' }, 501);
  });
});

router.register('DELETE', '/api/delete-image', async (request, env) => {
  return withAuth(request, env, async (userId) => {
    try {
      const body = await request.json();
      const { url } = body;
      
      if (!url) {
        return jsonResponse({ message: 'Image URL is required' }, 400);
      }
      
      // For Supabase storage deletion
      if (url.includes('supabase.co')) {
        const supabase = createSupabaseClient(env);
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        
        let bucketName = 'content-images';
        if (url.includes('character-images')) {
          bucketName = 'character-images';
        } else if (url.includes('profile-images')) {
          bucketName = 'profile-images';
        }
        
        const { error } = await supabase.storage
          .from(bucketName)
          .remove([decodeURIComponent(fileName)]);
          
        if (error) {
          return jsonResponse({ message: 'Failed to delete image from storage' }, 500);
        }
        
        return jsonResponse({ message: 'Image deleted successfully' });
      }
      
      return jsonResponse({ message: 'Image URL not recognized' });
    } catch (error) {
      return jsonResponse({ message: 'Failed to delete image' }, 500);
    }
  });
});

// ============================================================================
// USER MANAGEMENT
// ============================================================================

router.register('GET', '/api/user/profile', async (request, env) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const supabase = createSupabaseClient(env);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // If no profile exists, return basic user info
      if (!profile) {
        const { data: { user }, error: userError } = await supabase.auth.getUser(token);
        if (userError || !user) {
          return jsonResponse({ message: 'Failed to fetch user' }, 500);
        }
        
        return jsonResponse({
          id: user.id,
          email: user.email,
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'User',
          avatar_url: null
        });
      }
      
      return jsonResponse(profile);
    } catch (error) {
      return jsonResponse({ message: 'Failed to fetch profile' }, 500);
    }
  });
});

router.register('PATCH', '/api/user/update-profile', async (request, env) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const body = await request.json();
      const { username, email } = body;
      
      const supabase = createSupabaseClient(env);
      
      // Update Supabase user metadata
      if (username) {
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          user_metadata: {
            username: username,
            display_name: username,
            full_name: username
          }
        });
        
        if (error) {
          return jsonResponse({ message: 'Failed to update profile' }, 500);
        }
      }
      
      return jsonResponse({ message: 'Profile updated successfully', username, email });
    } catch (error) {
      return jsonResponse({ message: 'Failed to update profile' }, 500);
    }
  });
});

router.register('POST', '/api/user/update-profile-image', async (request, env) => {
  return withAuth(request, env, async (userId) => {
    return jsonResponse({ message: 'Profile image upload not supported in Workers environment' }, 501);
  });
});

router.register('DELETE', '/api/user/delete-account', async (request, env) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const storage = new SupabaseStorage(createSupabaseClient(env));
      
      // Delete all user's data
      await storage.deleteAllUserData(userId);
      
      // Delete the user account from Supabase
      const supabase = createSupabaseClient(env);
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) {
        return jsonResponse({ message: 'Failed to delete account' }, 500);
      }
      
      return jsonResponse({ message: 'Account and all associated data deleted successfully' });
    } catch (error) {
      return jsonResponse({ message: 'Failed to delete account' }, 500);
    }
  });
});

// ============================================================================
// AUTH
// ============================================================================

router.register('POST', '/api/auth/forgot-password', async (request, env) => {
  try {
    const body = await request.json();
    const { email } = body;
    
    if (!email) {
      return jsonResponse({ message: 'Email is required' }, 400);
    }
    
    const supabase = createSupabaseClient(env);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/reset-password`,
    });
    
    if (error) {
      // Don't reveal whether email exists for security
      return jsonResponse({ message: 'If the email exists, a reset link has been sent' });
    }
    
    return jsonResponse({ message: 'Password reset email sent successfully' });
  } catch (error) {
    return jsonResponse({ message: 'Failed to send reset email' }, 500);
  }
});

router.register('POST', '/api/auth/validate-reset-token', async (request, env) => {
  try {
    const body = await request.json();
    const { token } = body;
    
    if (!token) {
      return jsonResponse({ message: 'Reset token is required' }, 400);
    }
    
    const supabase = createSupabaseClient(env);
    const { data, error } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash: token,
    });
    
    if (error || !data.user) {
      return jsonResponse({ message: 'Invalid or expired reset token' }, 400);
    }
    
    return jsonResponse({ message: 'Token is valid', userId: data.user.id });
  } catch (error) {
    return jsonResponse({ message: 'Invalid reset token' }, 400);
  }
});

router.register('POST', '/api/auth/reset-password', async (request, env) => {
  try {
    const body = await request.json();
    const { token, password } = body;
    
    if (!token || !password) {
      return jsonResponse({ message: 'Token and password are required' }, 400);
    }
    
    if (password.length < 8) {
      return jsonResponse({ message: 'Password must be at least 8 characters' }, 400);
    }
    
    const supabase = createSupabaseClient(env);
    
    // Verify the token and create a session
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      type: 'recovery',
      token_hash: token,
    });
    
    if (verifyError || !data.user) {
      return jsonResponse({ message: 'Invalid or expired reset token' }, 400);
    }
    
    // Update the password
    const { error: updateError } = await supabase.auth.updateUser({ 
      password: password 
    });
    
    if (updateError) {
      return jsonResponse({ message: 'Failed to update password' }, 400);
    }
    
    return jsonResponse({ message: 'Password reset successfully' });
  } catch (error) {
    return jsonResponse({ message: 'Failed to reset password' }, 500);
  }
});

// ============================================================================
// EXPORT
// ============================================================================

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
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api')) {
      return router.handle(request, env);
    }

    // For non-API requests, serve static files (handled by Cloudflare Pages)
    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
