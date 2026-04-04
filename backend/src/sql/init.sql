-- 유저 테이블
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  toss_user_key BIGINT UNIQUE NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 유저 테이블에 탈퇴 관련 컬럼 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT FALSE;

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

-- 유저 부적 다운로드 이력 테이블 (중복 다운로드 방지)
CREATE TABLE IF NOT EXISTS amulet_downloads (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amulet_id   INTEGER NOT NULL REFERENCES amulets(id),
  downloaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
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

--공지사항 테이블 
create table announcements(announcement_id serial primary key,
title varchar(255) not null, content text not null, is_urgent boolean default false, start_at timestamp not null default current_timestamp,end_at timestamp,created_at timestamp default current_timestamp);

--고객센터문의 테이블
create table support(
id serial primary key,
user_id varchar(255) not null,
title varchar(255) not null,
content Text not null,
reply_email varchar(255),
reply_content text,
status varchar(50) default '답변대기',
created timestamp default current_timestamp,
updated_at timestamp default current_timestamp);

--고민관련 테이블
CREATE TABLE IF NOT EXISTS consultations (
  id          SERIAL PRIMARY KEY,
  user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category    VARCHAR(50),
  content     TEXT NOT NULL,
  preview     VARCHAR(100) NOT NULL,
  reply       TEXT,
  status      VARCHAR(10) NOT NULL DEFAULT 'PENDING'
                CHECK (status IN ('PENDING', 'DONE', 'FAILED')),
  reaction    VARCHAR(10) DEFAULT 'NONE'
                CHECK (reaction IN ('LIKE', 'DISLIKE', 'NONE')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delete_at   TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX idx_consultations_user_id ON consultations(user_id);
CREATE INDEX idx_consultations_delete_at ON consultations(delete_at);

-- 상담-부적 연결 테이블
CREATE TABLE IF NOT EXISTS consultation_amulets (
  consultation_id INTEGER NOT NULL REFERENCES consultations(id) ON DELETE CASCADE,
  amulet_id       INTEGER NOT NULL REFERENCES amulets(id),
  PRIMARY KEY (consultation_id, amulet_id)
);
