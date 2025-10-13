import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs/server';

export default async function HomePage() {
  // Get authentication status from Clerk
  const { userId } = await auth();
  
  // Redirect based on authentication status
  if (userId) {
    redirect("/dashboard");
  } else {
    redirect("/auth/login");
  }
}
