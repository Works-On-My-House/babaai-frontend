import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { AppLanguage } from "@/i18n";
import { translateTexts } from "./translateService";

export function useTranslatedList(items: string[]): string[] {
  const { i18n } = useTranslation();
  const language = i18n.language as AppLanguage;
  const [translated, setTranslated] = useState(items);

  useEffect(() => {
    if (language === "en") {
      setTranslated(items);
      return;
    }

    let cancelled = false;
    void translateTexts(items, language, "en").then((result) => {
      if (!cancelled) setTranslated(result);
    });

    return () => {
      cancelled = true;
    };
  }, [items, language]);

  return translated;
}
