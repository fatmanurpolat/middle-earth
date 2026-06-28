import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { getCharacter } from '@middleearth/shared';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import CharacterSigil from './CharacterSigil';

export default function ProfileCard() {
  const { t } = useTranslation();
  const { user, api, applyUser } = useAuth();

  const [name, setName] = useState(user?.customName ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedTimer = useRef<number | null>(null);

  // Keep the input in sync when the user is (re)hydrated externally.
  useEffect(() => {
    setName(user?.customName ?? '');
  }, [user?.customName]);

  useEffect(
    () => () => {
      if (savedTimer.current !== null) {
        window.clearTimeout(savedTimer.current);
      }
    },
    [],
  );

  if (!user) {
    return null;
  }

  const character = getCharacter(user.chosenCharacter);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);
    setSaving(true);

    const trimmed = name.trim();
    const nextName = trimmed.length > 0 ? trimmed : null;

    try {
      const response = await api.updateProfile({ customName: nextName });
      applyUser(response.user, response.fanMeter);
      setName(response.user.customName ?? '');
      setSaved(true);
      if (savedTimer.current !== null) {
        window.clearTimeout(savedTimer.current);
      }
      savedTimer.current = window.setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel p-6">
      <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold/90">
        {t('dashboard.profile.title')}
      </h2>

      <div className="mt-4 flex items-center gap-4">
        <CharacterSigil character={character} size="md" glow />
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.16em] text-mithril/50">
            {t('dashboard.profile.character')}
          </p>
          <p
            className="truncate font-display text-lg"
            style={{ color: 'var(--accent)' }}
          >
            {character.name}
          </p>
          <p className="truncate text-xs text-mithril/60">
            {t(`characters.${character.id}.title`)}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5" noValidate>
        <label
          htmlFor="profile-name"
          className="block font-display text-sm uppercase tracking-[0.16em] text-gold/90"
        >
          {t('dashboard.profile.displayName')}
        </label>
        <input
          id="profile-name"
          type="text"
          value={name}
          maxLength={64}
          onChange={(e) => {
            setName(e.target.value);
            setSaved(false);
          }}
          placeholder={t('dashboard.profile.namePlaceholder')}
          className="focus-ring mt-2 w-full rounded-lg border border-mithril/15 bg-ink/70 px-4 py-2.5 text-parchment placeholder:text-mithril/30"
        />

        {error && (
          <p
            role="alert"
            className="mt-3 rounded-lg border border-ember/40 bg-ember/15 px-3 py-2 text-sm text-parchment"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="focus-ring mt-4 w-full rounded-xl px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.16em] text-ink transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {saving
            ? t('common.loading')
            : saved
              ? t('dashboard.profile.saved')
              : t('dashboard.profile.save')}
        </button>
      </form>
    </section>
  );
}
