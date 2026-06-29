import { BOOKS, type BookProgressDTO, type UserDTO } from '@middleearth/shared';
import type { User } from '../domain/entities/User.js';
import type { BookProgressEntry } from '../domain/entities/BookProgressEntry.js';

/**
 * Map a domain User to the wire UserDTO. `displayName` follows the shared rule:
 * trimmed custom name when non-empty, else the character's canonical name.
 */
export function toUserDTO(user: User, publicApiUrl: string): UserDTO {
  const base = publicApiUrl.replace(/\/+$/, '');
  return {
    id: user.id,
    username: user.username,
    customName: user.customName,
    chosenCharacter: user.chosenCharacter,
    displayName: user.displayName(),
    avatarUrl: user.avatarKey
      ? `${base}/avatars/${user.id}?v=${avatarVersion(user.avatarKey)}`
      : null,
    createdAt: user.createdAt.toISOString(),
  };
}

/** Short cache-busting token derived from the avatar key (changes per upload). */
function avatarVersion(avatarKey: string): string {
  const file = avatarKey.split('/').pop() ?? avatarKey;
  return file.split('.')[0]?.slice(0, 12) ?? '1';
}

/**
 * Merge stored progress rows over the full BOOKS catalog so the response always
 * contains exactly one entry per book, in canonical book order. Books without a
 * stored row default to { isRead:false, updatedAt:null }.
 */
export function mergeProgress(
  entries: readonly BookProgressEntry[],
): BookProgressDTO[] {
  const byBookId = new Map<string, BookProgressEntry>();
  for (const entry of entries) {
    byBookId.set(entry.bookId, entry);
  }

  return BOOKS.map((book) => {
    const stored = byBookId.get(book.id);
    return {
      bookId: book.id,
      isRead: stored?.isRead ?? false,
      updatedAt: stored?.updatedAt ? stored.updatedAt.toISOString() : null,
    };
  });
}
