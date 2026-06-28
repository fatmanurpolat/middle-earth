import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../auth/AuthContext';

export default function SignOutButton() {
  const { t } = useTranslation();
  const { logout } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await logout();
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => void handleClick()}
      disabled={busy}
      className="focus-ring rounded-full border border-ember/40 bg-ember/10 px-4 py-2 font-display text-xs uppercase tracking-[0.18em] text-parchment transition-colors hover:bg-ember/25 disabled:opacity-50"
    >
      {busy ? t('common.loading') : t('dashboard.signOut')}
    </button>
  );
}
