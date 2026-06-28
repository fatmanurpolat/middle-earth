import { useTranslation } from 'react-i18next';
import { GALLERY_IMAGES } from '../assets/artifact';
import FramedArt from './FramedArt';
import RuneDivider from './RuneDivider';

/**
 * The illustrated chronicle: lore artwork shown in elven frames. Files live in
 * apps/landing/public/artifacts/; missing ones render a graceful fallback.
 */
export default function Gallery() {
  const { t } = useTranslation();

  return (
    <section id="gallery" className="relative mx-auto max-w-6xl px-6 py-20">
      <div className="text-center">
        <h2 className="font-display text-3xl font-semibold text-gradient-gold sm:text-4xl">
          {t('landing.gallery.title')}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-mithril/80">
          {t('landing.gallery.subtitle')}
        </p>
      </div>

      <RuneDivider className="my-12" />

      <div className="flex flex-col items-center gap-16">
        {GALLERY_IMAGES.map((image) => (
          <FramedArt
            key={image.id}
            src={image.src}
            portrait={image.portrait ?? false}
            title={t(`landing.gallery.${image.id}.title`)}
            caption={t(`landing.gallery.${image.id}.caption`)}
          />
        ))}
      </div>
    </section>
  );
}
