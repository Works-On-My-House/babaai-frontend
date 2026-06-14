export const BRAND_LOGO = "/images/babaai-logo.png";
export const BRAND_MARK = "/images/babaai-mark.png";
export const BRAND_HEADER = "/images/babaai-header.png";

type BrandLogoSize = "header" | "auth";

interface BrandLogoProps {
  size?: BrandLogoSize;
  className?: string;
}

/** Horizontal header lockup from brand guide: mark + BabaAI wordmark. */
function HeaderBrandLogo({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 ${className}`.trim()}>
      <img
        src={BRAND_MARK}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="h-14 w-14 shrink-0 object-contain sm:h-16 sm:w-16"
      />
      <span className="font-brand text-[1.75rem] font-bold leading-none tracking-tight sm:text-[2rem]">
        <span className="text-[#452e1f] dark:text-amber-100">Baba</span>
        <span className="text-orange-600 dark:text-orange-400">AI</span>
      </span>
    </div>
  );
}

export function BrandLogo({ size = "header", className = "" }: BrandLogoProps) {
  if (size === "header") {
    return <HeaderBrandLogo className={className} />;
  }

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`.trim()}>
      <img
        src={BRAND_MARK}
        alt=""
        aria-hidden="true"
        draggable={false}
        className="h-24 w-24 object-contain sm:h-28 sm:w-28"
      />
      <span className="font-brand text-4xl font-bold leading-none tracking-tight sm:text-5xl">
        <span className="text-[#452e1f] dark:text-amber-100">Baba</span>
        <span className="text-orange-600 dark:text-orange-400">AI</span>
      </span>
    </div>
  );
}
