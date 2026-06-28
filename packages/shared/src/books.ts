import type { BookId } from './types.js';

export interface Book {
  id: BookId;
  title: string;
  year: number;
  order: number;
}

export const BOOKS = [
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
  { id: 'unfinished-tales', title: 'Unfinished Tales', year: 1980, order: 6 },
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
