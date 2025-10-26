'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/icons';
import { LogOut, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { TransactionForm } from './transaction-form';
import { TransactionHistory } from './transaction-history';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { Input } from './ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTimer } from '@/hooks/use-timer';

const pinSchema = z.object({
  pin: z.string().length(4, { message: 'PIN must be 4 digits.' }),
});

export function Dashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { remainingTime } = useTimer();

  const pinForm = useForm<z.infer<typeof pinSchema>>({
    resolver: zodResolver(pinSchema),
    defaultValues: {
      pin: '',
    },
  });

  if (!user) return null;

  const getFirstName = (name: string) => {
    return name.split(' ')[0];
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handlePinSubmit = (values: z.infer<typeof pinSchema>) => {
    setIsLoading(true);
    if (values.pin === user.pin) {
      setIsBalanceVisible(true);
      setIsPinModalOpen(false);
      toast({
        title: 'PIN Correct',
        description: 'Balance is now visible.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Incorrect PIN',
        description: 'The PIN you entered is incorrect.',
      });
    }
    pinForm.reset();
    setIsLoading(false);
  };

  const toggleBalanceVisibility = () => {
    if (isBalanceVisible) {
      setIsBalanceVisible(false);
    } else {
      setIsPinModalOpen(true);
    }
  };

  return (
    <>
      <div className="flex min-h-screen w-full flex-col bg-background">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-card px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <h1 className="text-xl font-bold">ZenBank</h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
              <span className="font-mono text-sm text-muted-foreground">
                {formatTime(remainingTime)}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`}
                      alt={user.name}
                    />
                    <AvatarFallback>
                      {user.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      @{user.username}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="flex flex-1 flex-col items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="w-full max-w-2xl space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Welcome, {getFirstName(user.name)}!
                </CardTitle>
                <CardDescription>Current Balance</CardDescription>
                <div className="flex items-center justify-between">
                  <p className="text-4xl font-bold tracking-tighter">
                    {isBalanceVisible ? formatCurrency(user.balance) : '******'}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleBalanceVisibility}
                  >
                    {isBalanceVisible ? (
                      <EyeOff className="h-6 w-6" />
                    ) : (
                      <Eye className="h-6 w-6" />
                    )}
                    <span className="sr-only">
                      {isBalanceVisible ? 'Hide balance' : 'Show balance'}
                    </span>
                  </Button>
                </div>
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

      <Dialog open={isPinModalOpen} onOpenChange={setIsPinModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter PIN to View Balance</DialogTitle>
            <DialogDescription>
              For your security, please enter your 4-digit PIN to view your
              account balance.
            </DialogDescription>
          </DialogHeader>
          <Form {...pinForm}>
            <form
              onSubmit={pinForm.handleSubmit(handlePinSubmit)}
              className="space-y-4"
            >
              <FormField
                control={pinForm.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        maxLength={4}
                        placeholder="••••"
                        className="text-center text-2xl tracking-[1rem]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsPinModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Confirm
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
