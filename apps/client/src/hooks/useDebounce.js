import { useState, useEffect } from 'react';

/**
 * useDebounce
 * @param {any} value - debounce edilecek değer
 * @param {number} delay - gecikme süresi ms cinsinden
 * @returns debounced değer
 */
const useDebounce = (value, delay = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce; 