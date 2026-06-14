import { createTheme, type Theme } from "@mui/material/styles";

export type ThemeMode = "light" | "dark";

/**
 * BabaAI MUI theme. Keeps the warm amber/orange brand used across the
 * Tailwind-styled parts of the app so MUI components feel native, not generic.
 */
export function buildTheme(mode: ThemeMode): Theme {
  const isDark = mode === "dark";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#ea580c", // orange-600
        light: "#f59e0b", // amber-500
        dark: "#c2410c", // orange-700
        contrastText: "#ffffff",
      },
      secondary: {
        main: "#e11d48", // rose-600
        light: "#fb7185",
        dark: "#be123c",
        contrastText: "#ffffff",
      },
      background: isDark
        ? { default: "#0c0a09", paper: "#1c1917" } // stone-950 / stone-900
        : { default: "#fafaf9", paper: "#ffffff" }, // stone-50 / white
      text: isDark
        ? { primary: "#f5f5f4", secondary: "#a8a29e" } // stone-100 / stone-400
        : { primary: "#1c1917", secondary: "#78716c" }, // stone-900 / stone-500
    },
    shape: {
      borderRadius: 12,
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      button: {
        textTransform: "none",
        fontWeight: 600,
      },
    },
    components: {
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: { borderRadius: 12, paddingTop: 10, paddingBottom: 10 },
        },
        variants: [
          {
            props: { variant: "contained", color: "primary" },
            style: {
              backgroundImage: "linear-gradient(to right, #d97706, #ea580c)",
              "&:hover": {
                backgroundImage: "linear-gradient(to right, #f59e0b, #f97316)",
              },
            },
          },
        ],
      },
      MuiTextField: {
        defaultProps: { variant: "outlined", fullWidth: true },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: "none" },
        },
      },
    },
  });
}
