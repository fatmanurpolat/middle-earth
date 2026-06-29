import { useTranslation } from 'react-i18next';
import RuneDivider from './RuneDivider';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative mx-auto max-w-5xl px-6 pb-12 pt-6 text-center">
      <RuneDivider className="mb-8" />
      <p className="font-display text-lg tracking-[0.2em] text-gradient-gold">
        {t('common.appName')}
      </p>
      <p className="mt-3 font-serif text-sm italic text-mithril/60">
        {t('common.tagline')}
      </p>
      <p className="mt-6 text-xs text-mithril/40">{t('landing.footer.text')}</p>
      <p className="mx-auto mt-4 max-w-2xl border-t border-mithril/10 pt-4 text-[0.7rem] leading-relaxed text-mithril/35">
        {t('landing.footer.disclaimer')}
      </p>
    </footer>
  );
}
