import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FanMeterResult } from '@middleearth/shared';

export interface FanMeterProps {
  fanMeter: FanMeterResult;
  booksRead: number;
  totalBooks: number;
  profileComplete: boolean;
}

const RADIUS = 80;
const STROKE = 12;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function FanMeter({
  fanMeter,
  booksRead,
  totalBooks,
  profileComplete,
}: FanMeterProps) {
  const { t } = useTranslation();
  const percentage = Math.min(100, Math.max(0, fanMeter.percentage));

  // Animate the ring + counter toward the live percentage.
  const [animated, setAnimated] = useState(0);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimated(percentage));
    return () => cancelAnimationFrame(frame);
  }, [percentage]);

  const offset = CIRCUMFERENCE - (animated / 100) * CIRCUMFERENCE;

  return (
    <section className="panel panel-accent flex flex-col items-center p-6">
      <h2 className="self-start font-display text-sm uppercase tracking-[0.2em] text-gold/90">
        {t('dashboard.fanMeter.title')}
      </h2>

      <div className="relative mt-4 flex items-center justify-center">
        <svg
          width="200"
          height="200"
          viewBox="0 0 200 200"
          className="-rotate-90"
          role="img"
          aria-label={t('dashboard.fanMeter.percentLabel', { value: percentage })}
        >
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="rgba(184,192,204,0.12)"
            strokeWidth={STROKE}
          />
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="var(--accent)"
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1)',
              filter: 'drop-shadow(0 0 8px var(--accent))',
            }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-display text-4xl font-bold"
            style={{ color: 'var(--accent)' }}
          >
            {Math.round(animated)}%
          </span>
          <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-mithril/50">
            {t('dashboard.fanMeter.rankLabel')}
          </span>
        </div>
      </div>

      <p className="mt-2 text-center font-display text-lg" style={{ color: 'var(--accent)' }}>
        {t(`dashboard.fanMeter.ranks.${fanMeter.rankId}`)}
      </p>

      <dl className="mt-5 w-full space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-mithril/60">
            {t('dashboard.fanMeter.booksRead', {
              read: booksRead,
              total: totalBooks,
            })}
          </dt>
          <dd className="font-display tabular-nums text-parchment">
            +{fanMeter.booksScore}
          </dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-mithril/60">
            {profileComplete
              ? t('dashboard.fanMeter.profileComplete')
              : t('dashboard.fanMeter.profileIncomplete')}
          </dt>
          <dd className="font-display tabular-nums text-parchment">
            +{fanMeter.profileScore}
          </dd>
        </div>
      </dl>
    </section>
  );
}
