'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const useIdleTimeout = (
  onIdle: () => void,
  idleTime = 5 * 60 * 1000,
  warningTime = 60 * 1000
) => {
  const [isWarning, setIsWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(idleTime);

  const idleTimeout = useRef<NodeJS.Timeout>();
  const warningTimeout = useRef<NodeJS.Timeout>();
  const countdownInterval = useRef<NodeJS.Timer>();

  const stopTimers = useCallback(() => {
    if (idleTimeout.current) clearTimeout(idleTimeout.current);
    if (warningTimeout.current) clearTimeout(warningTimeout.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  }, []);

  const handleIdle = useCallback(() => {
    stopTimers();
    onIdle();
  }, [onIdle, stopTimers]);

  const startTimers = useCallback(() => {
    stopTimers();
    setRemainingTime(idleTime);

    warningTimeout.current = setTimeout(() => {
      setIsWarning(true);
    }, idleTime - warningTime);

    idleTimeout.current = setTimeout(handleIdle, idleTime);

    countdownInterval.current = setInterval(() => {
      setRemainingTime((prevTime) => {
        const newTime = prevTime - 1000;
        if (newTime <= 0) {
          clearInterval(countdownInterval.current);
          return 0;
        }
        return newTime;
      });
    }, 1000);
  }, [idleTime, warningTime, stopTimers, handleIdle]);

  const reset = useCallback(() => {
    setIsWarning(false);
    startTimers();
  }, [startTimers]);

  const handleUserActivity = useCallback(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    reset();

    const events = ['mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleUserActivity));

    return () => {
      stopTimers();
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isWarning, remainingTime: Math.max(0, Math.ceil(remainingTime / 1000)), reset };
};

export default useIdleTimeout;
