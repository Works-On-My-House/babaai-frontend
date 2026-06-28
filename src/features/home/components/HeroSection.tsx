import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { PantryHealthCard } from "@/features/home/components/PantryHealthCard";
import { greetingKey, getTimeMood } from "@/features/home/lib/timeMood";
import type { PantryStats } from "@/features/home/lib/pantryStats";

interface HeroSectionProps {
  userName?: string;
  recipeCount: number;
  pantryPeakItems: string[];
  search: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onBrowseRecipes: () => void;
  showPantryHealth: boolean;
  pantryStats: PantryStats | null;
  isAuthenticated: boolean;
}

export function HeroSection({
  userName,
  recipeCount,
  pantryPeakItems,
  search,
  onSearchChange,
  onSearch,
  onBrowseRecipes,
  showPantryHealth,
  pantryStats,
  isAuthenticated,
}: HeroSectionProps) {
  const { t, i18n } = useTranslation();
  const { dayName, mood } = getTimeMood(new Date(), i18n.language);
  const greeting = greetingKey(new Date().getHours());

  const showGreeting = isAuthenticated && !!userName;
  const countLabel = t("home.recipesReady", { count: recipeCount });

  return (
    <section className="relative mt-6 overflow-hidden rounded-3xl border border-amber-200/50 bg-gradient-to-br from-amber-50 via-orange-50/70 to-rose-50/60 px-6 py-10 shadow-xl shadow-amber-900/5 backdrop-blur-sm dark:border-stone-700/60 dark:from-stone-900 dark:via-stone-900 dark:to-stone-950 dark:shadow-black/40 sm:px-10 sm:py-14">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-500/10" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-orange-400/10 blur-3xl dark:bg-orange-500/5" />

      <div className="relative grid gap-8 lg:grid-cols-[1fr_300px] lg:items-center">
        <div className="animate-slide-up">
          <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700/90 dark:text-amber-400/90">
            {t("home.heroEyebrow", { day: dayName, mood: t(`home.moods.${mood}`) })}
          </span>

          <h1 className="mt-4 font-display text-4xl font-semibold leading-[1.1] tracking-tight text-stone-900 dark:text-stone-50 sm:text-5xl">
            {showGreeting ? (
              <>
                {t(`home.greetingLead.${greeting}`, { name: userName })}{" "}
                <span className="italic text-amber-600 dark:text-amber-400">{countLabel}</span>{" "}
                {t("home.greetingTail")}
              </>
            ) : (
              t("home.heroTitle")
            )}
          </h1>

          <p className="mt-4 max-w-xl text-base text-stone-600 dark:text-stone-300 sm:text-lg">
            {isAuthenticated && pantryPeakItems.length > 0
              ? t("home.pantrySubline", { items: pantryPeakItems.join(", ") })
              : t("home.heroSubtitle")}
          </p>

          <div className="mt-6 flex max-w-lg items-center gap-2 rounded-2xl border border-stone-200/80 bg-white/95 p-1.5 shadow-lg shadow-stone-900/5 backdrop-blur dark:border-stone-700 dark:bg-stone-800/90">
            <span className="pl-3 text-stone-400" aria-hidden>
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"
                />
              </svg>
            </span>
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onSearch();
              }}
              placeholder={t("home.searchPlaceholder")}
              className="w-full bg-transparent px-2 py-2 text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none dark:text-stone-100"
            />
            <Button size="md" variant="primary" onClick={onSearch}>
              {t("common.search")}
            </Button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <Button size="lg" variant="primary" onClick={onBrowseRecipes}>
              {t("home.browseRecipes")}
            </Button>
            {!isAuthenticated && (
              <Link to="/register">
                <Button size="lg" variant="secondary">
                  {t("home.unlockAi")}
                </Button>
              </Link>
            )}
          </div>
        </div>

        {showPantryHealth && (
          <div className="animate-slide-up lg:max-w-xs">
            <PantryHealthCard stats={pantryStats} />
          </div>
        )}
      </div>
    </section>
  );
}
