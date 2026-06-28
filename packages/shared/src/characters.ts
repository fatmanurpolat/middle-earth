import type { CharacterId } from './types.js';

export interface Character {
  id: CharacterId;
  name: string;
  race: string;
  realm: string;
  accentColor: string;
  accentSoft: string;
}

export const CHARACTERS = [
  {
    id: 'gandalf',
    name: 'Gandalf',
    race: 'Maia (Istari)',
    realm: 'The Wandering',
    accentColor: '#B8C0CC',
    accentSoft: '#2A2E37',
  },
  {
    id: 'legolas',
    name: 'Legolas',
    race: 'Elf',
    realm: 'Woodland Realm',
    accentColor: '#4ADE80',
    accentSoft: '#07271A',
  },
  {
    id: 'saruman',
    name: 'Saruman',
    race: 'Maia (Istari)',
    realm: 'Isengard',
    accentColor: '#E2E8F0',
    accentSoft: '#2B2B33',
  },
  {
    id: 'aragorn',
    name: 'Aragorn',
    race: 'Man (Dunedain)',
    realm: 'Gondor & Arnor',
    accentColor: '#6E8FC9',
    accentSoft: '#11203B',
  },
  {
    id: 'gimli',
    name: 'Gimli',
    race: 'Dwarf',
    realm: 'Erebor',
    accentColor: '#D08B45',
    accentSoft: '#2D1B0C',
  },
  {
    id: 'sam',
    name: 'Samwise',
    race: 'Hobbit',
    realm: 'The Shire',
    accentColor: '#A3B565',
    accentSoft: '#20260F',
  },
  {
    id: 'frodo',
    name: 'Frodo',
    race: 'Hobbit',
    realm: 'The Shire',
    accentColor: '#E0B23C',
    accentSoft: '#2C2410',
  },
  {
    id: 'boromir',
    name: 'Boromir',
    race: 'Man',
    realm: 'Gondor',
    accentColor: '#C75146',
    accentSoft: '#2C100D',
  },
  {
    id: 'gollum',
    name: 'Gollum',
    race: 'Stoor Hobbit',
    realm: 'The Misty Mountains',
    accentColor: '#9ACD32',
    accentSoft: '#16210A',
  },
] as const satisfies readonly Character[];

export const CHARACTER_IDS = CHARACTERS.map((character) => character.id) as readonly CharacterId[];

const CHARACTER_BY_ID: Readonly<Record<CharacterId, Character>> = Object.fromEntries(
  CHARACTERS.map((character) => [character.id, character]),
) as Record<CharacterId, Character>;

export function isCharacterId(value: string): value is CharacterId {
  return Object.prototype.hasOwnProperty.call(CHARACTER_BY_ID, value);
}

export function getCharacter(id: CharacterId): Character {
  const character = CHARACTER_BY_ID[id];
  if (character === undefined) {
    throw new Error(`Unknown character id: ${id}`);
  }
  return character;
}
