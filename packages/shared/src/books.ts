import type { BookId } from './types.js';

export interface Book {
  id: BookId;
  title: string;
  year: number;
  order: number;
}

export const BOOKS = [
  // — Isınma sıralaması / core legendarium —
  { id: 'the-hobbit', title: 'The Hobbit', year: 1937, order: 1 },
  {
    id: 'the-fellowship-of-the-ring',
    title: 'The Fellowship of the Ring',
    year: 1954,
    order: 2,
  },
  { id: 'the-two-towers', title: 'The Two Towers', year: 1954, order: 3 },
  {
    id: 'the-return-of-the-king',
    title: 'The Return of the King',
    year: 1955,
    order: 4,
  },
  { id: 'the-silmarillion', title: 'The Silmarillion', year: 1977, order: 5 },
  {
    id: 'the-children-of-hurin',
    title: 'The Children of Húrin',
    year: 2007,
    order: 6,
  },
  { id: 'beren-and-luthien', title: 'Beren and Lúthien', year: 2017, order: 7 },
  {
    id: 'the-fall-of-gondolin',
    title: 'The Fall of Gondolin',
    year: 2018,
    order: 8,
  },
  { id: 'unfinished-tales', title: 'Unfinished Tales', year: 1980, order: 9 },
  {
    id: 'the-nature-of-middle-earth',
    title: 'The Nature of Middle-earth',
    year: 2021,
    order: 10,
  },
  // — Diğer Orta Dünya kitapları —
  {
    id: 'the-adventures-of-tom-bombadil',
    title: 'The Adventures of Tom Bombadil',
    year: 1962,
    order: 11,
  },
  {
    id: 'the-atlas-of-middle-earth',
    title: 'The Atlas of Middle-earth',
    year: 1981,
    order: 12,
  },
  {
    id: 'the-history-of-middle-earth',
    title: 'The History of Middle-earth',
    year: 1996,
    order: 13,
  },
  {
    id: 'the-letters-of-jrr-tolkien',
    title: 'The Letters of J.R.R. Tolkien',
    year: 1981,
    order: 14,
  },
  { id: 'roverandom', title: 'Roverandom', year: 1998, order: 15 },
  {
    id: 'the-story-of-kullervo',
    title: 'The Story of Kullervo',
    year: 2015,
    order: 16,
  },
  {
    id: 'the-legend-of-sigurd-and-gudrun',
    title: 'The Legend of Sigurd and Gudrún',
    year: 2009,
    order: 17,
  },
  {
    id: 'tales-from-the-perilous-realm',
    title: 'Tales from the Perilous Realm',
    year: 2008,
    order: 18,
  },
  {
    id: 'letters-from-father-christmas',
    title: 'Letters from Father Christmas',
    year: 1976,
    order: 19,
  },
  {
    id: 'beowulf',
    title: 'Beowulf: A Translation and Commentary',
    year: 2014,
    order: 20,
  },
] as const satisfies readonly Book[];

export const BOOK_IDS = BOOKS.map((book) => book.id) as readonly BookId[];

export const TOTAL_BOOKS: number = BOOKS.length;

const BOOK_BY_ID: Readonly<Record<BookId, Book>> = Object.fromEntries(
  BOOKS.map((book) => [book.id, book]),
) as Record<BookId, Book>;

export function isBookId(value: string): value is BookId {
  return Object.prototype.hasOwnProperty.call(BOOK_BY_ID, value);
}

export function getBook(id: BookId): Book {
  const book = BOOK_BY_ID[id];
  if (book === undefined) {
    throw new Error(`Unknown book id: ${id}`);
  }
  return book;
}
