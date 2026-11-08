CREATE TABLE IF NOT EXISTS gifts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  giver_id TEXT NOT NULL, giver_name TEXT NOT NULL,
  item_id INTEGER, item_name TEXT NOT NULL, item_icon TEXT, item_level INTEGER, slot TEXT, armor TEXT, quality TEXT, req_level INTEGER,
  classes TEXT,                       -- JSON array of class names that can use it, or NULL = anyone
  channel_id TEXT, message_id TEXT, token TEXT,
  created_at INTEGER NOT NULL, expires_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'open', -- open | awarded | expired | received | voided
  winner_id TEXT, winner_name TEXT, awarded_at INTEGER, received_at INTEGER
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
CREATE INDEX IF NOT EXISTS gifts_open ON gifts(status, expires_at);
