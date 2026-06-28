import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, LOCALE_LABELS, type AppLocale } from '@middleearth/i18n';

function isAppLocale(value: string): value is AppLocale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();
  const current: AppLocale = isAppLocale(i18n.resolvedLanguage ?? '')
    ? (i18n.resolvedLanguage as AppLocale)
    : isAppLocale(i18n.language)
      ? (i18n.language as AppLocale)
      : 'en';

  return (
    <div
      className="flex items-center gap-1 rounded-full border border-mithril/15 bg-ink-night/70 px-1 py-1 backdrop-blur-sm"
      role="group"
      aria-label={t('common.language')}
    >
      {SUPPORTED_LOCALES.map((locale) => {
        const active = locale === current;
        return (
          <button
            key={locale}
            type="button"
            onClick={() => void i18n.changeLanguage(locale)}
            aria-pressed={active}
            title={LOCALE_LABELS[locale]}
            className={[
              'focus-ring rounded-full px-3 py-1 text-xs font-display uppercase tracking-[0.18em] transition-colors',
              active
                ? 'bg-gold/90 text-ink shadow-[0_0_14px_rgba(201,162,39,0.45)]'
                : 'text-mithril/70 hover:text-parchment hover:bg-mithril/10',
            ].join(' ')}
          >
            {locale}
          </button>
        );
      })}
    </div>
  );
}
