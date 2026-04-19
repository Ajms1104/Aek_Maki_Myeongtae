-- 유저 테이블
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  toss_user_key BIGINT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at    TIMESTAMPTZ,
  is_deleted    BOOLEAN NOT NULL DEFAULT FALSE
);

-- 부적 테이블 (grade는 프론트 기준)
CREATE TABLE IF NOT EXISTS amulets (
  id                   SERIAL PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  description          TEXT,
  grade                VARCHAR(20) NOT NULL CHECK (grade IN ('common', 'rare', 'hero', 'legend', 'hidden')),
  image_url            TEXT,
  silhouette_image_url TEXT,
  weight               INTEGER NOT NULL DEFAULT 100,
  draft_weight         INTEGER NOT NULL DEFAULT 100,
  is_active            BOOLEAN NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 유저 부적 인벤토리 테이블
CREATE TABLE IF NOT EXISTS user_amulets (
  user_id           VARCHAR(255) NOT NULL,
  amulet_id         INTEGER NOT NULL REFERENCES amulets(id),
  count             INTEGER NOT NULL DEFAULT 1,
  first_acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, amulet_id)
);

-- 부적 다운로드 이력
CREATE TABLE IF NOT EXISTS amulet_downloads (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amulet_id     INTEGER NOT NULL REFERENCES amulets(id),
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 확률 버전 관리
CREATE TABLE IF NOT EXISTS probability_configs (
  id         SERIAL PRIMARY KEY,
  version    INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 확률 예약
CREATE TABLE IF NOT EXISTS amulet_probability_schedules (
  id           SERIAL PRIMARY KEY,
  version      INTEGER NOT NULL,
  weights      JSONB NOT NULL,
  effective_at TIMESTAMPTZ NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 고민 테이블
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

-- 상담-부적 연결
CREATE TABLE IF NOT EXISTS consultation_amulets (
  consultation_id INTEGER NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  amulet_id       INTEGER NOT NULL REFERENCES amulets(id),
  PRIMARY KEY (consultation_id, amulet_id)
);

-- 공지사항
CREATE TABLE IF NOT EXISTS announcements (
  announcement_id SERIAL PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  content         TEXT NOT NULL,
  is_urgent       BOOLEAN DEFAULT FALSE,
  start_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  end_at          TIMESTAMP,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 고객센터 문의
CREATE TABLE IF NOT EXISTS support (
  id            SERIAL PRIMARY KEY,
  user_id       VARCHAR(255) NOT NULL,
  title         VARCHAR(255) NOT NULL,
  content       TEXT NOT NULL,
  reply_email   VARCHAR(255),
  reply_content TEXT,
  status        VARCHAR(50) DEFAULT '답변대기',
  created       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 부적 데이터 
INSERT INTO amulets (id, name, description, grade, image_url, weight, draft_weight) VALUES
  (1,  '전설 명태 1',   '전설의 명태',      'legend', '/talisman_sun.png', 5,   5),
  (2,  '전설 명태 2',   '전설의 명태',      'legend', '/talisman_sun.png', 5,   5),
  (3,  '영웅 명태 1',   '영웅의 명태',      'hero',   '/talisman_sun.png', 20,  20),
  (4,  '영웅 명태 2',   '영웅의 명태',      'hero',   '/talisman_sun.png', 20,  20),
  (5,  '영웅 명태 3',   '영웅의 명태',      'hero',   '/talisman_sun.png', 20,  20),
  (6,  '영웅 명태 4',   '영웅의 명태',      'hero',   '/talisman_sun.png', 20,  20),
  (7,  '영웅 명태 5',   '영웅의 명태',      'hero',   '/talisman_sun.png', 20,  20),
  (8,  '개발자 명태',   '개발자의 명태',    'rare',   '/talisman_sun.png', 50,  50),
  (9,  '의사 명태',     '의사의 명태',      'rare',   '/talisman_sun.png', 50,  50),
  (10, '군인 명태',     '군인의 명태',      'rare',   '/talisman_sun.png', 50,  50),
  (11, '연구원 명태',   '연구원의 명태',    'rare',   '/talisman_sun.png', 50,  50),
  (12, '디자이너 명태', '디자이너의 명태',  'rare',   '/talisman_sun.png', 50,  50),
  (17, '일반 명태 1',   '일반 명태',        'common', '/talisman_sun.png', 100, 100),
  (34, '히든 명태 1',   '히든 명태',        'hidden', '/talisman_sun.png', 1,   1),
  (35, '히든 명태 2',   '히든 명태',        'hidden', '/talisman_sun.png', 1,   1),
  (36, '히든 명태 3',   '히든 명태',        'hidden', '/talisman_sun.png', 1,   1);

SELECT setval('amulets_id_seq', 36);

-- 확률 버전 초기값
INSERT INTO probability_configs (version) VALUES (1);