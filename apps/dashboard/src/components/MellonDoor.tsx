import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import type { CharacterId } from '@middleearth/shared';
import { isCharacterId } from '@middleearth/shared';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import CharacterPicker from './CharacterPicker';

/** The decorative Doors of Durin arch: trees, crown, Star of Durin + the arching inscription. */
function DoorsOfDurin({ inscription }: { inscription: string }) {
  return (
    <svg
      viewBox="0 0 400 320"
      className="h-auto w-full max-w-md"
      role="img"
      aria-label="The Doors of Durin"
    >
      <defs>
        <path
          id="inscription-arc"
          d="M 40 200 A 160 160 0 0 1 360 200"
          fill="none"
        />
        <linearGradient id="mithril-stroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E6ECF5" />
          <stop offset="100%" stopColor="#7E8794" />
        </linearGradient>
        <radialGradient id="door-fill" cx="50%" cy="40%" r="70%">
          <stop offset="0%" stopColor="#1a1a24" />
          <stop offset="100%" stopColor="#0B0B0F" />
        </radialGradient>
      </defs>

      {/* Outer arch */}
      <path
        d="M 40 300 L 40 200 A 160 160 0 0 1 360 200 L 360 300"
        fill="url(#door-fill)"
        stroke="url(#mithril-stroke)"
        strokeWidth="2.5"
        className="animate-door-breathe"
      />
      {/* Inner arch line */}
      <path
        d="M 64 300 L 64 200 A 136 136 0 0 1 336 200 L 336 300"
        fill="none"
        stroke="url(#mithril-stroke)"
        strokeWidth="1"
        opacity="0.5"
      />
      {/* Door split */}
      <line
        x1="200"
        y1="120"
        x2="200"
        y2="300"
        stroke="url(#mithril-stroke)"
        strokeWidth="1"
        opacity="0.4"
      />

      {/* Two trees flanking the doors */}
      <g
        stroke="url(#mithril-stroke)"
        strokeWidth="1.4"
        fill="none"
        className="animate-rune-shimmer"
        opacity="0.85"
      >
        {/* Left tree */}
        <path d="M 110 300 L 110 200" />
        <path d="M 110 230 q -22 -14 -34 -34 M 110 240 q 22 -16 36 -30 M 110 215 q -16 -16 -22 -34 M 110 222 q 18 -14 30 -34" />
        {/* Right tree */}
        <path d="M 290 300 L 290 200" />
        <path d="M 290 230 q 22 -14 34 -34 M 290 240 q -22 -16 -36 -30 M 290 215 q 16 -16 22 -34 M 290 222 q -18 -14 -30 -34" />
      </g>

      {/* Crown of seven stars */}
      <g
        fill="url(#mithril-stroke)"
        className="animate-rune-shimmer"
        transform="translate(0,-2)"
      >
        {[140, 160, 180, 200, 220, 240, 260].map((cx, i) => (
          <circle key={cx} cx={cx} cy={i % 2 === 0 ? 96 : 90} r="2" />
        ))}
      </g>

      {/* Star of Durin (hammer + anvil suggested by an 8-point star) */}
      <g
        transform="translate(200 150)"
        stroke="url(#mithril-stroke)"
        strokeWidth="1.4"
        fill="none"
        className="animate-door-breathe"
      >
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (Math.PI / 4) * i;
          const x = Math.cos(angle) * 24;
          const y = Math.sin(angle) * 24;
          return <line key={i} x1="0" y1="0" x2={x.toFixed(2)} y2={y.toFixed(2)} />;
        })}
        <circle cx="0" cy="0" r="6" />
      </g>

      {/* Arching elven inscription */}
      <text
        fill="#B8C0CC"
        className="animate-rune-shimmer"
        style={{ fontFamily: 'Cinzel, serif', letterSpacing: '0.5px' }}
        fontSize="11.5"
      >
        <textPath href="#inscription-arc" startOffset="50%" textAnchor="middle">
          {inscription}
        </textPath>
      </text>
    </svg>
  );
}

type Mode = 'register' | 'login';

const inputClass =
  'focus-ring mt-2 w-full rounded-lg border border-mithril/15 bg-ink/70 px-4 py-2.5 text-parchment placeholder:text-mithril/30';
const labelClass =
  'block font-display text-sm uppercase tracking-[0.16em] text-gold/90';

