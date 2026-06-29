// Canonical source of the hero artwork on the user's machine. The integrator
// copies this file into apps/landing/public/artifacts/middle-earth-haven.png.
export const DESKTOP_ARTIFACT_PATH =
  '/Users/fatmanurpolat/Desktop/Screenshot 2026-06-27 at 00.41.01.png';

// Served copy used in the browser (resolved from apps/landing/public).
export const ARTIFACT_SRC = '/artifacts/middle-earth-haven.png';

/**
 * Gallery artwork. Drop the matching files into apps/landing/public/artifacts/
 * with these exact names; the gallery renders a graceful elven-frame fallback
 * for any image that is missing. `id` maps to landing.gallery.<id> i18n keys.
 */
export type GalleryImageId =
  | 'rivendell'
  | 'ring'
  | 'autumn'
  | 'eagle'
  | 'ringGrass'
  | 'treebeard'
  | 'eagleRescue'
  | 'shire'
  | 'rivendellSketch'
  | 'rivendellColour'
  | 'moriaGate'
  | 'saruman'
  | 'lothlorien'
  | 'shelob';

export interface GalleryImage {
  id: GalleryImageId;
  src: string;
  /** Portrait artwork is shown narrower; wide art spans the full plate. */
  portrait?: boolean;
}

export const GALLERY_IMAGES: readonly GalleryImage[] = [
  { id: 'rivendell', src: '/artifacts/rivendell-valley.png' },
  { id: 'ring', src: '/artifacts/the-one-ring-forging.png', portrait: true },
  { id: 'autumn', src: '/artifacts/rivendell-autumn.png' },
  { id: 'eagle', src: '/artifacts/great-eagle-orthanc.png' },
  { id: 'ringGrass', src: '/artifacts/the-one-ring-grass.png' },
  { id: 'treebeard', src: '/artifacts/treebeard.jpg' },
  { id: 'eagleRescue', src: '/artifacts/gandalf-eagle.jpg' },
  { id: 'shire', src: '/artifacts/the-shire-vista.jpg' },
  { id: 'rivendellSketch', src: '/artifacts/rivendell-sketch.jpg' },
  { id: 'rivendellColour', src: '/artifacts/rivendell-balcony.jpg' },
  { id: 'moriaGate', src: '/artifacts/west-gate-moria.jpg' },
  { id: 'saruman', src: '/artifacts/saruman-isengard.jpg' },
  { id: 'lothlorien', src: '/artifacts/lothlorien.jpg' },
  { id: 'shelob', src: '/artifacts/shelob.jpg' },
];
