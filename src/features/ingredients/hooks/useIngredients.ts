import { useCallback, useEffect, useState } from "react";

import { ingredientApi } from "@/features/ingredients/services/ingredientApi";
import type { IngredientListParams, PaginatedIngredients } from "@/features/ingredients/types/ingredient";

export function useIngredients(params: IngredientListParams) {
  const [data, setData] = useState<PaginatedIngredients | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIngredients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await ingredientApi.list(params);
      setData(result);
    } catch (err) {
      setData(null);
      setError(err instanceof Error ? err.message : "Failed to load ingredients");
    } finally {
      setLoading(false);
    }
  }, [
    params.page,
    params.page_size,
    params.search,
    params.category,
    params.sort_by,
    params.sort_order,
  ]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await ingredientApi.list(params);
        if (!cancelled) setData(result);
      } catch (err) {
        if (!cancelled) {
          setData(null);
          setError(err instanceof Error ? err.message : "Failed to load ingredients");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [
    params.page,
    params.page_size,
    params.search,
    params.category,
    params.sort_by,
    params.sort_order,
  ]);

  return { data, loading, error, refetch: fetchIngredients };
}
