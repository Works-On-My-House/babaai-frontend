export const SCENE_IMAGES = {
  pantry: "/images/pantry-scene.png",
  kitchen: "/images/kitchen-scene.png",
} as const;

export type SceneKey = keyof typeof SCENE_IMAGES;
