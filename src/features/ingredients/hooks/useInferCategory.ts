import { useEffect, useState } from "react";

import { configApi } from "@/features/config/services/configApi";

const DEBOUNCE_MS = 300;

export function useInferCategory(name: string, enabled = true) {
  const [category, setCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const trimmed = name.trim();
    if (!enabled || trimmed.length < 2) {
      setCategory(null);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      configApi
        .inferCategory(trimmed)
        .then((result) => {
          if (!cancelled) setCategory(result.category);
        })
        .catch(() => {
          if (!cancelled) setCategory(null);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [name, enabled]);

  return { category, loading };
}
