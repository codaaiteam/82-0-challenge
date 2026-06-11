-- 82-0 global leaderboard
CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  wins INTEGER NOT NULL,         -- 0–82
  losses INTEGER NOT NULL,       -- 82 - wins
  points REAL NOT NULL,          -- team rating 0–100
  grade TEXT NOT NULL,           -- S+ | S | A | B | C | D
  mode TEXT NOT NULL,            -- classic | hoopiq | daily
  style TEXT,                    -- balanced | smallball | twintowers | rungun
  star TEXT,                     -- best player name
  day TEXT NOT NULL,             -- YYYY-MM-DD (UTC) bucket for the daily board
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scores_day ON scores (day, wins DESC, points DESC);
CREATE INDEX IF NOT EXISTS idx_scores_all ON scores (wins DESC, points DESC);
CREATE INDEX IF NOT EXISTS idx_scores_ip ON scores (ip_hash, created_at);
