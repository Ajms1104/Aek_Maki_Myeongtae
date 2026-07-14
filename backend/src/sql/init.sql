-- ?좎? ?뚯씠釉?
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  toss_user_key   TEXT UNIQUE NOT NULL,
  credits         INTEGER NOT NULL DEFAULT 1,
  has_hidden_pass BOOLEAN NOT NULL DEFAULT FALSE,
  last_attendance_at TIMESTAMPTZ,
  last_ad_watched_at TIMESTAMPTZ,
  current_attendance_streak INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS user_challenges (
  id             SERIAL PRIMARY KEY,
  user_id        INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  challenge_key  VARCHAR(50) NOT NULL,
  reward_credits INTEGER NOT NULL,
  rewarded_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, challenge_key)
);

-- 遺???뚯씠釉?
CREATE TABLE IF NOT EXISTS amulets (
  id                   SERIAL PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  description          TEXT,
  grade                VARCHAR(20) NOT NULL CHECK (grade IN ('common', 'rare', 'legend', 'hidden')),
  image_url            TEXT,
  silhouette_image_url TEXT,
  weight               INTEGER NOT NULL DEFAULT 100,
  draft_weight         INTEGER NOT NULL DEFAULT 100,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 湲곗〈 ?쒖빟 議곌굔??'hidden'???ы븿?섏? ?딆쓣 寃쎌슦瑜??鍮꾪빐 ?낅뜲?댄듃
ALTER TABLE amulets DROP CONSTRAINT IF EXISTS amulets_grade_check;
ALTER TABLE amulets ADD CONSTRAINT amulets_grade_check CHECK (grade IN ('common', 'rare', 'legend', 'hidden'));

-- ?좎? 遺???몃깽?좊━
CREATE TABLE IF NOT EXISTS user_amulets (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amulet_id         INTEGER NOT NULL REFERENCES amulets(id),
  count             INTEGER NOT NULL DEFAULT 1,
  first_acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, amulet_id)
);



-- 遺???ㅼ슫濡쒕뱶 ?대젰
CREATE TABLE IF NOT EXISTS amulet_downloads (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amulet_id     INTEGER NOT NULL REFERENCES amulets(id),
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ?뺣쪧 踰꾩쟾 愿由?
CREATE TABLE IF NOT EXISTS probability_configs (
  id         SERIAL PRIMARY KEY,
  version    INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ?뺣쪧 ?덉빟
CREATE TABLE IF NOT EXISTS amulet_probability_schedules (
  id           SERIAL PRIMARY KEY,
  version      INTEGER NOT NULL,
  weights      JSONB NOT NULL,
  effective_at TIMESTAMPTZ NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 怨좊? ?뚯씠釉?
CREATE TABLE IF NOT EXISTS consultations (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category   VARCHAR(50),
  content    TEXT NOT NULL,
  preview    VARCHAR(100) NOT NULL,
  reply      TEXT,
  status     VARCHAR(10) NOT NULL DEFAULT 'PENDING'
               CHECK (status IN ('PENDING', 'DONE', 'FAILED')),
  reaction   VARCHAR(10) DEFAULT 'NONE'
               CHECK (reaction IN ('LIKE', 'DISLIKE', 'NONE')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delete_at  TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX IF NOT EXISTS idx_consultations_user_id ON consultations(user_id);
CREATE INDEX IF NOT EXISTS idx_consultations_delete_at ON consultations(delete_at);

-- ?곷떞-遺???곌껐
CREATE TABLE IF NOT EXISTS consultation_amulets (
  consultation_id INTEGER NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  amulet_id       INTEGER NOT NULL REFERENCES amulets(id),
  PRIMARY KEY (consultation_id, amulet_id)
);

-- 怨듭??ы빆
CREATE TABLE IF NOT EXISTS announcements (
  announcement_id SERIAL PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  content         TEXT NOT NULL,
  is_urgent       BOOLEAN DEFAULT FALSE,
  start_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_at          TIMESTAMP,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 怨좉컼?쇳꽣 臾몄쓽
CREATE TABLE IF NOT EXISTS support (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  content       TEXT NOT NULL,
  reply_email   VARCHAR(255),
  reply_content TEXT,
  status        VARCHAR(50) DEFAULT 'PENDING',
  created       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 기존 데이터 삭제 및 id 1부터 다시 시작
DELETE FROM consultation_amulets;
DELETE FROM user_amulets;
DELETE FROM amulets;

-- 시퀀스 1부터 리셋
ALTER SEQUENCE amulets_id_seq RESTART WITH 1;
