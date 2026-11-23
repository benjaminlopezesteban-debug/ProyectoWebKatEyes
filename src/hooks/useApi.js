import { useCallback, useEffect, useState } from "react";

export function useApi(solicitud) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [version, setVersion] = useState(0);

  const refetch = useCallback(() => setVersion((valor) => valor + 1), []);

  useEffect(() => {
    let activo = true;

    setLoading(true);
    setError(null);

    Promise.resolve()
      .then(() => solicitud())
      .then((resultado) => {
        if (activo) {
          setData(resultado);
          setLoading(false);
        }
      })
      .catch((fallo) => {
        if (activo) {
          setError(fallo);
          setLoading(false);
        }
      });

    return () => {
      activo = false;
    };
  }, [solicitud, version]);

  return { data, loading, error, refetch };
}
