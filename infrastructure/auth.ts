import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from './supabase/client';

type NextApiHandlerWithAuth = (
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) => Promise<void | NextApiResponse>;

/**
 * Middleware to check if the user is authenticated before allowing access to API routes
 */
export function withAuth(handler: NextApiHandlerWithAuth) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Get the authorization header from the request
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Missing authorization header' });
    }

    // Extract the token
    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Invalid authorization format' });
    }

    try {
      // Verify the JWT token with Supabase
      const supabase = createClient();
      const { data, error } = await supabase.auth.getUser(token);

      if (error || !data.user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      // Pass the user ID to the handler
      return handler(req, res, data.user.id);
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
} 