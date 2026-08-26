import { useState, useEffect } from "react";

export const useCountdown = (expiresAt) => {
  const [, forceTick] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => forceTick((n) => n + 1), 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  const secondsLeft = expiresAt
    ? Math.max(0, Math.floor((new Date(expiresAt) - new Date()) / 1000))
    : 0;

  return {
    secondsLeft,
    minutes: Math.floor(secondsLeft / 60),
    seconds: secondsLeft % 60,
    isExpired: !!expiresAt && secondsLeft <= 0,
  };
};