export default function MellonDoor() {
  const { t } = useTranslation();
  const { register, login } = useAuth();

  const [mode, setMode] = useState<Mode>('register');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selected, setSelected] = useState<CharacterId | null>(null);
  const [customName, setCustomName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (mode === 'register' && (!selected || !isCharacterId(selected))) {
      setError(t('auth.errorNoCharacter'));
      return;
    }

    setSubmitting(true);
    try {
      if (mode === 'register') {
        const trimmedName = customName.trim();
        await register({
          username: username.trim(),
          password,
          chosenCharacter: selected as CharacterId,
          customName: trimmedName.length > 0 ? trimmedName : null,
        });
      } else {
        await login({ username: username.trim(), password });
      }
    } catch (err) {
      setError(resolveError(err, t));
    } finally {
      setSubmitting(false);
    }
  };

  const selectedName = selected ? t(`characters.${selected}.title`) : '';
  const isRegister = mode === 'register';

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col items-center px-4 py-12 sm:py-16">
      <section className="flex flex-col items-center text-center">
        <DoorsOfDurin inscription={t('auth.inscription')} />
        <h1 className="mt-6 font-display text-3xl font-bold tracking-wide text-mithril text-shadow-mithril sm:text-4xl">
          {t('auth.doorTitle')}
        </h1>
        <p className="mt-2 max-w-xl text-mithril/70">{t('auth.doorSubtitle')}</p>
        <p className="mt-4 font-display text-lg uppercase tracking-[0.22em] text-gold-bright text-shadow-glow">
          {t('auth.mellonPhrase')}
        </p>
      </section>

      <form
        onSubmit={handleSubmit}
        className="panel mt-10 w-full max-w-3xl animate-fade-up p-6 sm:p-8"
        noValidate
      >
        {/* Login / Register tabs */}
        <div
          role="tablist"
          aria-label={t('auth.doorTitle')}
          className="mb-7 grid grid-cols-2 gap-2 rounded-xl border border-mithril/10 bg-ink/50 p-1"
        >
          {(['register', 'login'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => switchMode(m)}
              className={`focus-ring rounded-lg px-4 py-2 font-display text-xs uppercase tracking-[0.18em] transition-colors ${
                mode === m
                  ? 'bg-gold text-ink'
                  : 'text-mithril/70 hover:text-mithril'
              }`}
            >
              {t(m === 'register' ? 'auth.tabRegister' : 'auth.tabLogin')}
            </button>
          ))}
        </div>

        {/* Credentials */}
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="username" className={labelClass}>
              {t('auth.usernameLabel')}
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              value={username}
              maxLength={30}
              required
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('auth.usernamePlaceholder')}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="password" className={labelClass}>
              {t('auth.passwordLabel')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              maxLength={100}
              required
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              className={inputClass}
            />
            {isRegister && (
              <p className="mt-1.5 text-xs text-mithril/50">
                {t('auth.passwordHint')}
              </p>
            )}
          </div>
        </div>

        {/* Register-only: choose character + display name */}
        {isRegister && (
          <>
            <h2 className="mt-8 font-display text-sm uppercase tracking-[0.2em] text-gold/90">
              {t('auth.chooseCharacter')}
            </h2>
            <div className="mt-4">
              <CharacterPicker selected={selected} onSelect={setSelected} />
            </div>

            {selected && (
              <p className="mt-4 text-sm text-mithril/70">
                {t('auth.selected', { name: selectedName })}
              </p>
            )}

            <div className="mt-6">
              <label htmlFor="display-name" className={labelClass}>
                {t('auth.displayNameLabel')}
              </label>
              <input
                id="display-name"
                type="text"
                value={customName}
                maxLength={64}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={t('auth.displayNamePlaceholder')}
                className={inputClass}
              />
              <p className="mt-1.5 text-xs text-mithril/50">
                {t('auth.displayNameHint')}
              </p>
            </div>
          </>
        )}

        {error && (
          <p
            role="alert"
            className="mt-5 rounded-lg border border-ember/40 bg-ember/15 px-4 py-2.5 text-sm text-parchment"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || (isRegister && !selected)}
          className="focus-ring mt-7 w-full rounded-xl bg-gold px-6 py-3.5 font-display text-base font-semibold uppercase tracking-[0.18em] text-ink transition-all hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-40 enabled:animate-golden-glow"
        >
          {submitting
            ? t('common.loading')
            : isRegister
              ? t('auth.enterButton')
              : t('auth.loginButton')}
        </button>
      </form>
    </main>
  );
}

/** Map an API error to a friendly, localized message. */
function resolveError(err: unknown, t: (key: string) => string): string {
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return t('auth.errorInvalidCredentials');
    }
    if (err.status === 409 || err.code === 'CONFLICT') {
      return t('auth.errorUsernameTaken');
    }
    if (err.message) {
      return err.message;
    }
  }
  return t('auth.errorGeneric');
}
