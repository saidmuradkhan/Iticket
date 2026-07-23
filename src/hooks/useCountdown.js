import { useState, useEffect } from "react";

// expiresAt (ISO tarix) üçün qalan vaxtı saniyəbəsaniyə hesablayır.
// secondsLeft hər render-də expiresAt-dan birbaşa hesablanır ki, ilk render-də
// (əvvəlki state hələ 0 olarkən) yalançı "vaxt bitdi" görünməsin - effekt yalnız saniyədə bir dəfə yenidən render etdirir.
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
