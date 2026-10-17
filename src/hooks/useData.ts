import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchMunicipios,
  fetchEmpreendimentos,
  fetchNoticias,
  fetchLegislacao,
  mensagemErro,
} from "../lib/queries";
import type { Municipio } from "../data/types";

export function useLoad<T>(loader: () => Promise<T>, key = "") {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let active = true;
    setData(null);
    setLoading(true);
    setError(null);
    loader()
      .then((value) => {
        if (active) setData(value);
      })
      .catch((e) => {
        if (active) {
          setError(mensagemErro(e));
          window.dispatchEvent(
            new CustomEvent("data-error", { detail: mensagemErro(e) }),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
    // The key explicitly identifies parameters; loader closures need not be memoized.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, version]);
  return { data, loading, error, refresh };
}
export function useMunicipios() {
  const state = useLoad(fetchMunicipios);
  const municipios = state.data ?? [];
  const byCode = useMemo(
    () =>
      Object.fromEntries(municipios.map((m) => [m.codigo, m])) as Record<
        string,
        Municipio
      >,
    [municipios],
  );
  const totais = municipios.reduce(
    (a, m) => ({
      empreendimentos: a.empreendimentos + m.indicadores.empreendimentos,
      familias: 0,
      producaoTon: 0,
      faturamentoMil: 0,
      areaManejadaHa: 0,
    }),
    {
      empreendimentos: 0,
      familias: 0,
      producaoTon: 0,
      faturamentoMil: 0,
      areaManejadaHa: 0,
    },
  );
  return {
    municipios,
    byCode,
    totais,
    loading: state.loading,
    error: state.error,
  };
}
export function useEmpreendimentos() {
  return useLoad(fetchEmpreendimentos).data ?? [];
}
export function useNoticias() {
  return useLoad(fetchNoticias).data ?? [];
}
export function useLegislacao() {
  return useLoad(fetchLegislacao).data ?? [];
}
