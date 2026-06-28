import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GavelOutlined, UploadFileOutlined } from "@mui/icons-material";
import { Avatar, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";

import { useAuth } from "@/features/auth/AuthContext";
import { Can } from "@/features/auth/Can";
import { PERMISSIONS } from "@/features/auth/permissions";

export function UserMenu() {
  const { t } = useTranslation();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  if (!token || !user) return null;

  const initial = (user.username?.[0] ?? "?").toUpperCase();

  function handleLogout() {
    setAnchorEl(null);
    logout();
    navigate("/", { replace: true });
  }

  return (
    <>
      <Tooltip title={user.username}>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small" sx={{ p: 0.25 }}>
          <Avatar sx={{ width: 32, height: 32, bgcolor: "warning.main", fontSize: 14 }}>
            {initial}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem disabled sx={{ opacity: 1, fontWeight: 600 }}>
          {user.username}
        </MenuItem>
        <MenuItem component={Link} to="/dashboard" onClick={() => setAnchorEl(null)}>
          {t("nav.dashboard")}
        </MenuItem>
        <MenuItem component={Link} to="/preferences" onClick={() => setAnchorEl(null)}>
          {t("nav.preferences")}
        </MenuItem>
        <MenuItem component={Link} to="/submit-recipe" onClick={() => setAnchorEl(null)}>
          <UploadFileOutlined fontSize="small" sx={{ mr: 1 }} />
          {t("nav.submitRecipe")}
        </MenuItem>
        <Can permission={PERMISSIONS.RECIPE_MODERATE}>
          <MenuItem component={Link} to="/admin/moderation" onClick={() => setAnchorEl(null)}>
            <GavelOutlined fontSize="small" sx={{ mr: 1 }} />
            {t("nav.moderation")}
          </MenuItem>
        </Can>
        <MenuItem onClick={handleLogout}>{t("nav.signOut")}</MenuItem>
      </Menu>
    </>
  );
}
