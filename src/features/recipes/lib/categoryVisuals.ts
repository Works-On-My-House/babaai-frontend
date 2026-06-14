export interface CategoryVisual {
  emoji: string;
  gradient: string;
}

const KNOWN_VISUALS: Record<string, CategoryVisual> = {
  pasta: { emoji: "🍝", gradient: "from-amber-400 to-orange-500" },
  asian: { emoji: "🥢", gradient: "from-rose-400 to-red-500" },
  salad: { emoji: "🥗", gradient: "from-lime-400 to-green-500" },
  breakfast: { emoji: "🍳", gradient: "from-yellow-400 to-amber-500" },
  "main course": { emoji: "🍲", gradient: "from-orange-400 to-red-500" },
  soup: { emoji: "🥣", gradient: "from-amber-400 to-yellow-500" },
  snack: { emoji: "🧀", gradient: "from-amber-300 to-orange-400" },
  dessert: { emoji: "🍰", gradient: "from-pink-400 to-rose-500" },
  drink: { emoji: "🥤", gradient: "from-sky-400 to-cyan-500" },
  seafood: { emoji: "🦐", gradient: "from-cyan-400 to-blue-500" },
  mexican: { emoji: "🌮", gradient: "from-lime-400 to-yellow-500" },
  "bbq & grill": { emoji: "🔥", gradient: "from-orange-500 to-red-600" },
  vegan: { emoji: "🥬", gradient: "from-green-400 to-emerald-500" },
};

const FALLBACK_GRADIENTS = [
  "from-amber-400 to-orange-500",
  "from-rose-400 to-red-500",
  "from-violet-400 to-purple-500",
  "from-emerald-400 to-teal-500",
  "from-sky-400 to-indigo-500",
  "from-fuchsia-400 to-pink-500",
];

export function categoryVisual(category: string): CategoryVisual {
  const key = category.trim().toLowerCase();
  const known = KNOWN_VISUALS[key];
  if (known) return known;

  let hash = 0;
  for (let i = 0; i < key.length; i += 1) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return {
    emoji: "🍽️",
    gradient: FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length],
  };
}
