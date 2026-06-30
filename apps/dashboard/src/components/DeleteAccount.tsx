import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';
import PasswordField from './PasswordField';

/**
 * Danger zone: permanently delete the signed-in account. Requires the current
 * password and an explicit confirm step. On success the auth state is cleared,
 * so the app gate swaps back to the login door automatically.
 */
export default function DeleteAccount() {
  const { t } = useTranslation();
  const { deleteAccount } = useAuth();

  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancel = () => {
    setOpen(false);
    setPassword('');
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (password.length === 0) {
      setError(t('auth.errorPasswordRequired'));
      return;
    }

    setSubmitting(true);
    try {
      await deleteAccount(password);
      // Success: clearSession() in the context unmounts this view.
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError(t('dashboard.deleteAccount.errorWrong'));
      } else if (
        err instanceof ApiError &&
        (err.status === 0 || err.code === 'NETWORK_ERROR')
      ) {
        setError(t('auth.errorNetwork'));
      } else {
        setError(
          err instanceof ApiError && err.message ? err.message : t('common.error'),
        );
      }
      setSubmitting(false);
    }
  };

  return (
    <section className="panel p-6" style={{ borderColor: 'rgba(199, 81, 70, 0.4)' }}>
      <h2 className="font-display text-sm uppercase tracking-[0.2em] text-ember">
        {t('dashboard.deleteAccount.title')}
      </h2>
      <p className="mt-1 text-sm text-mithril/60">
        {t('dashboard.deleteAccount.description')}
      </p>

      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="focus-ring mt-4 w-full rounded-xl border border-ember/50 px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.16em] text-ember transition-all hover:bg-ember/15"
        >
          {t('dashboard.deleteAccount.button')}
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4" noValidate>
          <p className="rounded-lg border border-ember/40 bg-ember/15 px-3 py-2 text-sm text-parchment">
            {t('dashboard.deleteAccount.warning')}
          </p>
          <PasswordField
            id="del-password"
            label={t('dashboard.deleteAccount.passwordLabel')}
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
          />

          {error && (
            <p
              role="alert"
              className="rounded-lg border border-ember/40 bg-ember/15 px-3 py-2 text-sm text-parchment"
            >
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={cancel}
              disabled={submitting}
              className="focus-ring flex-1 rounded-xl border border-mithril/20 px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.16em] text-mithril/80 transition-all hover:border-mithril/40 disabled:opacity-50"
            >
              {t('dashboard.deleteAccount.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="focus-ring flex-1 rounded-xl bg-ember px-5 py-2.5 font-display text-sm font-semibold uppercase tracking-[0.16em] text-ink transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? t('common.loading') : t('dashboard.deleteAccount.confirm')}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
