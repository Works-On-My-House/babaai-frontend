import { Link } from "react-router-dom";

import { BrandLogo } from "@/components/BrandLogo";

interface BrandLogoLinkProps {
  to?: string;
  size?: "header" | "auth";
  className?: string;
}

export function BrandLogoLink({ to = "/", size = "header", className = "" }: BrandLogoLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex shrink-0 items-center ${className}`.trim()}
      aria-label="BabaAI home"
    >
      <BrandLogo size={size} />
    </Link>
  );
}
