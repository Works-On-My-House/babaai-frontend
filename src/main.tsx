import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "next-themes";
import { BrowserRouter } from "react-router-dom";
import { StyledEngineProvider } from "@mui/material/styles";
import GlobalStyles from "@mui/material/GlobalStyles";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";

import App from "./App";
import "@/config/env";
import { AppConfigProvider } from "./features/config/hooks/useAppConfig";
import { AuthProvider } from "./features/auth/AuthContext";
import { MuiThemeBridge } from "./theme/MuiThemeBridge";
import { queryClient } from "./lib/queryClient";
import "./i18n";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StyledEngineProvider enableCssLayer>
      <GlobalStyles styles="@layer theme, base, mui, components, utilities;" />
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="smartchef-theme">
        <MuiThemeBridge>
          <BrowserRouter>
            <QueryClientProvider client={queryClient}>
              <AuthProvider>
                <AppConfigProvider>
                  <App />
                </AppConfigProvider>
                <Toaster
                position="top-right"
                toastOptions={{
                  classNames: {
                    toast:
                      "bg-white/95 backdrop-blur-md border border-stone-200 shadow-lg dark:bg-stone-900/95 dark:border-stone-700",
                  },
                }}
                richColors
                closeButton
              />
              </AuthProvider>
            </QueryClientProvider>
          </BrowserRouter>
        </MuiThemeBridge>
      </ThemeProvider>
    </StyledEngineProvider>
  </StrictMode>,
);
