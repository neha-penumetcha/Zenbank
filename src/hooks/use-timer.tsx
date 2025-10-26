
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface TimerContextType {
  remainingTime: number;
  setRemainingTime: (time: number) => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export function TimerProvider({ children }: { children: ReactNode }) {
  const [remainingTime, setRemainingTime] = useState(0);

  const value = {
    remainingTime,
    setRemainingTime,
  };

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}
