-- Gameverse Database Schema
-- Matches the Row types in src/server/types.ts exactly

-- ─────────────────────────────────────────────────
-- 1. articles
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS articles (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  slug            TEXT    NOT NULL UNIQUE,
  title           TEXT    NOT NULL,
  excerpt         TEXT    NOT NULL,
  body            TEXT    NOT NULL DEFAULT '[]',   -- JSON string[]
  source          TEXT    NOT NULL,
  category        TEXT    NOT NULL,
  author          TEXT    NOT NULL DEFAULT '',
  published_at    TEXT    NOT NULL,
  cover           TEXT    NOT NULL DEFAULT '',
  related_game_slug TEXT  DEFAULT NULL,
  featured        INTEGER NOT NULL DEFAULT 0,
  reads           INTEGER NOT NULL DEFAULT 0,
  external_url    TEXT    UNIQUE,
  fetched_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_articles_slug         ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_source        ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_category      ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_at  ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_featured      ON articles(featured) WHERE featured = 1;
CREATE INDEX IF NOT EXISTS idx_articles_related_game  ON articles(related_game_slug) WHERE related_game_slug IS NOT NULL;

-- ─────────────────────────────────────────────────
-- 2. games
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS games (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  slug              TEXT    NOT NULL UNIQUE,
  title             TEXT    NOT NULL,
  developer         TEXT    NOT NULL DEFAULT '',
  publisher         TEXT    NOT NULL DEFAULT '',
  release_year      INTEGER NOT NULL DEFAULT 0,
  rating            INTEGER NOT NULL DEFAULT 0,
  user_score        REAL    NOT NULL DEFAULT 0.0,
  genres            TEXT    NOT NULL DEFAULT '[]',   -- JSON Genre[]
  platforms         TEXT    NOT NULL DEFAULT '[]',   -- JSON Platform[]
  cover             TEXT    NOT NULL DEFAULT '',
  hero              TEXT    NOT NULL DEFAULT '',
  screenshots       TEXT    NOT NULL DEFAULT '[]',   -- JSON string[]
  short_description TEXT    NOT NULL DEFAULT '',
  description       TEXT    NOT NULL DEFAULT '',
  trending          INTEGER NOT NULL DEFAULT 0,
  featured          INTEGER NOT NULL DEFAULT 0,
  external_id       INTEGER UNIQUE,
  fetched_at        TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at        TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_games_slug         ON games(slug);
CREATE INDEX IF NOT EXISTS idx_games_release_year ON games(release_year DESC);
CREATE INDEX IF NOT EXISTS idx_games_rating       ON games(rating DESC);
CREATE INDEX IF NOT EXISTS idx_games_trending     ON games(trending) WHERE trending = 1;
CREATE INDEX IF NOT EXISTS idx_games_featured     ON games(featured) WHERE featured = 1;

-- ─────────────────────────────────────────────────
-- 3. esports_teams
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS esports_teams (
  id          TEXT    PRIMARY KEY,
  name        TEXT    NOT NULL,
  tag         TEXT    NOT NULL DEFAULT '',
  region      TEXT    NOT NULL DEFAULT '',
  game        TEXT    NOT NULL,
  logo_color  TEXT    NOT NULL DEFAULT '#888888',
  logo_url    TEXT    DEFAULT NULL,
  wins        INTEGER NOT NULL DEFAULT 0,
  losses      INTEGER NOT NULL DEFAULT 0,
  points      INTEGER NOT NULL DEFAULT 0,
  form_streak TEXT    NOT NULL DEFAULT '[]',   -- JSON ("W"|"L")[]
  external_id INTEGER UNIQUE,
  fetched_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_teams_game   ON esports_teams(game);
CREATE INDEX IF NOT EXISTS idx_teams_points ON esports_teams(points DESC);

-- ─────────────────────────────────────────────────
-- 4. esports_players
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS esports_players (
  id          TEXT    PRIMARY KEY,
  handle      TEXT    NOT NULL,
  real_name   TEXT    NOT NULL DEFAULT '',
  team_id     TEXT    NOT NULL REFERENCES esports_teams(id),
  game        TEXT    NOT NULL,
  role        TEXT    NOT NULL DEFAULT 'Player',
  rating      REAL    NOT NULL DEFAULT 1.00,
  kda         REAL    NOT NULL DEFAULT 0.00,
  signature   TEXT    NOT NULL DEFAULT '',
  external_id INTEGER UNIQUE,
  fetched_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_players_team_id ON esports_players(team_id);
CREATE INDEX IF NOT EXISTS idx_players_game    ON esports_players(game);
CREATE INDEX IF NOT EXISTS idx_players_rating  ON esports_players(rating DESC);

-- ─────────────────────────────────────────────────
-- 5. esports_matches
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS esports_matches (
  id              TEXT    PRIMARY KEY,
  game            TEXT    NOT NULL,
  tournament      TEXT    NOT NULL DEFAULT '',
  status          TEXT    NOT NULL DEFAULT 'upcoming',
  starts_at       TEXT    NOT NULL,
  team_a_id       TEXT    NOT NULL REFERENCES esports_teams(id),
  team_b_id       TEXT    NOT NULL REFERENCES esports_teams(id),
  score_a         INTEGER NOT NULL DEFAULT 0,
  score_b         INTEGER NOT NULL DEFAULT 0,
  format          TEXT    NOT NULL DEFAULT 'BO3',
  current_map     TEXT    DEFAULT NULL,
  viewers         INTEGER DEFAULT NULL,
  winner_team_id  TEXT    DEFAULT NULL REFERENCES esports_teams(id),
  external_id     INTEGER UNIQUE,
  fetched_at      TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_matches_game      ON esports_matches(game);
CREATE INDEX IF NOT EXISTS idx_matches_status    ON esports_matches(status);
CREATE INDEX IF NOT EXISTS idx_matches_starts_at ON esports_matches(starts_at DESC);
CREATE INDEX IF NOT EXISTS idx_matches_tournament ON esports_matches(tournament);

-- ─────────────────────────────────────────────────
-- 6. esports_standings
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS esports_standings (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  game        TEXT    NOT NULL,
  league_id   TEXT    NOT NULL,
  season      TEXT    NOT NULL,
  team_id     TEXT    NOT NULL REFERENCES esports_teams(id),
  wins        INTEGER NOT NULL DEFAULT 0,
  losses      INTEGER NOT NULL DEFAULT 0,
  points      INTEGER NOT NULL DEFAULT 0,
  rank        INTEGER NOT NULL DEFAULT 0,
  as_of_date  TEXT    NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now')),
  UNIQUE(game, league_id, season, team_id)
);

CREATE INDEX IF NOT EXISTS idx_standings_game ON esports_standings(game);
CREATE INDEX IF NOT EXISTS idx_standings_rank ON esports_standings(rank);

-- ─────────────────────────────────────────────────
-- 7. sync_state
-- ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sync_state (
  key             TEXT PRIMARY KEY,
  last_success_at TEXT DEFAULT NULL,
  last_error      TEXT DEFAULT NULL,
  cursor          TEXT DEFAULT NULL,
  request_count   INTEGER NOT NULL DEFAULT 0,
  notes           TEXT DEFAULT NULL
);

-- Seed sync_state with initial keys
INSERT OR IGNORE INTO sync_state (key) VALUES ('news_rss');
INSERT OR IGNORE INTO sync_state (key) VALUES ('rawg_games');
INSERT OR IGNORE INTO sync_state (key) VALUES ('pandascore_matches');
INSERT OR IGNORE INTO sync_state (key) VALUES ('pandascore_standings');
