import type { ImageMetadata } from 'astro';

const allImages = import.meta.glob<{ default: ImageMetadata }>('/src/assets/images/**/*.{jpeg,jpg,png,tiff,webp,gif,svg}', {
  eager: true,
});

export function resolveImage(imagePath: string): ImageMetadata | undefined {
  if (!imagePath) return undefined;

  // Normalize path to ensure it starts with /src if it's a project relative path
  let key = imagePath;
  if (!key.startsWith('/') && key.startsWith('src/')) {
    key = '/' + key;
  } else if (!key.startsWith('/')) {
    // If it's just "images/..." assume it's in src/assets/
    // key = '/src/assets/' + key;
    // BUT services.json has full src/ paths, so let's stick to that.
  }

  const imageModule = allImages[key];
  
  if (!imageModule) {
    console.warn(`[ImageHelper] Image not found: ${imagePath} (Checked key: ${key})`);
    // Debug: Log available keys similar to the missing one
    // const similar = Object.keys(allImages).filter(k => k.includes(imagePath.split('/').pop() || ''));
    // if (similar.length > 0) console.warn(`Did you mean one of these?`, similar);
    return undefined;
  }

  return imageModule.default;
}

export function getAllImages() {
  return allImages;
}

