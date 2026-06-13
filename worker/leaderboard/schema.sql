-- 82-0 global leaderboard
CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  wins INTEGER NOT NULL,         -- 0–82
  losses INTEGER NOT NULL,       -- 82 - wins
  points REAL NOT NULL,          -- team rating 0–100
  grade TEXT NOT NULL,           -- S+ | S | A | B | C | D
  mode TEXT NOT NULL,            -- standard | daily | classic | hoopiq | cap | nomvps | franchise | decade | hard
  style TEXT,                    -- balanced | smallball | twintowers | rungun
  star TEXT,                     -- best player name
  day TEXT NOT NULL,             -- YYYY-MM-DD (UTC) bucket for the daily board
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_scores_day ON scores (day, points DESC, wins DESC);
CREATE INDEX IF NOT EXISTS idx_scores_all ON scores (points DESC, wins DESC);
CREATE INDEX IF NOT EXISTS idx_scores_ip ON scores (ip_hash, created_at);

-- Shared results: one row per "Share" click, fetched by the /share/<id> page.
CREATE TABLE IF NOT EXISTS shares (
  id TEXT PRIMARY KEY,
  payload TEXT NOT NULL,         -- JSON: { wins, losses, points, grade, mode, style, lineup: [{pos,name,team,decade}] }
  day TEXT NOT NULL,             -- YYYY-MM-DD (UTC)
  ip_hash TEXT NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shares_ip ON shares (ip_hash, created_at);
