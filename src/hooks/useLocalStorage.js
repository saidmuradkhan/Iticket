import { useState, useEffect } from "react";

export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") return initialValue;

    const saved = window.localStorage.getItem(key);
    if (saved === null) return initialValue;
    try {
      return JSON.parse(saved);
    } catch {
      return saved;
    }
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue];
};
