'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/icons';
import { LogOut, UserCircle } from 'lucide-react';
import { TransactionForm } from './transaction-form';
import { TransactionHistory } from './transaction-history';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


export function Dashboard() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Logo className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">ZenBank</h1>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/profile" className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`} alt={user.name} />
                <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="font-medium">{user.username}</span>
            </Link>
          </Button>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-2xl space-y-6">
          <Card className="shadow-lg">
            <CardHeader>
              <CardDescription>Current Balance</CardDescription>
              <CardTitle className="text-4xl font-bold tracking-tighter">
                {formatCurrency(user.balance)}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="shadow-lg">
            <Tabs defaultValue="withdraw" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
                  <TabsTrigger value="deposit">Deposit</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent>
                <TabsContent value="withdraw">
                  <TransactionForm type="withdrawal" />
                </TabsContent>
                <TabsContent value="deposit">
                  <TransactionForm type="deposit" />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>

          <TransactionHistory transactions={user.transactions} />
        </div>
      </main>
    </div>
  );
}
