import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function HomePage() {
  // Check if user is authenticated
  const cookieStore = await cookies();
  const authToken = cookieStore.get("auth_token");
  
  // Redirect based on authentication status
  if (authToken) {
    redirect("/dashboard");
  } else {
    redirect("/auth/login");
  }

  // This won't be rendered due to the redirects above
  return null;
}
