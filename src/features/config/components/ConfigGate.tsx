import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { useAppConfig } from "@/features/config/hooks/useAppConfig";
import type { PublicConfig } from "@/features/config/services/configApi";

interface ConfigGateProps {
  children: (config: PublicConfig) => ReactNode;
}

export function ConfigGate({ children }: ConfigGateProps) {
  const { t } = useTranslation();
  const { config, loading, error } = useAppConfig();

  if (loading) {
    return (
      <p className="text-sm text-stone-600 dark:text-stone-400" role="status">
        {t("common.loading")}
      </p>
    );
  }

  if (error || !config) {
    return (
      <p className="text-sm text-red-600 dark:text-red-400" role="alert">
        {error ?? t("common.configLoadFailed")}
      </p>
    );
  }

  return <>{children(config)}</>;
}
