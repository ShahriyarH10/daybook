-- Run this once in your Neon SQL editor (or via psql) to set up the database.

CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  category    TEXT NOT NULL DEFAULT 'other',
  priority    TEXT NOT NULL DEFAULT 'medium',
  due         DATE,
  notes       TEXT DEFAULT '',
  done        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks (due);

-- Journal entries (one per day, upserted by date)
CREATE TABLE IF NOT EXISTS journal_entries (
  id          TEXT PRIMARY KEY,
  date        DATE NOT NULL UNIQUE,  -- one entry per calendar day
  content     TEXT DEFAULT '',
  created_at  BIGINT NOT NULL,
  updated_at  BIGINT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_journal_date ON journal_entries (date DESC);
