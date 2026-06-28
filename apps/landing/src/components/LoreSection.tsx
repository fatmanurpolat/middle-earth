import { useTranslation } from 'react-i18next';
import RuneDivider from './RuneDivider';

export default function LoreSection() {
  const { t } = useTranslation();

  return (
    <section id="lore" className="relative mx-auto max-w-3xl px-6 py-20 text-center">
      <h2 className="font-display text-3xl font-semibold text-gradient-gold sm:text-4xl">
        {t('landing.lore.title')}
      </h2>
      <RuneDivider className="my-8" />
      <p className="font-serif text-lg leading-relaxed text-mithril/85 sm:text-xl">
        {t('landing.lore.body')}
      </p>
    </section>
  );
}
