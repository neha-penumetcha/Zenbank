'use client';

import { ReactNode, useEffect } from 'react';
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
import { useTimer } from '@/hooks/use-timer';

export function IdleTimeoutProvider({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { setRemainingTime: setGlobalRemainingTime } = useTimer();
  
  const handleIdle = () => {
    if (user) {
      logout();
    }
  };

  const IDLE_TIME = 5 * 60 * 1000;
  const WARNING_TIME = 60 * 1000;

  const { isWarning, remainingTime, reset } = useIdleTimeout(handleIdle, IDLE_TIME, WARNING_TIME);
  
  useEffect(() => {
    setGlobalRemainingTime(remainingTime);
  }, [remainingTime, setGlobalRemainingTime]);

  const handleStay = () => {
    reset();
  };

  return (
    <>
      {children}
      <Dialog open={isWarning && !!user}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you still there?</DialogTitle>
            <DialogDescription>
              You've been inactive for a while. For your security, you will be logged out in {Math.ceil(remainingTime / 1000)} seconds.
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
