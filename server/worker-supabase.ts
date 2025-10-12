
// Cloudflare Workers entry point using Supabase for everything
import { createClient, SupabaseClient } from '@supabase/supabase-js';

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

// Helper to create authenticated Supabase client
async function createUserSupabaseClient(env: Env, accessToken: string): Promise<SupabaseClient> {
  if (!env.VITE_SUPABASE_URL || !env.VITE_SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase environment variables');
  }
  
  const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });

  return supabase;
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
    
    for (const [key, handler] of this.routes) {
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
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Auth middleware helper
async function withAuth(
  request: Request,
  env: Env,
  handler: (userId: string, token: string) => Promise<Response>,
  params?: any
): Promise<Response> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return jsonResponse({ message: 'Unauthorized' }, 401);
  }

  const token = authHeader.substring(7);
  const supabase = createSupabaseClient(env);
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return jsonResponse({ message: 'Unauthorized' }, 401);
  }

  return await handler(user.id, token);
}

// Register routes
router.register('GET', '/api/health', async (request, env) => {
  return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth route - just proxies to Supabase
router.register('POST', '/api/auth', async (request, env) => {
  try {
    const body = await request.json();
    const supabase = createSupabaseClient(env);
    
    // This is handled by Supabase on the client side
    // We just return that the endpoint exists
    return jsonResponse({ message: 'Auth handled by Supabase client' });
  } catch (error) {
    return jsonResponse({ message: 'Invalid request' }, 400);
  }
});

// User profile
router.register('GET', '/api/user/profile', async (request, env, params) => {
  return withAuth(request, env, async (userId, token) => {
    try {
      const supabase = await createUserSupabaseClient(env, token);
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return jsonResponse(profile);
    } catch (error) {
      return jsonResponse({ message: 'Failed to fetch profile' }, 500);
    }
  }, params);
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
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api')) {
      return router.handle(request, env);
    }

    // For non-API requests, serve static files (handled by Cloudflare Pages)
    return new Response('Not Found', { status: 404 });
  },
} satisfies ExportedHandler<Env>;
