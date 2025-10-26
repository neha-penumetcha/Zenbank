'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
  useCallback,
} from 'react';
import { useRouter } from 'next/navigation';
import type { User, SignupData } from '@/lib/types';
import { useToast } from './use-toast';

const AUTH_STORAGE_KEY = 'zenbank-users';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, pass: string) => Promise<boolean>;
  logout: () => void;
  signup: (data: SignupData) => Promise<boolean>;
  updateUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const getUsersFromStorage = useCallback((): User[] => {
    if (typeof window === 'undefined') return [];
    const usersJson = localStorage.getItem(AUTH_STORAGE_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }, []);

  const setUsersInStorage = useCallback((users: User[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(users));
  }, []);
  
  const getLoggedInUserFromStorage = useCallback((): User | null => {
    if (typeof window === 'undefined') return null;
    const loggedInUserJson = localStorage.getItem('zenbank-loggedin-user');
    return loggedInUserJson ? JSON.parse(loggedInUserJson) : null;
  }, []);

  const setLoggedInUserInStorage = useCallback((user: User | null) => {
    if (typeof window === 'undefined') return;
    if (user) {
      localStorage.setItem('zenbank-loggedin-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('zenbank-loggedin-user');
    }
  }, []);


  useEffect(() => {
    try {
      const loggedInUser = getLoggedInUserFromStorage();
      if (loggedInUser) {
        const allUsers = getUsersFromStorage();
        const currentUserData = allUsers.find(u => u.id === loggedInUser.id);
        if (currentUserData) {
          setUser(currentUserData);
          setLoggedInUserInStorage(currentUserData);
        } else {
          // Logged-in user not found in main list, likely corrupt data
          setLoggedInUserInStorage(null);
        }
      }
    } catch (error) {
      console.error('Failed to load user from storage', error);
      toast({
        variant: 'destructive',
        title: 'Session Error',
        description: 'Could not load your session. Please log in again.',
      });
      setLoggedInUserInStorage(null);
    } finally {
      setLoading(false);
    }
  }, [getUsersFromStorage, getLoggedInUserFromStorage, setLoggedInUserInStorage, toast]);
  

  const login = async (username: string, pass: string): Promise<boolean> => {
    const users = getUsersFromStorage();
    const foundUser = users.find(
      (u) => u.username.toLowerCase() === username.toLowerCase() && u.password === pass
    );

    if (foundUser) {
      setUser(foundUser);
      setLoggedInUserInStorage(foundUser);
      toast({
        title: 'Login Successful',
        description: `Welcome back, ${foundUser.username}!`,
      });
      router.push('/');
      return true;
    } else {
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: 'Invalid username or password.',
      });
      return false;
    }
  };

  const signup = async (data: SignupData): Promise<boolean> => {
    const users = getUsersFromStorage();
    const existingUser = users.find(
      (u) => u.username.toLowerCase() === data.username.toLowerCase()
    );

    if (existingUser) {
      toast({
        variant: 'destructive',
        title: 'Signup Failed',
        description: 'Username is already taken.',
      });
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      username: data.username,
      password: data.password,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      pin: data.pin,
      balance: 1000, // Starting balance
      transactions: [],
    };

    const updatedUsers = [...users, newUser];
    setUsersInStorage(updatedUsers);
    setUser(newUser);
    setLoggedInUserInStorage(newUser);

    toast({
      title: 'Account Created!',
      description: 'Welcome to ZenBank! Your account is ready.',
    });
    router.push('/');
    return true;
  };

  const logout = () => {
    setUser(null);
    setLoggedInUserInStorage(null);
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
    router.push('/login');
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    setLoggedInUserInStorage(updatedUser);
    const users = getUsersFromStorage();
    const userIndex = users.findIndex((u) => u.id === updatedUser.id);
    if (userIndex !== -1) {
      users[userIndex] = updatedUser;
      setUsersInStorage(users);
    }
  };

  const value = { user, loading, login, logout, signup, updateUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
