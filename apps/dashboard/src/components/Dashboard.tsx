import {
  getCharacter,
  TOTAL_BOOKS,
  computeFanMeter,
  type FanMeterResult,
} from '@middleearth/shared';
import { useAuth } from '../auth/AuthContext';
import Greeting from './Greeting';
import FanMeter from './FanMeter';
import BookTracker from './BookTracker';
import ProfileCard from './ProfileCard';
import ChangePassword from './ChangePassword';
import DeleteAccount from './DeleteAccount';
import SignOutButton from './SignOutButton';
import LanguageSwitcher from './LanguageSwitcher';

export default function Dashboard() {
  const { user, progress, fanMeter } = useAuth();

  // Guarded by the App gate (only rendered when authed), but stay type-safe.
  if (!user) {
    return null;
  }

  const character = getCharacter(user.chosenCharacter);
  const accentSoft = character.accentSoft;
  const accent = character.accentColor;

  const booksRead = progress.filter((p) => p.isRead).length;
  const profileComplete = Boolean(
    user.customName && user.customName.trim().length > 0,
  );

  // Fall back to a freshly computed meter if the server one isn't loaded yet.
  const resolvedFanMeter: FanMeterResult =
    fanMeter ??
    computeFanMeter({
      booksRead,
      totalBooks: TOTAL_BOOKS,
      hasCharacter: true,
      hasCustomName: profileComplete,
    });

  const rootStyle = {
    '--accent': accent,
    '--accent-soft': accentSoft,
  } as React.CSSProperties;

  return (
    <div
      className="min-h-full"
      style={{
        ...rootStyle,
        backgroundImage: `radial-gradient(circle at 50% -10%, ${accent}1f, transparent 55%)`,
      }}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 py-8 sm:px-6 lg:py-12">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="animate-fade-up">
            <Greeting
              chosenCharacter={user.chosenCharacter}
              displayName={user.displayName}
              avatarUrl={user.avatarUrl}
            />
          </div>
          <div className="flex items-center gap-3 self-start sm:self-auto">
            <LanguageSwitcher />
            <SignOutButton />
          </div>
        </header>

        <main className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="animate-fade-up lg:col-span-1">
            <FanMeter
              fanMeter={resolvedFanMeter}
              booksRead={booksRead}
              totalBooks={TOTAL_BOOKS}
              profileComplete={profileComplete}
            />
          </div>
          <div className="animate-fade-up space-y-6 lg:col-span-1">
            <ProfileCard />
            <ChangePassword />
            <DeleteAccount />
          </div>
          <div className="animate-fade-up lg:col-span-1">
            <BookTracker />
          </div>
        </main>
      </div>
    </div>
  );
}
