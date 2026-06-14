export interface IngredientCategoryVisual {
  emoji: string;
  gradient: string;
}

const KNOWN_VISUALS: Record<string, IngredientCategoryVisual> = {
  vegetables: { emoji: "🥬", gradient: "from-lime-400 to-green-600" },
  fruits: { emoji: "🍎", gradient: "from-rose-400 to-red-500" },
  dairy: { emoji: "🥛", gradient: "from-sky-300 to-blue-500" },
  "meat & fish": { emoji: "🥩", gradient: "from-red-400 to-rose-600" },
  "grains & pasta": { emoji: "🌾", gradient: "from-amber-400 to-yellow-600" },
  "spices & herbs": { emoji: "🌿", gradient: "from-emerald-400 to-teal-600" },
  beverages: { emoji: "🥤", gradient: "from-cyan-400 to-sky-500" },
  "canned & jarred": { emoji: "🥫", gradient: "from-orange-400 to-amber-600" },
  frozen: { emoji: "🧊", gradient: "from-blue-300 to-indigo-500" },
  other: { emoji: "🧺", gradient: "from-stone-400 to-stone-600" },
};

const FALLBACK_GRADIENTS = [
  "from-amber-400 to-orange-500",
  "from-lime-400 to-green-500",
  "from-sky-400 to-cyan-500",
  "from-violet-400 to-purple-500",
];

export function ingredientCategoryVisual(category: string): IngredientCategoryVisual {
  const key = category.trim().toLowerCase();
  const known = KNOWN_VISUALS[key];
  if (known) return known;

  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return {
    emoji: "🧺",
    gradient: FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length],
  };
}
