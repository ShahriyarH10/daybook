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

-- Helpful index for sorting by due date
CREATE INDEX IF NOT EXISTS idx_tasks_due ON tasks (due);
