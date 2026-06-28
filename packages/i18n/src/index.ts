import en from './locales/en.json' with { type: 'json' };
import tr from './locales/tr.json' with { type: 'json' };
import pt from './locales/pt.json' with { type: 'json' };

export const SUPPORTED_LOCALES = ['en', 'tr', 'pt'] as const;

export type AppLocale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = 'en';

export const LOCALE_LABELS: Record<AppLocale, string> = {
  en: 'English',
  tr: 'Türkçe',
  pt: 'Português',
};

export const resources = {
  en: { translation: en },
  tr: { translation: tr },
  pt: { translation: pt },
} as const;

export { en, tr, pt };
