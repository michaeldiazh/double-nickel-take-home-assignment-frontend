import { useState, useCallback } from 'react';

interface UseErrorReturn {
  error: string | null;
  setError: (msg: string | null) => void;
  clearError: () => void;
}

export function useError(): UseErrorReturn {
  const [error, setErrorState] = useState<string | null>(null);

  const setError = useCallback((msg: string | null) => {
    setErrorState(msg);
  }, []);

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  return { error, setError, clearError };
}
