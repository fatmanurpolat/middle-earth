-- ─────────────────────────────────────────────────────────────────────────────
-- MiddleEarth-Klip — initial schema
-- Auto-applied by Postgres on first boot via /docker-entrypoint-initdb.d.
-- Idempotent: safe to re-run by hand.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Users: one account per fan. Identified by a unique username + bcrypt
-- password hash; carries the chosen character and an optional display name.
CREATE TABLE IF NOT EXISTS users (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username         text NOT NULL,
  password_hash    text NOT NULL,
  custom_name      text NULL,
  chosen_character text NOT NULL CHECK (
    chosen_character IN (
      'gandalf',
      'legolas',
      'saruman',
      'aragorn',
      'gimli',
      'sam',
      'frodo',
      'boromir',
      'gollum'
    )
  ),
  created_at       timestamptz NOT NULL DEFAULT now()
);

-- Usernames are unique case-insensitively ("Frodo" == "frodo").
CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx
  ON users (lower(username));

-- Book progress: which of the six catalogue books a user has read.
-- One row per (user, book); the API always merges this over the full catalogue.
CREATE TABLE IF NOT EXISTS book_progress (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  book_id    text NOT NULL,
  is_read    boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, book_id)
);

-- Sessions: a hashed JWT per active login, so sessions can be revoked.
CREATE TABLE IF NOT EXISTS sessions (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_book_progress_user_id ON book_progress (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions (user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions (token_hash);
