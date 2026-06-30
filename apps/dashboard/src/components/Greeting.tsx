import type { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import type { CharacterId } from '@middleearth/shared';
import { CHARACTER_IMAGES } from '../assets/characters';

export interface GreetingProps {
  chosenCharacter: CharacterId;
  displayName: string;
  avatarUrl?: string | null;
}

export default function Greeting({
  chosenCharacter,
  displayName,
  avatarUrl,
}: GreetingProps) {
  const { t } = useTranslation();
  // Default to the chosen character's portrait; the uploaded avatar wins when set.
  const avatarSrc = avatarUrl ?? CHARACTER_IMAGES[chosenCharacter];

  return (
    <div className="flex items-center gap-4">
      <img
        src={avatarSrc}
        alt={displayName}
        className="h-20 w-20 flex-none rounded-full object-cover"
        style={{ boxShadow: '0 0 0 2px var(--accent)' } as CSSProperties}
      />
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.2em] text-mithril/50">
          {t('dashboard.subtitle')}
        </p>
        <h1
          className="truncate font-display text-2xl font-bold sm:text-3xl"
          style={{ color: 'var(--accent)' }}
        >
          {t('dashboard.welcome', { name: displayName })}
        </h1>
        <p className="mt-1 max-w-2xl text-sm italic leading-relaxed text-parchment/80">
          &ldquo;{t(`dashboard.greeting.${chosenCharacter}`)}&rdquo;
        </p>
      </div>
    </div>
  );
}
