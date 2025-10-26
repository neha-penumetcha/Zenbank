'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Dashboard } from '@/components/dashboard';
import { Loader2 } from 'lucide-react';

export default function HomePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isClient && !authLoading && !user) {
      router.replace('/login');
    }
  }, [user, authLoading, router, isClient]);

  if (!isClient || authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <Dashboard />;
}
