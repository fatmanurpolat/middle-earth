import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  BOOKS,
  TOTAL_BOOKS,
  computeFanMeter,
  type BookId,
  type BookProgressDTO,
} from '@middleearth/shared';
import { useAuth } from '../auth/AuthContext';
import { ApiError } from '../api/client';

/** Build a bookId -> isRead lookup, defaulting any missing catalog entry to unread. */
function readMap(progress: BookProgressDTO[]): Map<BookId, boolean> {
  const map = new Map<BookId, boolean>();
  for (const book of BOOKS) {
    map.set(book.id, false);
  }
  for (const row of progress) {
    map.set(row.bookId, row.isRead);
  }
  return map;
}

export default function BookTracker() {
  const { t } = useTranslation();
  const { progress, user, fanMeter, api, applyProgress } = useAuth();

  const [pending, setPending] = useState<Set<BookId>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const reads = useMemo(() => readMap(progress), [progress]);

  const setPendingFor = (bookId: BookId, on: boolean) => {
    setPending((prev) => {
      const next = new Set(prev);
      if (on) {
        next.add(bookId);
      } else {
        next.delete(bookId);
      }
      return next;
    });
  };

  const toggle = async (bookId: BookId, nextValue: boolean) => {
    if (pending.has(bookId)) return;
    setError(null);
    setPendingFor(bookId, true);

    // Optimistic: recompute the fan meter locally for instant feedback.
    const optimisticProgress: BookProgressDTO[] = BOOKS.map((book) => {
      const isRead = book.id === bookId ? nextValue : (reads.get(book.id) ?? false);
      const existing = progress.find((p) => p.bookId === book.id);
      return {
        bookId: book.id,
        isRead,
        updatedAt:
          book.id === bookId
            ? new Date().toISOString()
            : (existing?.updatedAt ?? null),
      };
    });
    const optimisticBooksRead = optimisticProgress.filter((p) => p.isRead).length;
    const optimisticFanMeter = computeFanMeter({
      booksRead: optimisticBooksRead,
      totalBooks: TOTAL_BOOKS,
      hasCharacter: true,
      hasCustomName: Boolean(user?.customName && user.customName.trim().length > 0),
    });
    applyProgress({ progress: optimisticProgress, fanMeter: optimisticFanMeter });

    try {
      const reconciled = await api.setBookProgress(bookId, { isRead: nextValue });
      applyProgress(reconciled);
    } catch (err) {
      // Roll back to the last server-truth payload we had.
      applyProgress({ progress, fanMeter: fanMeter ?? optimisticFanMeter });
      setError(err instanceof ApiError ? err.message : t('common.error'));
    } finally {
      setPendingFor(bookId, false);
    }
  };

  return (
    <section className="panel p-6">
      <h2 className="font-display text-sm uppercase tracking-[0.2em] text-gold/90">
        {t('dashboard.books.title')}
      </h2>
      <p className="mt-1 text-sm text-mithril/60">{t('dashboard.books.subtitle')}</p>

      {error && (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-ember/40 bg-ember/15 px-3 py-2 text-sm text-parchment"
        >
          {error}
        </p>
      )}

      <ul className="mt-4 space-y-2">
        {BOOKS.map((book) => {
          const isRead = reads.get(book.id) ?? false;
          const isPending = pending.has(book.id);
          return (
            <li key={book.id}>
              <button
                type="button"
                onClick={() => void toggle(book.id, !isRead)}
                disabled={isPending}
                aria-pressed={isRead}
                className={[
                  'focus-ring flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all disabled:opacity-60',
                  isRead
                    ? 'panel-accent bg-ink-night/80'
                    : 'border-mithril/10 bg-ink-night/40 hover:border-mithril/25',
                ].join(' ')}
                style={
                  isRead
                    ? { boxShadow: 'inset 0 0 16px color-mix(in srgb, var(--accent) 18%, transparent)' }
                    : undefined
                }
              >
                <span
                  aria-hidden="true"
                  className={[
                    'flex h-6 w-6 flex-none items-center justify-center rounded-md border text-sm font-bold transition-colors',
                    isRead ? 'text-ink' : 'border-mithril/30 text-transparent',
                  ].join(' ')}
                  style={
                    isRead
                      ? { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)' }
                      : undefined
                  }
                >
                  &#10003;
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-base text-parchment">
                    {book.title}
                  </span>
                  <span className="text-xs text-mithril/50">
                    {t('dashboard.books.year', { year: book.year })}
                  </span>
                </span>
                <span
                  className="flex-none text-xs uppercase tracking-[0.16em]"
                  style={{ color: isRead ? 'var(--accent)' : undefined }}
                >
                  {isPending
                    ? t('common.loading')
                    : isRead
                      ? t('dashboard.books.read')
                      : t('dashboard.books.unread')}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
