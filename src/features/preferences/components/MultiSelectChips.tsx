interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectChipsProps {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (next: string[]) => void;
  hint?: string;
}

/**
 * Toggle-chip multi-select for fixed option lists (categories, dietary tags, allergens).
 * Styling mirrors {@link CategoryFilterChips} so it feels consistent with the catalog filters.
 */
export function MultiSelectChips({
  label,
  options,
  selected,
  onChange,
  hint,
}: MultiSelectChipsProps) {
  function toggle(value: string) {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value));
    } else {
      onChange([...selected, value]);
    }
  }

  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="text-sm font-medium text-stone-700 dark:text-stone-200">{label}</legend>
      {hint && <p className="text-xs text-stone-500 dark:text-stone-400">{hint}</p>}
      <div className="mt-1 flex flex-wrap gap-2">
        {options.map((option) => {
          const active = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => toggle(option.value)}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${
                active
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-orange-500/20"
                  : "border border-stone-200 bg-white/70 text-stone-600 hover:border-amber-300 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-900/60 dark:text-stone-300"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
