import { NavLink } from "react-router-dom";
import { Tooltip, useMediaQuery } from "@mui/material";

interface IllustratedNavLinkProps {
  to: string;
  label: string;
  iconSrc: string;
  end?: boolean;
}

export function IllustratedNavLink({ to, label, iconSrc, end }: IllustratedNavLinkProps) {
  const showTooltip = !useMediaQuery("(min-width: 640px)");

  const link = (
    <NavLink
      to={to}
      end={end}
      aria-label={label}
      className={({ isActive }) =>
        [
          "group flex min-w-[2.75rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white/70 dark:focus-visible:ring-offset-stone-900/80",
          isActive
            ? "bg-amber-100/90 shadow-md shadow-amber-500/25 ring-1 ring-amber-300/60 dark:bg-amber-950/50 dark:shadow-amber-600/20 dark:ring-amber-600/40"
            : "hover:bg-white/70 hover:shadow-sm hover:shadow-amber-500/10 dark:hover:bg-stone-800/70",
        ].join(" ")
      }
    >
      {({ isActive }) => (
        <>
          <span
            className={[
              "illustrated-nav-icon relative flex h-8 w-8 items-center justify-center transition duration-200 sm:h-10 sm:w-10",
              "group-hover:scale-105 group-hover:drop-shadow-[0_4px_12px_rgba(251,146,60,0.35)]",
              isActive ? "scale-105 drop-shadow-[0_0_14px_rgba(251,146,60,0.55)]" : "",
            ].join(" ")}
          >
            <img
              src={iconSrc}
              alt=""
              aria-hidden="true"
              draggable={false}
              className="h-full w-full object-contain"
            />
          </span>
          <span
            className={[
              "hidden max-w-[4.5rem] truncate text-center text-[10px] font-medium leading-tight sm:block sm:max-w-none sm:text-xs",
              isActive
                ? "text-amber-800 dark:text-amber-200"
                : "text-stone-600 group-hover:text-stone-900 dark:text-stone-400 dark:group-hover:text-stone-200",
            ].join(" ")}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );

  if (!showTooltip) return link;

  return (
    <Tooltip title={label} placement="bottom" arrow enterTouchDelay={0}>
      <span className="inline-flex">{link}</span>
    </Tooltip>
  );
}
