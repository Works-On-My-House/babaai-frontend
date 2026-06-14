import { FormEvent, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

import { ApiError } from "../../api/client";
import { BrandLogo } from "@/components/BrandLogo";
import { SettingsMenu } from "@/features/settings/components/SettingsMenu";
import { useApiMessage } from "@/lib/translation/useApiMessage";
import { useAuth } from "./AuthContext";

export function RegisterPage() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const translatedError = useApiMessage(error);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register(email, username, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t("auth.registerFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50/30 to-stone-100 px-4 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <Button
        component={RouterLink}
        to="/"
        startIcon={<ArrowBack />}
        color="inherit"
        size="small"
        sx={{ position: "absolute", left: 16, top: 16, color: "text.secondary" }}
      >
        {t("nav.browse")}
      </Button>
      <Box sx={{ position: "absolute", right: 16, top: 16 }}>
        <SettingsMenu />
      </Box>

      <Paper
        elevation={0}
        component="section"
        className="animate-slide-up"
        sx={{
          width: "100%",
          maxWidth: 440,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          backdropFilter: "blur(12px)",
          boxShadow: "0 10px 30px -12px rgba(0,0,0,0.25)",
        }}
      >
        <Stack spacing={1} sx={{ mb: 3, alignItems: "center" }}>
          <BrandLogo size="auth" />
          <Typography variant="h5" component="h1" sx={{ fontWeight: 700 }}>
            {t("auth.createAccount")}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t("auth.joinSubtitle")}
          </Typography>
        </Stack>

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            <TextField
              label={t("auth.email")}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              autoFocus
            />
            <TextField
              label={t("auth.username")}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              slotProps={{ htmlInput: { minLength: 3 } }}
            />
            <TextField
              label={t("auth.password")}
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
              slotProps={{
                htmlInput: { minLength: 8 },
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label={t("auth.togglePassword")}
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            {translatedError && <Alert severity="error">{translatedError}</Alert>}

            <Button type="submit" variant="contained" size="large" loading={submitting}>
              {submitting ? t("auth.registering") : t("auth.register")}
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: "center" }}>
          {t("auth.hasAccount")}{" "}
          <Link component={RouterLink} to="/login" underline="hover" sx={{ fontWeight: 600 }}>
            {t("auth.signIn")}
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
}
