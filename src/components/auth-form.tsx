'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/hooks/use-auth';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/icons';
import { Loader2 } from 'lucide-react';

const loginSchema = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

const signupSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().min(10, { message: 'Phone number must be at least 10 digits.' }),
  address: z.string().min(5, { message: 'Address must be at least 5 characters.' }),
  pin: z.string().length(4, { message: 'PIN must be exactly 4 digits.' }).regex(/^\d{4}$/, 'PIN must be a 4-digit number.'),
  username: z.string().min(3, { message: 'Username must be at least 3 characters.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type AuthFormProps = {
  mode: 'login' | 'signup';
};

export function AuthForm({ mode }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, signup } = useAuth();
  
  const formSchema = mode === 'login' ? loginSchema : signupSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: mode === 'login' ? {
      username: '',
      password: '',
    } : {
      name: '',
      email: '',
      phone: '',
      address: '',
      pin: '',
      username: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    let success = false;
    if (mode === 'login') {
      const { username, password } = values as z.infer<typeof loginSchema>;
      success = await login(username, password);
    } else {
      success = await signup(values as z.infer<typeof signupSchema>);
    }
    
    if (success) {
      router.push('/');
    }
    setIsLoading(false);
  };

  const title = mode === 'login' ? 'Welcome Back' : 'Create an Account';
  const description =
    mode === 'login' ? 'Sign in to access your ZenBank account.' : 'Enter your details to get started.';
  const buttonText = mode === 'login' ? 'Login' : 'Sign Up';
  const switchLinkHref = mode === 'login' ? '/signup' : '/login';
  const switchLinkText = mode === 'login' ? "Don't have an account? Sign Up" : 'Already have an account? Login';

  return (
    <Card className="w-full max-w-md my-8">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex items-center justify-center">
            <Logo className="h-12 w-12 text-primary" />
        </div>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {mode === 'signup' && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="123-456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St, Anytown USA" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="pin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>4-Digit PIN</FormLabel>
                      <FormControl>
                        <Input type="password" maxLength={4} placeholder="••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="your_username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {buttonText}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button variant="link" asChild>
          <Link href={switchLinkHref}>{switchLinkText}</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
