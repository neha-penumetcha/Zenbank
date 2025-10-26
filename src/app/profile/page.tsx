'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, User, Mail, Phone, Home, ArrowLeft, KeyRound, Edit, Save } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { Logo } from '@/components/icons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

const changePinSchema = z
  .object({
    currentPin: z
      .string()
      .length(4, 'Current PIN must be 4 digits.')
      .regex(/^\d{4}$/, 'PIN must be a 4-digit number.'),
    newPin: z
      .string()
      .length(4, 'New PIN must be 4 digits.')
      .regex(/^\d{4}$/, 'PIN must be a 4-digit number.'),
    confirmPin: z
      .string()
      .length(4, 'Confirm PIN must be 4 digits.')
      .regex(/^\d{4}$/, 'PIN must be a 4-digit number.'),
  })
  .refine((data) => data.newPin === data.confirmPin, {
    message: "New PINs don't match.",
    path: ['confirmPin'],
  });

const profileSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
});

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const pinForm = useForm<z.infer<typeof changePinSchema>>({
    resolver: zodResolver(changePinSchema),
    defaultValues: {
      currentPin: '',
      newPin: '',
      confirmPin: '',
    },
  });

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    }
  });
  
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
      });
    }
  }, [user, profileForm]);


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
  
  const handleChangePin = async (values: z.infer<typeof changePinSchema>) => {
    setIsUpdating(true);
    if (values.currentPin !== user.pin) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Your current PIN is incorrect.',
      });
      setIsUpdating(false);
      return;
    }
    if (values.newPin === user.pin) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'New PIN cannot be the same as the old one.',
      });
      setIsUpdating(false);
      return;
    }

    updateUser({ ...user, pin: values.newPin });
    toast({
      title: 'Success',
      description: 'Your PIN has been updated successfully.',
    });
    setIsPinModalOpen(false);
    pinForm.reset();
    setIsUpdating(false);
  };

  const handleProfileUpdate = (values: z.infer<typeof profileSchema>) => {
    setIsUpdating(true);
    updateUser({
      ...user,
      ...values,
    });
    toast({
      title: 'Success',
      description: 'Your profile has been updated.',
    });
    setIsEditMode(false);
    setIsUpdating(false);
  }


  return (
    <>
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
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20 border-2 border-primary">
                      <AvatarImage
                        src={`https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`}
                        alt={user.name}
                      />
                      <AvatarFallback>
                        {user.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="w-full">
                      {isEditMode ? (
                        <FormField
                          control={profileForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Full Name</FormLabel>
                              <FormControl>
                                <Input className="text-3xl font-bold" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <>
                          <CardTitle className="text-3xl font-bold">
                            {user.name}
                          </CardTitle>
                          <CardDescription className="text-lg">
                            @{user.username}
                          </CardDescription>
                        </>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="mt-4 space-y-6">
                  <div className="flex items-center gap-4">
                    <Mail className="h-6 w-6 text-muted-foreground" />
                    <div className="flex-1">
                      {isEditMode ? (
                        <FormField
                          control={profileForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input type="email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <>
                          <p className="text-sm font-medium text-muted-foreground">Email</p>
                          <p className="font-semibold">{user.email}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="h-6 w-6 text-muted-foreground" />
                    <div className="flex-1">
                      {isEditMode ? (
                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <>
                           <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                           <p className="font-semibold">{user.phone}</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Home className="h-6 w-6 text-muted-foreground" />
                    <div className="flex-1">
                      {isEditMode ? (
                         <FormField
                          control={profileForm.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <>
                          <p className="text-sm font-medium text-muted-foreground">Address</p>
                          <p className="font-semibold">{user.address}</p>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  {isEditMode ? (
                    <div className="flex gap-2">
                       <Button type="submit" disabled={isUpdating}>
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                      </Button>
                      <Button variant="outline" onClick={() => setIsEditMode(false)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setIsEditMode(true)} variant="outline">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Button>
                  )}
                  <Button onClick={() => setIsPinModalOpen(true)} variant="outline">
                    <KeyRound className="mr-2 h-4 w-4" />
                    Change PIN
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </main>
      </div>
      <Dialog open={isPinModalOpen} onOpenChange={setIsPinModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Your PIN</DialogTitle>
            <DialogDescription>
              Enter your current PIN and a new 4-digit PIN.
            </DialogDescription>
          </DialogHeader>
          <Form {...pinForm}>
            <form
              onSubmit={pinForm.handleSubmit(handleChangePin)}
              className="space-y-4"
            >
              <FormField
                control={pinForm.control}
                name="currentPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current PIN</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        maxLength={4}
                        placeholder="••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={pinForm.control}
                name="newPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New PIN</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        maxLength={4}
                        placeholder="••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={pinForm.control}
                name="confirmPin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New PIN</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        maxLength={4}
                        placeholder="••••"
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
                  onClick={() => {
                    setIsPinModalOpen(false);
                    pinForm.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update PIN
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
