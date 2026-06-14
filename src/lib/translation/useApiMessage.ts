import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { AppLanguage } from "@/i18n";
import { translateText } from "./translateService";

export function useApiMessage(message: string | null | undefined): string | null {
  const { i18n } = useTranslation();
  const language = i18n.language as AppLanguage;
  const [translated, setTranslated] = useState(message ?? null);

  useEffect(() => {
    if (!message) {
      setTranslated(null);
      return;
    }

    if (language === "en") {
      setTranslated(message);
      return;
    }

    let cancelled = false;
    void translateText(message, language, "en").then((result) => {
      if (!cancelled) setTranslated(result);
    });

    return () => {
      cancelled = true;
    };
  }, [message, language]);

  return translated;
}
