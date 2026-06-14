import type { AppLanguage } from "@/i18n";

const cache = new Map<string, string>();
const pending = new Map<string, Promise<string>>();

function cacheKey(text: string, target: AppLanguage): string {
  return `${target}:${text}`;
}

function getTranslateUrl(): string | null {
  const url = import.meta.env.VITE_LIBRETRANSLATE_URL;
  if (!url || typeof url !== "string" || !url.trim()) return null;
  return url.replace(/\/$/, "");
}

export function isAutoTranslationEnabled(): boolean {
  return getTranslateUrl() != null;
}

export async function translateText(
  text: string,
  target: AppLanguage,
  source: AppLanguage = "en",
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed || target === source) return text;

  const key = cacheKey(trimmed, target);
  const cached = cache.get(key);
  if (cached) return cached;

  const inFlight = pending.get(key);
  if (inFlight) return inFlight;

  const baseUrl = getTranslateUrl();
  if (!baseUrl) return text;

  const request = fetch(`${baseUrl}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: trimmed,
      source,
      target,
      format: "text",
    }),
  })
    .then(async (response) => {
      if (!response.ok) throw new Error("Translation failed");
      const data = (await response.json()) as { translatedText?: string };
      const translated = data.translatedText?.trim() || trimmed;
      cache.set(key, translated);
      return translated;
    })
    .catch(() => trimmed)
    .finally(() => {
      pending.delete(key);
    });

  pending.set(key, request);
  return request;
}

export async function translateTexts(
  texts: string[],
  target: AppLanguage,
  source: AppLanguage = "en",
): Promise<string[]> {
  return Promise.all(texts.map((text) => translateText(text, target, source)));
}

export function clearTranslationCache(): void {
  cache.clear();
  pending.clear();
}
