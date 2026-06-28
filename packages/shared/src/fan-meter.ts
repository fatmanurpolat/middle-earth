export type FanRankId =
  | 'hobbit'
  | 'ranger'
  | 'fellowship'
  | 'captain'
  | 'istari'
  | 'lord';

export interface FanRank {
  id: FanRankId;
  min: number;
  max: number;
}

export const FAN_RANKS = [
  { id: 'hobbit', min: 0, max: 19 },
  { id: 'ranger', min: 20, max: 39 },
  { id: 'fellowship', min: 40, max: 59 },
  { id: 'captain', min: 60, max: 79 },
  { id: 'istari', min: 80, max: 99 },
  { id: 'lord', min: 100, max: 100 },
] as const satisfies readonly FanRank[];

export interface FanMeterInput {
  booksRead: number;
  totalBooks: number;
  hasCharacter: boolean;
  hasCustomName: boolean;
}

export interface FanMeterResult {
  percentage: number;
  booksScore: number;
  profileScore: number;
  rankId: FanRankId;
  rankIndex: number;
}

export function computeFanMeter(input: FanMeterInput): FanMeterResult {
  const { booksRead, totalBooks, hasCharacter, hasCustomName } = input;

  const booksScore = Math.round((booksRead / Math.max(totalBooks, 1)) * 80);
  const profileScore = (hasCharacter ? 10 : 0) + (hasCustomName ? 10 : 0);
  const percentage = Math.min(100, Math.max(0, booksScore + profileScore));

  let rankIndex = 0;
  let rank: FanRank = FAN_RANKS[0];
  for (let i = 0; i < FAN_RANKS.length; i += 1) {
    const candidate = FAN_RANKS[i];
    if (
      candidate !== undefined &&
      candidate.min <= percentage &&
      percentage <= candidate.max
    ) {
      rankIndex = i;
      rank = candidate;
      break;
    }
  }

  return {
    percentage,
    booksScore,
    profileScore,
    rankId: rank.id,
    rankIndex,
  };
}
