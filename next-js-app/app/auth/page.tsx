import { redirect } from 'next/navigation';

export default function AuthPage() {
  // Redirect to login page
  redirect('/auth/login');
  
  // This won't be rendered due to the redirect above
  return null;
} 