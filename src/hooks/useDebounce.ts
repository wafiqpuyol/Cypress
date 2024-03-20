import { useEffect, useState } from "react";

const useDebounce = (value: string, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(timer);
  }, [debouncedValue, delay, value]);
  return debouncedValue;
};

export default useDebounce;
