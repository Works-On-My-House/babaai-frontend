import { useMemo, type ReactNode } from "react";
import { useTheme as useNextTheme } from "next-themes";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";

import { buildTheme, type ThemeMode } from "./muiTheme";

/**
 * Bridges next-themes (which owns the light/dark/system toggle and the `.dark`
 * class on <html>) to MUI's ThemeProvider, so MUI components react to the same
 * theme switch as the rest of the Tailwind-styled app.
 */
export function MuiThemeBridge({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useNextTheme();
  const mode: ThemeMode = resolvedTheme === "dark" ? "dark" : "light";
  const theme = useMemo(() => buildTheme(mode), [mode]);

  return <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>;
}
