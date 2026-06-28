import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { BrandLogoLink } from "@/components/BrandLogoLink";
import { HeaderSearch } from "@/components/HeaderSearch";
import { ThemeToggle } from "@/components/ThemeToggle";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/features/auth/AuthContext";
import { SettingsMenu } from "@/features/settings/components/SettingsMenu";

const NAV_LINK_CLASS = (isActive: boolean) =>
  [
    "rounded-lg px-2.5 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
    isActive
      ? "bg-amber-100/90 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
      : "text-stone-600 hover:bg-white/60 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100",
  ].join(" ");

interface NavItem {
  to: string;
  labelKey: string;
  end?: boolean;
}

const PRIMARY_NAV: NavItem[] = [
  { to: "/", labelKey: "nav.home", end: true },
  { to: "/recipes", labelKey: "nav.recipes" },
  { to: "/ingredients", labelKey: "nav.pantry" },
  { to: "/meal-plan", labelKey: "nav.planner" },
  { to: "/shopping-list", labelKey: "nav.shopping" },
  { to: "/favorites", labelKey: "nav.favorites" },
];

export function SiteHeader() {
  const { t } = useTranslation();
  const { token } = useAuth();
  const location = useLocation();

  function isNavActive(item: NavItem): boolean {
    if (item.end) return location.pathname === "/";
    return location.pathname.startsWith(item.to);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-lg dark:border-stone-800 dark:bg-stone-900/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 sm:py-3">
        <BrandLogoLink className="mr-1 shrink-0" />

        <nav
          className="order-3 flex w-full items-center justify-center gap-0.5 overflow-x-auto sm:order-2 sm:w-auto sm:gap-0"
          aria-label={t("nav.main")}
        >
          {PRIMARY_NAV.map((item, index) => {
            const active = isNavActive(item);
            return (
              <span key={item.to} className="flex items-center">
                {index > 0 && (
                  <span className="hidden px-1 text-stone-300 dark:text-stone-600 sm:inline" aria-hidden>
                    ·
                  </span>
                )}
                <Link to={item.to} className={NAV_LINK_CLASS(active)}>
                  {t(item.labelKey)}
                </Link>
              </span>
            );
          })}
        </nav>

        <div className="order-2 flex items-center gap-1 sm:order-3">
          <HeaderSearch />
          <ThemeToggle />
          {token ? (
            <>
              <UserMenu />
              <SettingsMenu />
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-white/60 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100"
              >
                {t("nav.signIn")}
              </Link>
              <Link to="/register">
                <Button size="sm">{t("nav.register")}</Button>
              </Link>
              <SettingsMenu />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
