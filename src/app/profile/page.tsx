'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Loader2, User, Mail, Phone, Home, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Logo } from '@/components/icons';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
       <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">ZenBank</h1>
        </div>
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </header>
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6 md:p-8">
        <Card className="w-full max-w-2xl shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary">
                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-3xl font-bold">{user.name}</CardTitle>
                <CardDescription className="text-lg">@{user.username}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="mt-4 space-y-6">
             <div className="flex items-center gap-4">
              <Mail className="h-6 w-6 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="h-6 w-6 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                <p className="font-semibold">{user.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Home className="h-6 w-6 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Address</p>
                <p className="font-semibold">{user.address}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
