-- 부적 테이블
CREATE TABLE IF NOT EXISTS amulets (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  description  TEXT,
  grade        VARCHAR(20) NOT NULL CHECK (grade IN ('COMMON', 'RARE', 'EPIC', 'LEGENDARY')),
  image_url    TEXT,
  weight       INTEGER NOT NULL DEFAULT 100,
  draft_weight INTEGER NOT NULL DEFAULT 100,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 유저 부적 인벤토리 테이블
CREATE TABLE IF NOT EXISTS user_amulets (
  user_id    VARCHAR(255) NOT NULL,
  amulet_id  INTEGER NOT NULL REFERENCES amulets(id),
  count      INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, amulet_id)
);

-- 확률 버전 관리 테이블
CREATE TABLE IF NOT EXISTS probability_configs (
  id         SERIAL PRIMARY KEY,
  version    INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 확률 예약 테이블
CREATE TABLE IF NOT EXISTS amulet_probability_schedules (
  id           SERIAL PRIMARY KEY,
  version      INTEGER NOT NULL,
  weights      JSONB NOT NULL,
  effective_at TIMESTAMPTZ NOT NULL,
  status       VARCHAR(20) NOT NULL DEFAULT 'PENDING',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 테스트용 부적 데이터 4개
INSERT INTO amulets (name, description, grade, weight, draft_weight) VALUES
  ('합격 명태',  '시험 합격을 도와주는 명태', 'COMMON',    100, 100),
  ('취업 명태',  '취업 성공을 도와주는 명태', 'RARE',       50,  50),
  ('연애 명태',  '좋은 인연을 불러오는 명태', 'EPIC',       20,  20),
  ('대박 명태',  '인생 대박을 터뜨려주는 명태', 'LEGENDARY',  5,   5);

-- 확률 버전 초기값
INSERT INTO probability_configs (version) VALUES (1);