import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export function HeaderSearch() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      navigate("/");
      return;
    }
    navigate(`/?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={handleSubmit} className="hidden items-center md:flex">
      <label className="sr-only" htmlFor="header-search">
        {t("home.searchPlaceholder")}
      </label>
      <div className="flex items-center gap-1 rounded-xl border border-stone-200/80 bg-white/80 px-2 py-1 dark:border-stone-700 dark:bg-stone-800/80">
        <svg className="h-4 w-4 text-stone-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
        </svg>
        <input
          id="header-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("home.headerSearchPlaceholder")}
          className="w-36 bg-transparent text-sm text-stone-800 placeholder:text-stone-400 focus:w-48 focus:outline-none dark:text-stone-100 lg:w-44 lg:focus:w-56"
        />
      </div>
    </form>
  );
}
