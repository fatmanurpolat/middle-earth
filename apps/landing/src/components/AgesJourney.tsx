import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import RuneDivider from './RuneDivider';

type AgeKey = 'firstAge' | 'secondAge' | 'thirdAge' | 'fourthAge';

const AGE_KEYS: readonly AgeKey[] = [
  'firstAge',
  'secondAge',
  'thirdAge',
  'fourthAge',
];

const ROMAN: Record<AgeKey, string> = {
  firstAge: 'I',
  secondAge: 'II',
  thirdAge: 'III',
  fourthAge: 'IV',
};

export default function AgesJourney() {
  const { t } = useTranslation();
  const [active, setActive] = useState<AgeKey>('firstAge');
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const baseId = useId();

  const focusTab = (index: number) => {
    const clamped = (index + AGE_KEYS.length) % AGE_KEYS.length;
    const next = AGE_KEYS[clamped];
    if (!next) return;
    setActive(next);
    tabRefs.current[clamped]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        focusTab(index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        focusTab(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusTab(0);
        break;
      case 'End':
        event.preventDefault();
        focusTab(AGE_KEYS.length - 1);
        break;
      default:
        break;
    }
  };

  const activeIndex = AGE_KEYS.indexOf(active);

  return (
    <section id="ages" className="relative mx-auto max-w-5xl px-6 py-20">
      <div className="text-center">
        <h2 className="font-display text-3xl font-semibold text-gradient-gold sm:text-4xl">
          {t('landing.ages.title')}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-mithril/80">
          {t('landing.ages.intro')}
        </p>
      </div>

      <RuneDivider className="my-10" />

      {/* Tab list */}
      <div
        role="tablist"
        aria-label={t('landing.ages.title')}
        aria-orientation="horizontal"
        className="mx-auto flex max-w-2xl flex-wrap justify-center gap-3"
      >
        {AGE_KEYS.map((key, index) => {
          const selected = key === active;
          return (
            <button
              key={key}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              role="tab"
              id={`${baseId}-tab-${key}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${key}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(key)}
              onKeyDown={(event) => onKeyDown(event, index)}
              className={[
                'flex items-center gap-2 rounded-full border px-5 py-2.5 font-display text-xs uppercase tracking-[0.25em] transition-all duration-300 sm:text-sm',
                selected
                  ? 'border-gold/60 bg-gold/15 text-gold-bright shadow-gold-glow'
                  : 'border-gold/20 bg-ink-800/50 text-mithril/70 hover:border-gold/40 hover:text-parchment',
              ].join(' ')}
            >
              <span className="font-display text-base font-bold text-gold/80">
                {ROMAN[key]}
              </span>
              <span>{t(`landing.ages.${key}.title`)}</span>
            </button>
          );
        })}
      </div>

      {/* Panels */}
      <div className="relative mt-10">
        {AGE_KEYS.map((key) => {
          const selected = key === active;
          return (
            <div
              key={key}
              role="tabpanel"
              id={`${baseId}-panel-${key}`}
              aria-labelledby={`${baseId}-tab-${key}`}
              hidden={!selected}
              tabIndex={0}
              className={
                selected
                  ? 'animate-fade-up rounded-2xl border border-gold/25 bg-gradient-to-b from-ink-800/80 to-ink/60 p-8 shadow-gold-glow backdrop-blur sm:p-10'
                  : ''
              }
            >
              {selected && (
                <div className="text-center">
                  <p className="font-display text-sm uppercase tracking-[0.4em] text-gold/70">
                    {ROMAN[key]}
                  </p>
                  <h3 className="mt-3 font-display text-2xl font-semibold text-gradient-gold sm:text-3xl">
                    {t(`landing.ages.${key}.title`)}
                  </h3>
                  <p className="mt-2 font-serif text-sm italic tracking-wide text-gold/70">
                    {t(`landing.ages.${key}.years`)}
                  </p>
                  <p className="mx-auto mt-5 max-w-2xl font-serif text-lg leading-relaxed text-mithril/85">
                    {t(`landing.ages.${key}.body`)}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progress dots */}
      <div className="mt-8 flex justify-center gap-2" aria-hidden="true">
        {AGE_KEYS.map((key, index) => (
          <span
            key={key}
            className={[
              'h-1.5 rounded-full transition-all duration-300',
              index === activeIndex ? 'w-8 bg-gold-bright' : 'w-2 bg-gold/30',
            ].join(' ')}
          />
        ))}
      </div>
    </section>
  );
}
