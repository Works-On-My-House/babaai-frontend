import { useId, useState } from "react";
import { useTranslation } from "react-i18next";

interface TagInputProps {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  hint?: string;
}

function splitTags(raw: string): string[] {
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

/**
 * Free-text chip/tag input. Mirrors the home page's guest ingredient explorer styling so the
 * taste-profile screen feels native to the app. Adds on Enter / comma, removes via the chip's ×.
 */
export function TagInput({ label, values, onChange, placeholder, hint }: TagInputProps) {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const inputId = useId();

  function addTags(raw: string) {
    const additions = splitTags(raw);
    if (additions.length === 0) return;
    const next = [...values];
    additions.forEach((value) => {
      if (!next.some((item) => item.toLowerCase() === value.toLowerCase())) {
        next.push(value);
      }
    });
    onChange(next);
    setInput("");
  }

  function removeTag(value: string) {
    onChange(values.filter((item) => item !== value));
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-medium text-stone-700 dark:text-stone-200">
        {label}
      </label>
      <input
        id={inputId}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            addTags(input);
          }
        }}
        onBlur={() => addTags(input)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-stone-200 bg-white/90 px-3 py-2 text-sm text-stone-900 shadow-sm transition focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/30 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-100"
      />

      {values.length > 0 ? (
        <ul className="mt-1.5 flex flex-wrap gap-2">
          {values.map((item) => (
            <li
              key={item}
              className="inline-flex animate-fade-in items-center gap-1.5 rounded-full bg-amber-100/90 py-1 pl-3 pr-1.5 text-sm font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200"
            >
              {item}
              <button
                type="button"
                onClick={() => removeTag(item)}
                className="flex h-5 w-5 items-center justify-center rounded-full text-amber-700 transition hover:bg-amber-200/80 dark:text-amber-300 dark:hover:bg-amber-800/60"
                aria-label={t("preferences.removeTag", { tag: item })}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        hint && <p className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{hint}</p>
      )}
    </div>
  );
}
