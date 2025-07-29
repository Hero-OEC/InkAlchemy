import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

// Only create supabase client if credentials are available
export const supabase = supabaseUrl && supabaseServiceKey ? 
  createClient(supabaseUrl, supabaseServiceKey) : null;

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export async function authenticateUser(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    if (!supabase) {
      return res.status(500).json({ message: 'Authentication service not configured' });
    }

    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      console.error('Authentication error:', error);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    console.log('Authenticated user:', user.id, user.email);
    req.userId = user.id;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
}

// For development/testing - allows requests without auth but validates if auth is present
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // If auth is provided, validate it with real Supabase
    return authenticateUser(req, res, next);
  } else {
    // No auth provided - for development only, use mock user
    // In production, this should require authentication
    req.userId = '00000000-0000-0000-0000-000000000001';
    next();
  }
}