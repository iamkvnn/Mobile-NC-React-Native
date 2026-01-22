import { useState, useCallback } from 'react';

/**
 * API State Interface
 */
interface ApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

/**
 * useApi Hook Return Type
 */
interface UseApiReturn<T, P extends any[]> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
  execute: (...params: P) => Promise<T>;
  reset: () => void;
}

/**
 * useApi Hook
 * Generic hook for handling API calls with loading and error states
 * 
 * @example
 * const { data, error, isLoading, execute } = useApi(authService.login);
 * await execute({ email, password });
 */
export function useApi<T, P extends any[]>(
  apiFunc: (...params: P) => Promise<T>
): UseApiReturn<T, P> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...params: P): Promise<T> => {
      setState({ data: null, error: null, isLoading: true });

      try {
        const result = await apiFunc(...params);
        setState({ data: result, error: null, isLoading: false });
        return result;
      } catch (error: any) {
        const errorMessage = error.message || 'An error occurred';
        setState({ data: null, error: errorMessage, isLoading: false });
        throw error;
      }
    },
    [apiFunc]
  );

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    data: state.data,
    error: state.error,
    isLoading: state.isLoading,
    execute,
    reset,
  };
}

/**
 * useFetch Hook
 * Hook for fetching data on component mount
 * 
 * @example
 * const { data, error, isLoading, refetch } = useFetch(userService.getCurrentUser);
 */
interface UseFetchOptions {
  immediate?: boolean;
}

interface UseFetchReturn<T> extends Omit<UseApiReturn<T, []>, 'execute'> {
  refetch: () => Promise<T>;
}

export function useFetch<T>(
  apiFunc: () => Promise<T>,
  options: UseFetchOptions = { immediate: true }
): UseFetchReturn<T> {
  const { data, error, isLoading, execute, reset } = useApi(apiFunc);

  // Fetch data on mount if immediate is true
  useState(() => {
    if (options.immediate) {
      execute();
    }
  });

  return {
    data,
    error,
    isLoading,
    refetch: execute,
    reset,
  };
}
