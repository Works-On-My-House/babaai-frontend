/** User taste profile (ClickUp 869dr0a4d). JSON is snake_case, mirroring the backend contract. */
export interface Preferences {
  preferred_ingredients: string[];
  disliked_ingredients: string[];
  preferred_categories: string[];
  dietary_tags: string[];
  allergens: string[];
}

/** Fixed option lists for the multi-selects (the backend validates against these too). */
export const DIETARY_TAGS = [
  "vegetarian",
  "vegan",
  "pescatarian",
  "gluten_free",
  "dairy_free",
] as const;

export const ALLERGENS = [
  "dairy",
  "gluten",
  "nuts",
  "peanuts",
  "shellfish",
  "fish",
  "eggs",
  "soy",
] as const;

export type DietaryTag = (typeof DIETARY_TAGS)[number];
export type Allergen = (typeof ALLERGENS)[number];

export const EMPTY_PREFERENCES: Preferences = {
  preferred_ingredients: [],
  disliked_ingredients: [],
  preferred_categories: [],
  dietary_tags: [],
  allergens: [],
};
