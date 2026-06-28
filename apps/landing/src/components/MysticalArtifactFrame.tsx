import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ARTIFACT_SRC, DESKTOP_ARTIFACT_PATH } from '../assets/artifact';

interface MysticalArtifactFrameProps {
  src?: string;
  caption?: string;
  note?: string;
}

// Ornate golden corner bracket, mirrored into all four corners via rotation.
function CornerOrnament({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      className={`pointer-events-none absolute h-10 w-10 text-gold-bright drop-shadow-[0_0_6px_rgba(224,178,60,0.6)] sm:h-14 sm:w-14 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 28 V8 a4 4 0 0 1 4 -4 H28" />
      <path d="M12 30 V14 a2 2 0 0 1 2 -2 H30" opacity="0.7" />
      <circle cx="10" cy="10" r="3" fill="currentColor" stroke="none" />
      <path d="M20 4 q-8 8 -16 16" opacity="0.5" />
    </svg>
  );
}

// Etched runes that sit along the inner border of the frame.
const RUNE_STRIP = '·ᚠ·ᚱ·ᛟ·ᛞ·ᚩ·ᛗ·ᛖᛚᛚᚩᚾ·ᛗᛁᚾᚾᚩ·ᚦᚱᛁᛒᛚᛠ·';

export default function MysticalArtifactFrame({
  src = ARTIFACT_SRC,
  caption,
  note,
}: MysticalArtifactFrameProps) {
  const { t } = useTranslation();
  const [failed, setFailed] = useState(false);

  const resolvedCaption = caption ?? t('landing.artifact.caption');
  const resolvedNote = note ?? DESKTOP_ARTIFACT_PATH;

  return (
    <figure className="group relative mx-auto w-full max-w-5xl">
      {/* Outer ember-runed frame */}
      <div className="rune-border relative rounded-[1.75rem] bg-gradient-to-b from-[#2c100d] via-[#1a0a08] to-[#2c100d] p-[3px] shadow-ember-glow">
        {/* Golden inner bezel */}
        <div className="relative rounded-[1.6rem] border border-gold/50 bg-ink-800 p-2 shadow-gold-glow sm:p-3">
          {/* Rune strips top & bottom */}
          <div className="pointer-events-none absolute inset-x-6 top-[6px] overflow-hidden">
            <div className="animate-rune-drift whitespace-nowrap font-display text-[0.6rem] tracking-[0.35em] text-gold/40">
              {RUNE_STRIP.repeat(8)}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-6 bottom-[6px] overflow-hidden">
            <div className="animate-rune-drift whitespace-nowrap font-display text-[0.6rem] tracking-[0.35em] text-gold/40">
              {RUNE_STRIP.repeat(8)}
            </div>
          </div>

          {/* The artwork (or graceful fallback) */}
          <div className="relative overflow-hidden rounded-[1.25rem] border border-gold/30">
            {failed ? (
              <div
                role="img"
                aria-label={resolvedCaption}
                className="flex aspect-[21/9] w-full flex-col items-center justify-center bg-gradient-to-b from-[#11203b] via-[#0b0b0f] to-[#2c1605] text-center"
              >
                <span className="animate-glow-pulse font-display text-5xl text-gold-bright">
                  &#x2727;
                </span>
                <p className="mt-4 max-w-md px-6 font-display text-sm uppercase tracking-[0.3em] text-gold/70">
                  {t('landing.artifact.title')}
                </p>
                <p className="mt-2 max-w-md px-6 text-sm text-mithril/60">
                  {resolvedCaption}
                </p>
              </div>
            ) : (
              <img
                src={src}
                alt={resolvedCaption}
                loading="lazy"
                onError={() => setFailed(true)}
                className="aspect-[21/9] w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.03]"
              />
            )}
            {/* Vignette + golden sheen over the art */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-vignette"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(60% 80% at 50% 0%, rgba(224,178,60,0.18), transparent 70%)',
              }}
            />
          </div>

          {/* Four ornate golden corners */}
          <CornerOrnament className="left-1 top-1" />
          <CornerOrnament className="right-1 top-1 rotate-90" />
          <CornerOrnament className="bottom-1 right-1 rotate-180" />
          <CornerOrnament className="bottom-1 left-1 -rotate-90" />
        </div>
      </div>

      {/* Layered outer glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] bg-gold/5 blur-3xl"
      />

      <figcaption className="mt-6 text-center">
        <p className="font-serif text-base italic text-parchment/85 sm:text-lg">
          {resolvedCaption}
        </p>
        <p className="mt-3 inline-flex max-w-full items-center gap-2 rounded-md border border-gold/20 bg-ink-800/60 px-3 py-1.5 font-mono text-[0.68rem] text-mithril/60">
          <span aria-hidden="true" className="text-gold/60">
            &#x2727;
          </span>
          <span className="truncate" title={resolvedNote}>
            {t('landing.artifact.runeNote')}: {resolvedNote}
          </span>
        </p>
      </figcaption>
    </figure>
  );
}
