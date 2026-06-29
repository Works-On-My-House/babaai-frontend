export const SCENE_IMAGES = {
  pantry: "/images/pantry-scene.png",
  kitchen: "/images/kitchen-scene.png",
  // Cozy "grandma's kitchen" backdrop for the taste-profile / preferences page.
  taste: "/images/taste-profile-scene.png",
  // Warm farmhouse-kitchen backdrop for the recipes catalog.
  recipe: "/images/recipe-background.png",
} as const;

export type SceneKey = keyof typeof SCENE_IMAGES;
