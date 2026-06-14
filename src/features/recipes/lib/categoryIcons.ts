/** Normalized category name → icon filename (without path). */
export const CATEGORY_ICON_SLUGS: Record<string, string> = {
  all: "all",
  asian: "asian",
  "bbq & grill": "bbq-grill",
  breakfast: "breakfast",
  dessert: "dessert",
  drink: "drink",
  "main course": "main-course",
  mexican: "mexican",
  pasta: "pasta",
  salad: "salad",
  seafood: "seafood",
  snack: "snack",
  soup: "soup",
  vegetarian: "vegetarian",
  vegan: "vegan",
  "gluten-free": "gluten-free",
  "gluten free": "gluten-free",
  "low carb": "low-carb",
  keto: "keto",
  "high protein": "high-protein",
  healthy: "healthy",
  "quick & easy": "quick-easy",
  "one pot": "one-pot",
  "slow cooker": "slow-cooker",
  "air fryer": "air-fryer",
  "kid friendly": "kid-friendly",
  "comfort food": "comfort-food",
  holiday: "holiday",
  "budget friendly": "budget-friendly",
  "meal prep": "meal-prep",
  "date night": "date-night",
  party: "party",
  summer: "summer",
  winter: "winter",
  spring: "spring",
  fall: "fall",
  indian: "indian",
  "middle eastern": "middle-eastern",
  french: "french",
  italian: "italian",
  american: "american",
  thai: "thai",
  chinese: "chinese",
  japanese: "japanese",
};

const ICON_BASE = "/images/categories";

export function categoryIconSrc(category: string): string {
  const key = category.trim().toLowerCase();
  const slug = CATEGORY_ICON_SLUGS[key] ?? "all";
  return `${ICON_BASE}/${slug}.png`;
}
