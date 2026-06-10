import { useState, useRef, useCallback } from "react";
import { authFetch } from "../services/api";

export function useBranchesData(projectId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [lastFetched, setLastFetched] = useState(null);
  const lastFetchedRef = useRef(null);

  const fetchData = useCallback(async (force = false) => {
    if (!projectId) return;

    // Throttle: no refetch si fue hace menos de 60s
    if (!force && lastFetchedRef.current && Date.now() - lastFetchedRef.current < 60_000) {
      return;
    }

    setLoading(true);
    setError(false);

    const attempt = async () => {
      const result = await authFetch(`/projects/${projectId}/branches`);
      if (result.error === "no_github_repo") {
        console.warn("[useBranchesData] El proyecto no tiene githubRepo configurado");
      }
      return result;
    };

    try {
      const result = await attempt();
      setData(result);
      lastFetchedRef.current = Date.now();
      setLastFetched(new Date());
    } catch {
      // Reintento único a los 3 segundos
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const result = await attempt();
        setData(result);
        lastFetchedRef.current = Date.now();
        setLastFetched(new Date());
      } catch {
        setError(true);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const load = useCallback(() => fetchData(false), [fetchData]);
  const refetch = useCallback(() => fetchData(true), [fetchData]);

  return { data, loading, error, lastFetched, load, refetch };
}
