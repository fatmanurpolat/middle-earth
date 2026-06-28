import { useTranslation } from 'react-i18next';

type EventKey =
  | 'awakening'
  | 'rings'
  | 'lastAlliance'
  | 'gollum'
  | 'bilbo'
  | 'warOfRing';

const EVENT_KEYS: readonly EventKey[] = [
  'awakening',
  'rings',
  'lastAlliance',
  'gollum',
  'bilbo',
  'warOfRing',
];

/**
 * A vertical chronicle of pivotal events across the Ages, drawn from the
 * landing.timeline i18n tree.
 */
export default function Timeline() {
  const { t } = useTranslation();

  return (
    <section id="timeline" className="relative mx-auto max-w-4xl px-6 py-20">
      <div className="text-center">
        <h2 className="font-display text-3xl font-semibold text-gradient-gold sm:text-4xl">
          {t('landing.timeline.title')}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-mithril/80">
          {t('landing.timeline.intro')}
        </p>
      </div>

      <ol className="relative mx-auto mt-14 max-w-2xl">
        {/* The vertical thread of the chronicle */}
        <span
          aria-hidden="true"
          className="absolute bottom-2 left-[7px] top-2 w-px bg-gradient-to-b from-gold/60 via-gold/30 to-transparent sm:left-[9px]"
        />

        {EVENT_KEYS.map((key) => (
          <li key={key} className="relative pl-10 pb-10 last:pb-0 sm:pl-12">
            {/* Node */}
            <span
              aria-hidden="true"
              className="absolute left-0 top-1.5 flex h-4 w-4 items-center justify-center rounded-full border border-gold/70 bg-ink shadow-gold-glow sm:h-5 sm:w-5"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold-bright" />
            </span>

            <p className="font-display text-xs uppercase tracking-[0.3em] text-gold/70">
              {t(`landing.timeline.${key}.era`)}
            </p>
            <h3 className="mt-1.5 font-display text-xl font-semibold text-parchment">
              {t(`landing.timeline.${key}.title`)}
            </h3>
            <p className="mt-2 font-serif text-base leading-relaxed text-mithril/80">
              {t(`landing.timeline.${key}.body`)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}
