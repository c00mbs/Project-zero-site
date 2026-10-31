CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  status TEXT NOT NULL CHECK(status IN ('pending','confirmed','unsubscribed')),
  confirm_token_hash TEXT,
  confirm_expires INTEGER,
  unsubscribe_token_hash TEXT,
  consent_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_confirm_token ON subscribers(confirm_token_hash);
CREATE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token ON subscribers(unsubscribe_token_hash);
CREATE TABLE IF NOT EXISTS signup_attempts (id INTEGER PRIMARY KEY AUTOINCREMENT, ip_hash TEXT NOT NULL, created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS idx_signup_attempts_ip_time ON signup_attempts(ip_hash, created_at);