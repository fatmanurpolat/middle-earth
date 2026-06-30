import type { CharacterId } from '@middleearth/shared';
import aragorn from './aragorn.jpg';
import boromir from './boromir.jpeg';
import frodo from './frodo.webp';
import gandalf from './gandalf.jpeg';
import gimli from './gimli.jpeg';
import gollum from './gollum.jpg';
import legolas from './legolas.jpg';
import sam from './sam.webp';
import saruman from './saruman.jpg';

/**
 * Portrait for each character, shown in the registration picker and as the
 * avatar fallback. Typed as Record<CharacterId, string> so a missing character
 * fails the build rather than rendering a broken image.
 */
export const CHARACTER_IMAGES: Record<CharacterId, string> = {
  gandalf,
  legolas,
  saruman,
  aragorn,
  gimli,
  sam,
  frodo,
  boromir,
  gollum,
};
