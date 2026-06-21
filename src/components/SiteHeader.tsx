import { Link, NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tune, UploadFileOutlined } from "@mui/icons-material";
import { Tooltip } from "@mui/material";

import { Button } from "@/components/ui/Button";
import { BrandLogoLink } from "@/components/BrandLogoLink";
import { IllustratedNavLink } from "@/components/IllustratedNavLink";
import { NAV_ILLUSTRATIONS } from "@/components/navAssets";
import { useAuth } from "@/features/auth/AuthContext";
import { SettingsMenu } from "@/features/settings/components/SettingsMenu";

export function SiteHeader() {
  const { t } = useTranslation();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/", { replace: true });
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/70 backdrop-blur-lg dark:border-stone-800 dark:bg-stone-900/80">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2.5 sm:px-6 sm:py-3">
        <BrandLogoLink className="mr-1" />

        <nav
          className="order-3 flex w-full items-end justify-center gap-1 overflow-x-auto sm:order-2 sm:w-auto sm:gap-2"
          aria-label={t("nav.main")}
        >
          <IllustratedNavLink
            to="/"
            end
            label={t("nav.recipes")}
            iconSrc={NAV_ILLUSTRATIONS.recipes}
          />
          {token && (
            <>
              <IllustratedNavLink
                to="/ingredients"
                label={t("nav.pantry")}
                iconSrc={NAV_ILLUSTRATIONS.pantry}
              />
              <IllustratedNavLink
                to="/recipes"
                label={t("nav.aiChef")}
                iconSrc={NAV_ILLUSTRATIONS.aiChef}
              />
              <IllustratedNavLink
                to="/dashboard"
                label={t("nav.dashboard")}
                iconSrc={NAV_ILLUSTRATIONS.dashboard}
              />
            </>
          )}
        </nav>

        <div className="order-2 flex items-center gap-2 sm:order-3">
          {token && (
            <Tooltip title={t("nav.submitRecipe")}>
              <NavLink
                to="/submit-recipe"
                aria-label={t("nav.submitRecipe")}
                className={({ isActive }) =>
                  [
                    "inline-flex items-center justify-center rounded-lg p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                    isActive
                      ? "bg-amber-100/90 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                      : "text-stone-600 hover:bg-white/60 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100",
                  ].join(" ")
                }
              >
                <UploadFileOutlined fontSize="small" />
              </NavLink>
            </Tooltip>
          )}
          {token && (
            <Tooltip title={t("nav.preferences")}>
              <NavLink
                to="/preferences"
                aria-label={t("nav.preferences")}
                className={({ isActive }) =>
                  [
                    "inline-flex items-center justify-center rounded-lg p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                    isActive
                      ? "bg-amber-100/90 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200"
                      : "text-stone-600 hover:bg-white/60 hover:text-stone-900 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-stone-100",
                  ].join(" ")
                }
              >
                <Tune fontSize="small" />
              </NavLink>
            </Tooltip>
          )}
          <SettingsMenu />
          {token ? (
            <>
              <span className="hidden text-sm text-stone-600 dark:text-stone-400 md:inline">
                {user?.username}
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                {t("nav.signOut")}
              </Button>
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
            </>
          )}
        </div>
      </div>
    </header>
  );
}
