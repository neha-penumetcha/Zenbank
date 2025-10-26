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

  const { isWarning, remainingTime } = useIdleTimeout(handleIdle, 5 * 60 * 1000);

  const handleStay = () => {
    // This will trigger the activity handler in the hook and reset timers
    window.dispatchEvent(new Event('mousemove'));
  };

  return (
    <>
      {children}
      <Dialog open={isWarning && !!user}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you still there?</DialogTitle>
            <DialogDescription>
              You've been inactive for a while. For your security, you will be logged out in {remainingTime} seconds.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between">
            <Button variant="outline" onClick={logout}>Log Out Now</Button>
            <Button onClick={handleStay}>I'm still here</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
