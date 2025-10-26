'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const useIdleTimeout = (
  onIdle: () => void,
  idleTime = 5 * 60 * 1000,
  warningTime = 60 * 1000
) => {
  const [isWarning, setIsWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(idleTime);

  const countdownInterval = useRef<NodeJS.Timer>();

  const stopTimers = useCallback(() => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  }, []);

  const startCountdown = useCallback(() => {
    stopTimers(); // Ensure no multiple intervals are running
    setRemainingTime(idleTime);

    countdownInterval.current = setInterval(() => {
      setRemainingTime((prevTime) => {
        const newTime = prevTime - 1000;
        
        if (newTime <= warningTime && !isWarning) {
            setIsWarning(true);
        }
        
        if (newTime <= 0) {
          clearInterval(countdownInterval.current);
          onIdle();
          return 0;
        }
        return newTime;
      });
    }, 1000);
  }, [idleTime, warningTime, onIdle, isWarning, stopTimers]);


  const reset = useCallback(() => {
    setIsWarning(false);
    startCountdown();
  }, [startCountdown]);

  const handleUserActivity = useCallback(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    reset();

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleUserActivity));

    return () => {
      stopTimers();
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const formattedRemainingTime = Math.ceil(remainingTime / 1000);

  return { isWarning, remainingTime: formattedRemainingTime, reset };
};

export default useIdleTimeout;
