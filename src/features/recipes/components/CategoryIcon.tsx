import { useState } from "react";

import { categoryIconSrc } from "@/features/recipes/lib/categoryIcons";
import { categoryVisual } from "@/features/recipes/lib/categoryVisuals";

type CategoryIconSize = "xs" | "sm" | "md" | "lg" | "xl";

const SIZE_CLASS: Record<CategoryIconSize, string> = {
  xs: "h-5 w-5",
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const EMOJI_SIZE: Record<CategoryIconSize, string> = {
  xs: "text-sm",
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl",
  xl: "text-4xl",
};

interface CategoryIconProps {
  category: string;
  size?: CategoryIconSize;
  /** Inline chip/filter icon */
  variant?: "inline" | "fill";
  className?: string;
}

export function CategoryIcon({
  category,
  size = "sm",
  variant = "inline",
  className = "",
}: CategoryIconProps) {
  const [failed, setFailed] = useState(false);
  const visual = categoryVisual(category);

  if (failed) {
    const emojiClass =
      variant === "fill"
        ? "flex h-full w-full items-center justify-center text-xl"
        : `inline-flex items-center justify-center leading-none ${SIZE_CLASS[size]} ${EMOJI_SIZE[size]}`;

    return (
      <span className={`${emojiClass} ${className}`.trim()} aria-hidden="true">
        {visual.emoji}
      </span>
    );
  }

  const imgClass =
    variant === "fill"
      ? "h-full w-full scale-[1.48] object-cover object-center"
      : `object-contain ${SIZE_CLASS[size]}`;

  return (
    <img
      src={categoryIconSrc(category)}
      alt=""
      aria-hidden="true"
      draggable={false}
      onError={() => setFailed(true)}
      className={`${imgClass} ${className}`.trim()}
    />
  );
}

type CategoryIconBadgeSize = "sm" | "md" | "lg" | "xl";

const BADGE_CLASS: Record<CategoryIconBadgeSize, string> = {
  sm: "h-16 w-16",
  md: "h-20 w-20",
  lg: "h-24 w-24",
  xl: "h-28 w-28",
};

interface CategoryIconBadgeProps {
  category: string;
  size?: CategoryIconBadgeSize;
  className?: string;
}

/** Illustrated category icon on a soft cream circle. */
export function CategoryIconBadge({ category, size = "lg", className = "" }: CategoryIconBadgeProps) {
  return (
    <div
      className={[
        "relative shrink-0 overflow-hidden rounded-full bg-[#f7f0e8]/95 shadow-md ring-2 ring-white/80",
        BADGE_CLASS[size],
        className,
      ].join(" ")}
    >
      <CategoryIcon category={category} variant="fill" className="h-full w-full" />
    </div>
  );
}

/** Compact circular frame for filter chips. */
export function CategoryIconChip({ category, className = "" }: { category: string; className?: string }) {
  return (
    <span
      className={[
        "relative inline-flex h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#f7f0e8]/95 ring-1 ring-black/5",
        className,
      ].join(" ")}
    >
      <CategoryIcon category={category} variant="fill" className="h-full w-full" />
    </span>
  );
}
