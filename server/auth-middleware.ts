import "./env";

import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Auth middleware - Supabase URL:', supabaseUrl ? 'SET' : 'NOT SET');
console.log('Auth middleware - Service Key:', supabaseServiceKey ? 'SET' : 'NOT SET');

// Only create supabase client if credentials are available
export const supabase = supabaseUrl && supabaseServiceKey ? 
  createClient(supabaseUrl, supabaseServiceKey) : null;

console.log('Auth middleware - Supabase client:', supabase ? 'CREATED' : 'NOT CREATED');

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

// Require authentication for all requests
export function optionalAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  return authenticateUser(req, res, next);
}