CREATE TABLE portal_users (
  id uuid PRIMARY KEY,
  issuer text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (issuer, subject)
);
CREATE TABLE sessions (
  token_hash text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES portal_users(id) ON DELETE CASCADE,
  csrf_token text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  last_seen_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user ON sessions(user_id);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE login_transactions (
  token_hash text PRIMARY KEY,
  encrypted_payload text NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX login_expiry ON login_transactions(expires_at);
CREATE TABLE user_preferences (
  user_id uuid PRIMARY KEY REFERENCES portal_users(id) ON DELETE CASCADE,
  language text NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'fr', 'de')),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE audit_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES portal_users(id),
  event text NOT NULL,
  request_id text NOT NULL,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX audit_time ON audit_events(occurred_at);
CREATE TABLE rate_limits (
  key_hash text PRIMARY KEY,
  hits integer NOT NULL,
  expires_at timestamptz NOT NULL
);
CREATE INDEX rate_expiry ON rate_limits(expires_at);
