import { z } from 'zod';
import { isBookId, isCharacterId } from '@middleearth/shared';

/**
 * Zod request schemas for the HTTP layer. Character/book ids are validated via
 * the shared type guards so the API and the shared catalog never drift.
 */

const characterIdSchema = z
  .string()
  .refine(isCharacterId, { message: 'Invalid character id' });

const bookIdSchema = z
  .string()
  .refine(isBookId, { message: 'Invalid book id' });

const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(/^[a-zA-Z0-9_.-]+$/, 'Username may use letters, numbers, . _ -');

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must be at most 100 characters');

/** POST /api/auth/register body. */
export const registerBodySchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
  chosenCharacter: characterIdSchema,
  customName: z.string().nullish().transform((v) => v ?? null),
});

/** POST /api/auth/login body. */
export const loginBodySchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

/** PATCH /api/me body. */
export const updateProfileBodySchema = z.object({
  customName: z.string().nullable(),
});

/** PATCH /api/me/password body. */
export const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});

/** DELETE /api/me body. */
export const deleteAccountBodySchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
});

/** PUT /api/books/:bookId/progress body. */
export const updateProgressBodySchema = z.object({
  isRead: z.boolean(),
});

/** Route params for /api/books/:bookId/progress. */
export const bookIdParamSchema = z.object({
  bookId: bookIdSchema,
});

export type RegisterBody = z.infer<typeof registerBodySchema>;
export type LoginBody = z.infer<typeof loginBodySchema>;
export type UpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
export type ChangePasswordBody = z.infer<typeof changePasswordBodySchema>;
export type DeleteAccountBody = z.infer<typeof deleteAccountBodySchema>;
export type UpdateProgressBody = z.infer<typeof updateProgressBodySchema>;
export type BookIdParam = z.infer<typeof bookIdParamSchema>;
