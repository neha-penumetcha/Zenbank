'use client';

import { ReactNode } from 'react';
import { useAuth } from '@/hooks/use-auth';
import useIdleTimeout from '@/hooks/use-idle-timeout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export function IdleTimeoutProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  
  const handleIdle = () => {
    if (user) {
      logout();
    }
  };

  const isIdle = useIdleTimeout(handleIdle, 5 * 60 * 1000);

  return (
    <>
      {children}
      <Dialog open={isIdle && !!user}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Session Expired</DialogTitle>
            <DialogDescription>
              You have been logged out due to inactivity. Please log in again to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => window.location.reload()}>Log In</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
