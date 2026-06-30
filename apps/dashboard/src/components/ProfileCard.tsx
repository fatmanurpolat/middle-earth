import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties,
  type FormEvent,
} from 'react';
import { useTranslation } from 'react-i18next';
import { getCharacter } from '@middleearth/shared';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import { CHARACTER_IMAGES } from '../assets/characters';

export default function ProfileCard() {
  const { t } = useTranslation();
  const { user, api, applyUser } = useAuth();

  const [name, setName] = useState(user?.customName ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const savedTimer = useRef<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

  const handleAvatarFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = ''; // allow re-selecting the same file later
    if (!file) {
      return;
    }
    setAvatarError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setAvatarError(t('dashboard.avatar.errorType'));
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError(t('dashboard.avatar.errorSize'));
      return;
    }
    setUploading(true);
    try {
      const response = await api.uploadAvatar(file);
      applyUser(response.user, response.fanMeter);
    } catch (err) {
      if (err instanceof ApiError) {
        setAvatarError(
          err.status === 0 ? t('auth.errorNetwork') : err.message || t('common.error'),
        );
      } else {
        setAvatarError(t('common.error'));
      }
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarError(null);
    setUploading(true);
    try {
      const response = await api.removeAvatar();
      applyUser(response.user, response.fanMeter);
    } catch (err) {
      if (err instanceof ApiError) {
        setAvatarError(
          err.status === 0 ? t('auth.errorNetwork') : err.message || t('common.error'),
        );
      } else {
        setAvatarError(t('common.error'));
      }
    } finally {
      setUploading(false);
    }
  };

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
  // Default to the chosen character's portrait; the uploaded avatar wins when set.
  const avatarSrc = user.avatarUrl ?? CHARACTER_IMAGES[user.chosenCharacter];

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
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          aria-label={t('dashboard.avatar.change')}
          title={t('dashboard.avatar.change')}
          className="focus-ring group relative h-20 w-20 flex-none rounded-full disabled:cursor-wait"
        >
          <img
            src={avatarSrc}
            alt={user.displayName}
            className="h-20 w-20 rounded-full object-cover"
            style={{ boxShadow: '0 0 0 2px var(--accent)' } as CSSProperties}
          />
          {/* Always-visible camera badge so it's obvious the photo is editable. */}
          <span
            aria-hidden="true"
            className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-ink"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="#0B0B0F"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </span>
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/70 text-center text-[0.6rem] font-display uppercase tracking-wide text-parchment opacity-0 transition-opacity group-hover:opacity-100">
            {uploading ? t('common.loading') : t('dashboard.avatar.change')}
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleAvatarFile}
        />
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
          <div className="mt-1.5 flex items-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="focus-ring inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition-opacity hover:opacity-80 disabled:opacity-50"
              style={{ color: 'var(--accent)' }}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
              {uploading ? t('common.loading') : t('dashboard.avatar.change')}
            </button>
            {user.avatarUrl && (
              <button
                type="button"
                onClick={() => void handleRemoveAvatar()}
                disabled={uploading}
                className="focus-ring text-xs font-semibold uppercase tracking-[0.14em] text-mithril/60 transition-colors hover:text-ember disabled:opacity-50"
              >
                {t('dashboard.avatar.remove')}
              </button>
            )}
          </div>
        </div>
      </div>

      {avatarError && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-ember/40 bg-ember/15 px-3 py-2 text-sm text-parchment"
        >
          {avatarError}
        </p>
      )}

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
