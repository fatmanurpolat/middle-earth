import type { Character } from '@middleearth/shared';

export interface CharacterSigilProps {
  character: Character;
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  className?: string;
}

const SIZE_MAP: Record<NonNullable<CharacterSigilProps['size']>, string> = {
  sm: 'h-10 w-10 text-base',
  md: 'h-14 w-14 text-xl',
  lg: 'h-20 w-20 text-3xl',
};

/** Pull the first grapheme of the canonical name for the monogram. */
function monogram(name: string): string {
  return Array.from(name.trim())[0]?.toUpperCase() ?? '?';
}

export default function CharacterSigil({
  character,
  size = 'md',
  glow = false,
  className = '',
}: CharacterSigilProps) {
  const style: React.CSSProperties = {
    color: character.accentColor,
    borderColor: character.accentColor,
    background: `radial-gradient(circle at 50% 35%, ${character.accentSoft} 0%, #0B0B0F 100%)`,
    boxShadow: glow
      ? `0 0 18px ${character.accentColor}66, inset 0 0 14px ${character.accentColor}22`
      : `inset 0 0 12px ${character.accentColor}1f`,
  };

  return (
    <span
      aria-hidden="true"
      className={[
        'inline-flex select-none items-center justify-center rounded-full border-2 font-display font-semibold',
        SIZE_MAP[size],
        className,
      ].join(' ')}
      style={style}
    >
      {monogram(character.name)}
    </span>
  );
}
