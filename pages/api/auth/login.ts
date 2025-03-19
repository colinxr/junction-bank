import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '../../../lib/supabase/server';
import { setAuthCookies } from '../../../lib/auth-cookies';

// Define types
type LoginRequestBody = {
  email: string;
  password: string;
};

// List of authorized users (for validation)
const AUTHORIZED_USERS = ['user1@example.com', 'user2@example.com'];

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabase = await createClient();
    const { email, password } = req.body as LoginRequestBody;

    // Validate request data
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check if user is in the authorized list
    if (!AUTHORIZED_USERS.includes(email)) {
      return res.status(401).json({ error: 'User not authorized' });
    }

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Set auth cookies
    if (data.session) {
      setAuthCookies(data.session.access_token, data.user, res);
    }

    // Return session data
    return res.status(200).json({
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 