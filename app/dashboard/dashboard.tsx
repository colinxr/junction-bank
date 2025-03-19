import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import ProtectedRoute from '@/components/auth/protected-route';
import { clearAuthCookies } from '@/lib/auth-cookies';

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    clearAuthCookies(router);
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen flex-col p-8">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Junction Bank Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </header>
        <main className="flex-1">
          <div className="rounded-lg border p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Welcome to Your Dashboard</h2>
            <p>This is a protected page that only authenticated users can access.</p>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
} 