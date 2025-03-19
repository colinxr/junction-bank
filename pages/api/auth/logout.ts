import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '../../../lib/supabase/client';
import { withAuth } from '../../../lib/auth';

export default withAuth(async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
  userId: string
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Sign out with Supabase
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    // Clear cookies by setting them to expire immediately
    res.setHeader('Set-Cookie', [
      'auth_token=; Max-Age=0; Path=/; SameSite=Strict;',
      'auth_user=; Max-Age=0; Path=/; SameSite=Strict;'
    ]);

    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}); 