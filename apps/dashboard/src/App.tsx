import { useTranslation } from 'react-i18next';
import { AuthProvider, useAuth } from './auth/AuthContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import MellonDoor from './components/MellonDoor';
import Dashboard from './components/Dashboard';

function Splash() {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4">
      <div
        className="h-14 w-14 animate-golden-glow rounded-full border-2 border-gold/40"
        aria-hidden="true"
      />
      <p className="font-display text-sm uppercase tracking-[0.22em] text-gold/80">
        {t('common.loading')}
      </p>
    </div>
  );
}

function Gate() {
  const { status } = useAuth();

  return (
    <div className="relative min-h-full">
      {/* Language switcher is always reachable, floating top-right, except on the
          dashboard which renders its own switcher inside the header. */}
      {status !== 'authed' && (
        <div className="absolute right-4 top-4 z-20">
          <LanguageSwitcher />
        </div>
      )}

      {status === 'loading' && <Splash />}
      {status === 'guest' && <MellonDoor />}
      {status === 'authed' && <Dashboard />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
