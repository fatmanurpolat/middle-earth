import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, LOCALE_LABELS, type AppLocale } from '@middleearth/i18n';

function isAppLocale(value: string): value is AppLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const current: AppLocale = isAppLocale(i18n.resolvedLanguage ?? '')
    ? (i18n.resolvedLanguage as AppLocale)
    : 'en';

  const change = (locale: AppLocale) => {
    void i18n.changeLanguage(locale);
  };

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-gold/25 bg-ink-800/70 p-1 backdrop-blur"
      role="group"
      aria-label={t('common.language')}
    >
      {SUPPORTED_LOCALES.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => change(locale)}
            aria-pressed={active}
            title={LOCALE_LABELS[locale]}
            className={[
              'rounded-full px-3 py-1 font-display text-xs tracking-widest transition-all duration-300',
              active
                ? 'bg-gold/20 text-gold-bright shadow-gold-glow'
                : 'text-mithril/70 hover:text-parchment',
            ].join(' ')}
          >
            {locale.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
