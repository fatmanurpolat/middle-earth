interface RuneDividerProps {
  className?: string;
}

// Decorative tengwar-flavoured divider: a glowing line flanked by rune glyphs
// and a central elven sigil. Purely ornamental, hidden from assistive tech.
export default function RuneDivider({ className = '' }: RuneDividerProps) {
  const runes = 'ᚠᚦᚱᛁᛒᛚᛠ';

  return (
    <div
      aria-hidden="true"
      className={`flex select-none items-center justify-center gap-4 py-2 ${className}`}
    >
      <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/60 sm:w-28" />
      <span className="font-display text-sm tracking-[0.5em] text-gold/70">
        {runes}
      </span>
      <span className="animate-glow-pulse font-display text-lg text-gold-bright">
        &#x2727;
      </span>
      <span className="font-display text-sm tracking-[0.5em] text-gold/70">
        {runes}
      </span>
      <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/60 sm:w-28" />
    </div>
  );
}
