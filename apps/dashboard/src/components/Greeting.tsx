import { useTranslation } from 'react-i18next';
import { getCharacter, type CharacterId } from '@middleearth/shared';
import CharacterSigil from './CharacterSigil';

export interface GreetingProps {
  chosenCharacter: CharacterId;
  displayName: string;
}

export default function Greeting({ chosenCharacter, displayName }: GreetingProps) {
  const { t } = useTranslation();
  const character = getCharacter(chosenCharacter);

  return (
    <div className="flex items-center gap-4">
      <CharacterSigil character={character} size="lg" glow />
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
