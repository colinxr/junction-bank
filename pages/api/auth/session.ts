import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '../../../lib/supabase/server';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = await createClient();
    // Get authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    // Get user data from Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Return user data
    return res.status(200).json({
      user: data.user,
      authenticated: true
    });
  } catch (error) {
    console.error('Session check error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 