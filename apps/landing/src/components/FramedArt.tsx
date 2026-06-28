import { useState } from 'react';

interface FramedArtProps {
  src: string;
  title: string;
  caption: string;
  /** Narrower presentation for portrait artwork. */
  portrait?: boolean;
}

// Ornate golden corner bracket, mirrored into the four corners via rotation.
function Corner({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      className={`pointer-events-none absolute h-8 w-8 text-gold-bright drop-shadow-[0_0_5px_rgba(224,178,60,0.55)] sm:h-11 sm:w-11 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 28 V8 a4 4 0 0 1 4 -4 H28" />
      <path d="M12 30 V14 a2 2 0 0 1 2 -2 H30" opacity="0.7" />
      <circle cx="10" cy="10" r="3" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * A single piece of lore artwork in a museum-grade elven frame: ember-runed
 * border, golden bezel, ornate corners, and a caption. The artwork is shown
 * with object-contain so any aspect ratio is matted rather than cropped, and a
 * styled fallback keeps the frame intentional when the image is missing.
 */
export default function FramedArt({
  src,
  title,
  caption,
  portrait = false,
}: FramedArtProps) {
  const [failed, setFailed] = useState(false);

  return (
    <figure
      className={`group relative w-full ${portrait ? 'max-w-sm' : 'max-w-4xl'}`}
    >
      <div className="rune-border relative rounded-[1.5rem] bg-gradient-to-b from-[#2c100d] via-[#1a0a08] to-[#2c100d] p-[3px] shadow-ember-glow">
        <div className="relative rounded-[1.35rem] border border-gold/50 bg-ink-800 p-2 shadow-gold-glow sm:p-2.5">
          <div className="relative flex items-center justify-center overflow-hidden rounded-[1.1rem] border border-gold/30 bg-gradient-to-b from-[#0d1422] via-[#0b0b0f] to-[#1a0f06]">
            {failed ? (
              <div
                role="img"
                aria-label={title}
                className={`flex w-full flex-col items-center justify-center px-6 text-center ${
                  portrait ? 'aspect-[3/4]' : 'aspect-[16/9]'
                }`}
              >
                <span className="animate-glow-pulse font-display text-4xl text-gold-bright">
                  &#x2727;
                </span>
                <p className="mt-3 font-display text-xs uppercase tracking-[0.3em] text-gold/70">
                  {title}
                </p>
                <p className="mt-2 max-w-xs text-xs text-mithril/55">{caption}</p>
              </div>
            ) : (
              <img
                src={src}
                alt={`${title} — ${caption}`}
                loading="lazy"
                onError={() => setFailed(true)}
                className={`w-auto max-w-full object-contain transition-transform duration-[1200ms] ease-out group-hover:scale-[1.02] ${
                  portrait ? 'max-h-[34rem]' : 'max-h-[30rem]'
                }`}
              />
            )}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-vignette"
            />
          </div>

          <Corner className="left-1 top-1" />
          <Corner className="right-1 top-1 rotate-90" />
          <Corner className="bottom-1 right-1 rotate-180" />
          <Corner className="bottom-1 left-1 -rotate-90" />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-5 -z-10 rounded-[2rem] bg-gold/5 blur-3xl"
      />

      <figcaption className="mt-5 text-center">
        <h3 className="font-display text-lg font-semibold text-gradient-gold sm:text-xl">
          {title}
        </h3>
        <p className="mx-auto mt-2 max-w-xl font-serif text-sm italic text-parchment/80 sm:text-base">
          {caption}
        </p>
      </figcaption>
    </figure>
  );
}
