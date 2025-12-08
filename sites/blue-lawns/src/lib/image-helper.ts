import type { ImageMetadata } from 'astro';

const allImages = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/**/*.{jpeg,jpg,png,tiff,webp,gif,svg}', {
  eager: true,
});

export function resolveImage(imagePath: string): ImageMetadata | undefined {
  // Normalize path if needed.
  // The JSON has paths like "src/assets/images/services/landscape-maintenance/hero.jpg"
  // import.meta.glob keys are absolute or relative to project root.
  // If the glob pattern starts with /src, the keys will start with /src.
  
  let key = imagePath;
  if (!key.startsWith('/')) {
    key = '/' + key;
  }

  const imageModule = allImages[key];
  
  if (!imageModule) {
    console.warn(`Image not found: ${imagePath}`);
    return undefined;
  }

  return imageModule.default;
}

export function getAllImages() {
  return allImages;
}

