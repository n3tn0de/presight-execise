CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  avatar TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age BETWEEN 18 AND 100),
  nationality TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hobbies (
  value TEXT PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS user_hobbies (
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  hobby_value TEXT NOT NULL REFERENCES hobbies(value) ON DELETE CASCADE,
  PRIMARY KEY (user_id, hobby_value)
);

CREATE INDEX IF NOT EXISTS idx_users_first_name_trgm ON users USING GIN (first_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_last_name_trgm ON users USING GIN (last_name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_users_first_name ON users (first_name);
CREATE INDEX IF NOT EXISTS idx_users_last_name ON users (last_name);
CREATE INDEX IF NOT EXISTS idx_users_age ON users (age);
CREATE INDEX IF NOT EXISTS idx_users_nationality ON users (nationality);
CREATE INDEX IF NOT EXISTS idx_user_hobbies_hobby_value ON user_hobbies (hobby_value);
CREATE INDEX IF NOT EXISTS idx_user_hobbies_user_id ON user_hobbies (user_id);
