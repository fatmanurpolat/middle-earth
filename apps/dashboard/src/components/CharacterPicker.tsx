import { useTranslation } from 'react-i18next';
import { CHARACTERS, type CharacterId } from '@middleearth/shared';
import CharacterSigil from './CharacterSigil';

export interface CharacterPickerProps {
  selected: CharacterId | null;
  onSelect: (id: CharacterId) => void;
}

export default function CharacterPicker({ selected, onSelect }: CharacterPickerProps) {
  const { t } = useTranslation();

  return (
    <fieldset
      className="grid grid-cols-2 gap-3 sm:grid-cols-3"
      aria-label={t('auth.chooseCharacter')}
    >
      {CHARACTERS.map((character) => {
        const active = character.id === selected;
        return (
          <button
            key={character.id}
            type="button"
            onClick={() => onSelect(character.id)}
            aria-pressed={active}
            className={[
              'focus-ring group relative flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all duration-200',
              active
                ? 'bg-ink-night/90 -translate-y-0.5'
                : 'border-mithril/10 bg-ink-night/50 hover:-translate-y-0.5 hover:border-mithril/25',
            ].join(' ')}
            style={
              active
                ? {
                    borderColor: character.accentColor,
                    boxShadow: `0 0 22px ${character.accentColor}55, inset 0 0 18px ${character.accentColor}22`,
                  }
                : undefined
            }
          >
            <CharacterSigil character={character} size="md" glow={active} />
            <span className="flex flex-col">
              <span
                className="font-display text-sm font-semibold leading-tight"
                style={{ color: active ? character.accentColor : '#EDE3CC' }}
              >
                {character.name}
              </span>
              <span className="mt-0.5 text-[11px] leading-snug text-mithril/60">
                {t(`characters.${character.id}.title`)}
              </span>
              <span className="mt-0.5 text-[10px] uppercase tracking-[0.16em] text-mithril/40">
                {character.race}
              </span>
            </span>
            {active && (
              <span
                aria-hidden="true"
                className="absolute right-2 top-2 inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold text-ink"
                style={{ backgroundColor: character.accentColor }}
              >
                &#10003;
              </span>
            )}
          </button>
        );
      })}
    </fieldset>
  );
}
