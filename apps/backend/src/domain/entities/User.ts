import { getCharacter, type CharacterId } from '@middleearth/shared';

/**
 * User domain entity. Pure: no framework or persistence concerns.
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly username: string,
    public readonly customName: string | null,
    public readonly chosenCharacter: CharacterId,
    public readonly createdAt: Date,
    /** Object-storage key of the uploaded avatar, or null if none. */
    public readonly avatarKey: string | null = null,
  ) {}

  /**
   * Resolved display name: trimmed custom name when non-empty, otherwise the
   * canonical name of the chosen character. Mirrors the shared UserDTO rule.
   */
  displayName(): string {
    const trimmed = this.customName?.trim() ?? '';
    if (trimmed.length > 0) {
      return trimmed;
    }
    return getCharacter(this.chosenCharacter).name;
  }
}
