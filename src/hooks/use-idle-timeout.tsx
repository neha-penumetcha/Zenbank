'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

const useIdleTimeout = (
  onIdle: () => void,
  idleTime = 5 * 60 * 1000,
  warningTime = 60 * 1000
) => {
  const [isWarning, setIsWarning] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  const idleTimer = useRef<NodeJS.Timeout>();
  const warningTimer = useRef<NodeJS.Timeout>();
  const countdownInterval = useRef<NodeJS.Timer>();

  const handleLogout = useCallback(() => {
    onIdle();
  }, [onIdle]);

  const stopTimers = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  }, []);

  const startCountdown = useCallback(() => {
    setIsWarning(true);
    setRemainingTime(warningTime / 1000);
    countdownInterval.current = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(countdownInterval.current);
          handleLogout();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }, [warningTime, handleLogout]);

  const resetTimers = useCallback(() => {
    stopTimers();
    setIsWarning(false);
    setRemainingTime(0);
    warningTimer.current = setTimeout(startCountdown, idleTime - warningTime);
  }, [stopTimers, startCountdown, idleTime, warningTime]);

  const handleUserActivity = useCallback(() => {
    resetTimers();
  }, [resetTimers]);

  useEffect(() => {
    resetTimers();

    const events = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleUserActivity));

    return () => {
      stopTimers();
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
    };
  }, [resetTimers, stopTimers, handleUserActivity]);

  return { isWarning, remainingTime };
};

export default useIdleTimeout;
