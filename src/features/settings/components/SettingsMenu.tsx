import { useEffect, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "next-themes";
import {
  Box,
  IconButton,
  Popover,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  DarkMode,
  LightMode,
  SettingsBrightness,
  Settings as SettingsIcon,
} from "@mui/icons-material";

import type { AppLanguage } from "@/i18n";
import { clearTranslationCache } from "@/lib/translation/translateService";

export function SettingsMenu() {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const open = Boolean(anchorEl);

  function changeLanguage(_event: MouseEvent<HTMLElement>, language: AppLanguage | null) {
    if (!language) return;
    void i18n.changeLanguage(language);
    clearTranslationCache();
  }

  function changeTheme(_event: MouseEvent<HTMLElement>, next: string | null) {
    if (next) setTheme(next);
  }

  return (
    <>
      <Tooltip title={t("settings.title")}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          aria-label={t("settings.title")}
          color="inherit"
          sx={{ color: "text.secondary" }}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{ paper: { sx: { p: 2.5, width: 256, borderRadius: 3, mt: 1 } } }}
      >
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ fontWeight: 700, letterSpacing: 1 }}
        >
          {t("settings.title")}
        </Typography>

        <Stack spacing={2.5} sx={{ mt: 1.5 }}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {t("settings.theme")}
            </Typography>
            <ToggleButtonGroup
              value={mounted ? (theme ?? "system") : "system"}
              exclusive
              onChange={changeTheme}
              size="small"
              fullWidth
              sx={{ mt: 0.75 }}
            >
              <ToggleButton value="light">
                <LightMode fontSize="small" sx={{ mr: 0.5 }} />
                {t("settings.themeLight")}
              </ToggleButton>
              <ToggleButton value="dark">
                <DarkMode fontSize="small" sx={{ mr: 0.5 }} />
                {t("settings.themeDark")}
              </ToggleButton>
              <ToggleButton value="system">
                <SettingsBrightness fontSize="small" sx={{ mr: 0.5 }} />
                {t("settings.themeSystem")}
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
              {t("settings.language")}
            </Typography>
            <ToggleButtonGroup
              value={i18n.language?.startsWith("bg") ? "bg" : "en"}
              exclusive
              onChange={changeLanguage}
              size="small"
              fullWidth
              sx={{ mt: 0.75 }}
            >
              <ToggleButton value="en">{t("settings.langEn")}</ToggleButton>
              <ToggleButton value="bg">{t("settings.langBg")}</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
      </Popover>
    </>
  );
}
