import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import type { AppLanguage } from "@/i18n";
import { translateText } from "./translateService";

export function useTranslateText(text: string | null | undefined): {
  text: string;
  isTranslating: boolean;
} {
  const { i18n } = useTranslation();
  const language = i18n.language as AppLanguage;
  const source = text ?? "";
  const [translated, setTranslated] = useState(source);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!source) {
      setTranslated("");
      setIsTranslating(false);
      return;
    }

    if (language === "en") {
      setTranslated(source);
      setIsTranslating(false);
      return;
    }

    let cancelled = false;
    setIsTranslating(true);
    setTranslated(source);

    void translateText(source, language, "en").then((result) => {
      if (!cancelled) {
        setTranslated(result);
        setIsTranslating(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [source, language]);

  return { text: translated, isTranslating };
}
