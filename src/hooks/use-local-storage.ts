// @/hooks/use-local-storage.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

// A custom hook to manage state with localStorage persistence.
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void, boolean] {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Initialize state from localStorage or with the initial value.
  // This function is designed to run only on the client-side.
  const [storedValue, setStoredValue] = useState<T>(() => {
    // Check if running on the client
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // This effect runs once on the client to confirm data is loaded.
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // A wrapper for setStoredValue that also persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue, isLoaded];
}
