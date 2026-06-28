import { useTranslation } from 'react-i18next';
import { DASHBOARD_URL } from '../lib/env';
import RuneDivider from './RuneDivider';

export default function CallToAction() {
  const { t } = useTranslation();

  return (
    <section className="relative mx-auto max-w-3xl px-6 py-24 text-center">
      <div className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-b from-ink-800/80 to-ink/70 p-10 shadow-gold-glow backdrop-blur sm:p-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-gold/15 blur-3xl"
        />
        <h2 className="font-display text-3xl font-semibold text-gradient-gold text-glow-gold sm:text-4xl">
          {t('landing.cta.title')}
        </h2>
        <RuneDivider className="my-6" />
        <p className="mx-auto max-w-xl font-serif text-lg leading-relaxed text-mithril/85">
          {t('landing.cta.body')}
        </p>
        <a
          href={DASHBOARD_URL}
          className="group mt-9 inline-flex items-center gap-3 rounded-full border border-gold/50 bg-gradient-to-b from-gold/25 to-transparent px-9 py-3.5 font-display text-sm uppercase tracking-[0.3em] text-gold-bright shadow-gold-glow transition-all duration-300 hover:from-gold/35 hover:shadow-gold-glow-strong"
        >
          <span>{t('landing.cta.button')}</span>
          <span
            aria-hidden="true"
            className="transition-transform duration-300 group-hover:translate-x-1"
          >
            &rarr;
          </span>
        </a>
      </div>
    </section>
  );
}
