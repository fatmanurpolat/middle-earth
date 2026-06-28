import { useTranslation } from 'react-i18next';
import { DASHBOARD_URL } from '../lib/env';
import RuneDivider from './RuneDivider';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative mx-auto flex max-w-5xl flex-col items-center px-6 pb-10 pt-20 text-center sm:pt-28">
      <p className="animate-fade-up font-display text-xs uppercase tracking-[0.55em] text-gold/80 sm:text-sm">
        {t('landing.hero.eyebrow')}
      </p>

      <h1 className="mt-6 animate-fade-up font-display text-4xl font-bold leading-tight text-gradient-gold text-glow-gold sm:text-6xl lg:text-7xl">
        {t('landing.hero.title')}
      </h1>

      <p className="mx-auto mt-6 max-w-2xl animate-fade-up text-lg leading-relaxed text-mithril/85 sm:text-xl">
        {t('landing.hero.subtitle')}
      </p>

      <div className="mt-10 animate-fade-up">
        <a
          href={DASHBOARD_URL}
          className="group relative inline-flex items-center gap-3 rounded-full border border-gold/50 bg-gradient-to-b from-gold/20 to-transparent px-8 py-3.5 font-display text-sm uppercase tracking-[0.3em] text-gold-bright shadow-gold-glow transition-all duration-300 hover:from-gold/30 hover:shadow-gold-glow-strong"
        >
          <span className="absolute inset-0 overflow-hidden rounded-full">
            <span className="absolute inset-0 animate-shimmer shimmer-gold opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          </span>
          <span className="relative">{t('landing.hero.cta')}</span>
          <span aria-hidden="true" className="relative transition-transform duration-300 group-hover:translate-x-1">
            &rarr;
          </span>
        </a>
      </div>

      <RuneDivider className="mt-16" />
    </section>
  );
}
