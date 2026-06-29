import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import PasswordField from './PasswordField';

/** Change-password form, shown on the dashboard for the signed-in user. */
export default function ChangePassword() {
  const { t } = useTranslation();
  const { api } = useAuth();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (current.length === 0) {
      setError(t('auth.errorPasswordRequired'));
      return;
    }
    if (next.length < 8) {
      setError(t('auth.errorPasswordShort'));
      return;
    }
    if (confirm !== next) {
      setError(t('auth.errorPasswordMismatch'));
      return;
    }

    setSaving(true);
    try {
      await api.changePassword({ currentPassword: current, newPassword: next });
      setSaved(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t('dashboard.password.errorCurrentWrong'));
      } else if (
        err instanceof ApiError &&
        (err.status === 0 || err.code === 'NETWORK_ERROR')
      ) {
        setError(t('auth.errorNetwork'));
      } else {
        setError(err instanceof ApiError && err.message ? err.message : t('common.error'));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="panel p-6">
      <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold/90">
        {t('dashboard.password.title')}
      </h2>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
        <PasswordField
          id="cp-current"
          label={t('dashboard.password.current')}
          value={current}
          onChange={setCurrent}
          autoComplete="current-password"
        />
        <PasswordField
          id="cp-new"
          label={t('dashboard.password.new')}
          value={next}
          onChange={setNext}
          autoComplete="new-password"
          hint={t('auth.passwordHint')}
        />
        <PasswordField
          id="cp-confirm"
          label={t('dashboard.password.confirm')}
          value={confirm}
          onChange={setConfirm}
          autoComplete="new-password"
        />

        {error && (
          <p
            role="alert"
            className="rounded-lg border border-ember/40 bg-ember/15 px-3 py-2 text-sm text-parchment"
          >
            {error}
          </p>
        )}
        {saved && (
          <p className="rounded-lg border border-[#4ADE80]/40 bg-[#4ADE80]/10 px-3 py-2 text-sm text-parchment">
            {t('dashboard.password.saved')}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="focus-ring w-full rounded-xl px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.16em] text-ink transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          {saving ? t('common.loading') : t('dashboard.password.submit')}
        </button>
      </form>
    </section>
  );
}
