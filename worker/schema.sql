CREATE TABLE IF NOT EXISTS gifts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  giver_id TEXT NOT NULL, giver_name TEXT NOT NULL,
  item_id INTEGER, item_name TEXT NOT NULL, item_icon TEXT, item_level INTEGER, slot TEXT, armor TEXT, quality TEXT, req_level INTEGER,
  classes TEXT,                       -- JSON array of class names that can use it, or NULL = anyone
  channel_id TEXT, message_id TEXT, token TEXT,
  created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open | awarded | expired | received | voided
  winner_id TEXT, winner_name TEXT, awarded_at INTEGER, received_at INTEGER,
  nudged_at INTEGER                    -- when the winner was reminded to press Received
);
CREATE TABLE IF NOT EXISTS claims (
  gift_id INTEGER NOT NULL, user_id TEXT NOT NULL, user_name TEXT NOT NULL,
  kind TEXT NOT NULL,                  -- need | greed
  at INTEGER NOT NULL,
  PRIMARY KEY (gift_id, user_id)
);
CREATE TABLE IF NOT EXISTS chars (    -- /iam mapping, C2
  user_id TEXT PRIMARY KEY, name TEXT NOT NULL, surname TEXT, class TEXT, updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS requests (  -- /need craft requests, W1
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL, user_name TEXT NOT NULL,
  recipe_id INTEGER, recipe_name TEXT NOT NULL, profession TEXT, icon TEXT,
  mats TEXT,                           -- JSON [{name, qty}]
  crafters TEXT,                       -- JSON [{key, name, skill, last, user}]
  channel_id TEXT, message_id TEXT, token TEXT,
  status TEXT NOT NULL DEFAULT 'open', -- open | claimed | done | cancelled
  maker_id TEXT, maker_name TEXT,
  created_at INTEGER NOT NULL, updated_at INTEGER
);
CREATE TABLE IF NOT EXISTS stock (   -- /stock-set: spare mats people will hand over
  user_id TEXT NOT NULL, user_name TEXT NOT NULL, item_id INTEGER NOT NULL, item_name TEXT NOT NULL, qty INTEGER NOT NULL, updated_at INTEGER,
  PRIMARY KEY (user_id, item_id)
);
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT); -- last weekly report, etc.
CREATE INDEX IF NOT EXISTS gifts_open ON gifts(status, expires_at);
