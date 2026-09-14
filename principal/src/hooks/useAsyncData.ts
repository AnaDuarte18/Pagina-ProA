/**
 * Hook genérico para cargar datos de forma asíncrona.
 * Maneja los estados loading / data / error y cancela el fetch
 * si el componente se desmonta antes de que termine.
 */
import { useState, useEffect, useRef } from "react";

export interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: Error | null;
}

export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  initialData: T,
): AsyncState<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  // Ref estable para que el useEffect no se re-ejecute por cambios de referencia
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetcherRef.current()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error(String(err)));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}
