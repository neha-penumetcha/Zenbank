'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const useIdleTimeout = (onIdle: () => void, idleTime = 5 * 60 * 1000) => {
  const [isIdle, setIsIdle] = useState(false);
  const timeoutId = useRef<NodeJS.Timeout>();

  const handleIdle = useCallback(() => {
    setIsIdle(true);
    onIdle();
  }, [onIdle]);

  const resetTimer = useCallback(() => {
     if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    timeoutId.current = setTimeout(handleIdle, idleTime);
  }, [handleIdle, idleTime]);
  
  const handleUserActivity = useCallback(() => {
    setIsIdle(false);
    resetTimer();
  }, [resetTimer]);


  useEffect(() => {
    resetTimer();
    
    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];

    events.forEach(event => window.addEventListener(event, handleUserActivity));

    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
    };
  }, [handleUserActivity, resetTimer]);

  return isIdle;
};

export default useIdleTimeout;
