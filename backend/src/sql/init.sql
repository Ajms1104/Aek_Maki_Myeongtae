-- 유저 테이블
CREATE TABLE IF NOT EXISTS users (
  id              SERIAL PRIMARY KEY,
  toss_user_key   BIGINT UNIQUE NOT NULL,
  credits         INTEGER NOT NULL DEFAULT 0,
  has_hidden_pass BOOLEAN NOT NULL DEFAULT FALSE,
  last_attendance_at TIMESTAMPTZ,
  last_ad_watched_at TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at      TIMESTAMPTZ,
  is_deleted      BOOLEAN NOT NULL DEFAULT FALSE
);

-- 부적 테이블
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

-- 기존 제약 조건이 'hidden'을 포함하지 않을 경우를 대비해 업데이트
ALTER TABLE amulets DROP CONSTRAINT IF EXISTS amulets_grade_check;
ALTER TABLE amulets ADD CONSTRAINT amulets_grade_check CHECK (grade IN ('common', 'rare', 'legend', 'hidden'));

-- 유저 부적 인벤토리
CREATE TABLE IF NOT EXISTS user_amulets (
  id                SERIAL PRIMARY KEY,
  user_id           INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amulet_id         INTEGER NOT NULL REFERENCES amulets(id),
  count             INTEGER NOT NULL DEFAULT 1,
  first_acquired_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, amulet_id)
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
  user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title         VARCHAR(255) NOT NULL,
  content       TEXT NOT NULL,
  reply_email   VARCHAR(255),
  reply_content TEXT,
  status        VARCHAR(50) DEFAULT '답변대기',
  created       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 기존 데이터 삭제 후 id 1부터 다시 시작
DELETE FROM consultation_amulets;
DELETE FROM user_amulets;
DELETE FROM amulets;

-- 시퀀스 1부터 리셋
ALTER SEQUENCE amulets_id_seq RESTART WITH 1;

-- common 등급 (weight: 100)
INSERT INTO amulets (name, grade, image_url, weight, draft_weight) VALUES
  ('윙크 명태',       'common', '/uploads/common/common_amulet_01.png', 100, 100),
  ('깜짝 명태',       'common', '/uploads/common/common_amulet_02.png', 100, 100),
  ('겁먹은 명태',     'common', '/uploads/common/common_amulet_03.png', 100, 100),
  ('화난 명태',       'common', '/uploads/common/common_amulet_04.png', 100, 100),
  ('반짝이는 명태',   'common', '/uploads/common/common_amulet_05.png', 100, 100),
  ('슬픈 명태',       'common', '/uploads/common/common_amulet_06.png', 100, 100),
  ('메롱 명태',       'common', '/uploads/common/common_amulet_07.png', 100, 100),
  ('기본 명태',       'common', '/uploads/common/common_amulet_08.png', 100, 100),
  ('잠자는 명태',     'common', '/uploads/common/common_amulet_09.png', 100, 100),
  ('사악한 명태',     'common', '/uploads/common/common_amulet_10.png', 100, 100),
  ('짝사랑 명태',     'common', '/uploads/common/common_amulet_11.png', 100, 100),
  ('뽀뽀 명태',       'common', '/uploads/common/common_amulet_12.png', 100, 100),
  ('승리자 명태',     'common', '/uploads/common/common_amulet_13.png', 100, 100),
  ('초롱초롱 명태',   'common', '/uploads/common/common_amulet_14.png', 100, 100),
  ('익살 명태',       'common', '/uploads/common/common_amulet_15.png', 100, 100),
  ('노곤 명태',       'common', '/uploads/common/common_amulet_16.png', 100, 100),
  ('배부른 명태',     'common', '/uploads/common/common_amulet_17.png', 100, 100),
  ('감탄 명태',       'common', '/uploads/common/common_amulet_18.png', 100, 100),
  ('반장대소 명태',   'common', '/uploads/common/common_amulet_19.png', 100, 100),
  ('식은땀 명태',     'common', '/uploads/common/common_amulet_20.png', 100, 100),
  ('명상 명태',       'common', '/uploads/common/common_amulet_21.png', 100, 100),
  ('부끄 명태',       'common', '/uploads/common/common_amulet_22.png', 100, 100),
  ('열정 명태',       'common', '/uploads/common/common_amulet_23.png', 100, 100),
  ('비웃는 명태',     'common', '/uploads/common/common_amulet_24.png', 100, 100),
  ('의욕제로 명태',   'common', '/uploads/common/common_amulet_25.png', 100, 100),
  ('흥얼 명태',       'common', '/uploads/common/common_amulet_26.png', 100, 100),
  ('도파민 명태',     'common', '/uploads/common/common_amulet_27.png', 100, 100),
  ('의심 명태',       'common', '/uploads/common/common_amulet_28.png', 100, 100),
  ('발랄 명태',       'common', '/uploads/common/common_amulet_29.png', 100, 100),
  ('밤샌 명태',       'common', '/uploads/common/common_amulet_30.png', 100, 100),
  ('피곤 명태',       'common', '/uploads/common/common_amulet_31.png', 100, 100);

-- rare 등급 (weight: 40)
INSERT INTO amulets (name, grade, image_url, weight, draft_weight) VALUES
  ('천문학자 명태',       'rare', '/uploads/rare/rare_amulet_01.png', 40, 40),
  ('패션디자이너 명태',   'rare', '/uploads/rare/rare_amulet_02.png', 40, 40),
  ('건축가 명태',         'rare', '/uploads/rare/rare_amulet_03.png', 40, 40),
  ('보석감정사 명태',     'rare', '/uploads/rare/rare_amulet_04.png', 40, 40),
  ('엔지니어 명태',       'rare', '/uploads/rare/rare_amulet_05.png', 40, 40),
  ('해양학자 명태',       'rare', '/uploads/rare/rare_amulet_06.png', 40, 40),
  ('기상학자 명태',       'rare', '/uploads/rare/rare_amulet_07.png', 40, 40),
  ('고고학자 명태',       'rare', '/uploads/rare/rare_amulet_08.png', 40, 40),
  ('플로리스트 명태',     'rare', '/uploads/rare/rare_amulet_09.png', 40, 40),
  ('스쿠버다이버 명태',   'rare', '/uploads/rare/rare_amulet_10.png', 40, 40),
  ('연주가 명태',         'rare', '/uploads/rare/rare_amulet_11.png', 40, 40),
  ('공원관리자 명태',     'rare', '/uploads/rare/rare_amulet_12.png', 40, 40),
  ('정비사 명태',         'rare', '/uploads/rare/rare_amulet_13.png', 40, 40),
  ('파티시에 명태',       'rare', '/uploads/rare/rare_amulet_14.png', 40, 40),
  ('안전관리자 명태',     'rare', '/uploads/rare/rare_amulet_15.png', 40, 40),
  ('우주비행사 명태',     'rare', '/uploads/rare/rare_amulet_16.png', 40, 40),
  ('교사 명태',           'rare', '/uploads/rare/rare_amulet_17.png', 40, 40),
  ('재즈음악가 명태',     'rare', '/uploads/rare/rare_amulet_18.png', 40, 40),
  ('영화감독 명태',       'rare', '/uploads/rare/rare_amulet_19.png', 40, 40),
  ('수의사 명태',         'rare', '/uploads/rare/rare_amulet_20.png', 40, 40),
  ('승무원 명태',         'rare', '/uploads/rare/rare_amulet_21.png', 40, 40),
  ('집배원 명태',         'rare', '/uploads/rare/rare_amulet_22.png', 40, 40),
  ('정원사 명태',         'rare', '/uploads/rare/rare_amulet_23.png', 40, 40),
  ('해커 명태',           'rare', '/uploads/rare/rare_amulet_24.png', 40, 40),
  ('의사 명태',           'rare', '/uploads/rare/rare_amulet_25.png', 40, 40),
  ('소방관 명태',         'rare', '/uploads/rare/rare_amulet_26.png', 40, 40),
  ('경찰관 명태',         'rare', '/uploads/rare/rare_amulet_27.png', 40, 40),
  ('판사 명태',           'rare', '/uploads/rare/rare_amulet_28.png', 40, 40),
  ('설계사 명태',         'rare', '/uploads/rare/rare_amulet_29.png', 40, 40),
  ('헤어디자이너 명태',   'rare', '/uploads/rare/rare_amulet_30.png', 40, 40),
  ('메이크업아티스트 명태','rare', '/uploads/rare/rare_amulet_31.png', 40, 40),
  ('네일아티스트 명태',   'rare', '/uploads/rare/rare_amulet_32.png', 40, 40),
  ('회계사 명태',         'rare', '/uploads/rare/rare_amulet_33.png', 40, 40),
  ('조향사 명태',         'rare', '/uploads/rare/rare_amulet_34.png', 40, 40),
  ('재판사 명태',         'rare', '/uploads/rare/rare_amulet_35.png', 40, 40),
  ('개발자 명태',         'rare', '/uploads/rare/rare_amulet_36.png', 40, 40),
  ('사서 명태',           'rare', '/uploads/rare/rare_amulet_37.png', 40, 40);

-- legend 등급 (weight: 10)
INSERT INTO amulets (name, grade, image_url, weight, draft_weight) VALUES
  ('태양 명태',   'legend', '/uploads/legend/legend_amulet_01.png', 10, 10),
  ('무지개 명태', 'legend', '/uploads/legend/legend_amulet_02.png', 10, 10),
  ('황금 명태',   'legend', '/uploads/legend/legend_amulet_03.png', 10, 10),
  ('구름 명태',   'legend', '/uploads/legend/legend_amulet_04.png', 10, 10),
  ('번개 명태',   'legend', '/uploads/legend/legend_amulet_05.png', 10, 10),
  ('수호신 명태', 'legend', '/uploads/legend/legend_amulet_06.png', 10, 10),
  ('얼음 명태',   'legend', '/uploads/legend/legend_amulet_07.png', 10, 10),
  ('불꽃 명태',   'legend', '/uploads/legend/legend_amulet_08.png', 10, 10),
  ('밤 명태',     'legend', '/uploads/legend/legend_amulet_09.png', 10, 10),
  ('보석 명태',   'legend', '/uploads/legend/legend_amulet_10.png', 10, 10),
  ('사탕 명태',   'legend', '/uploads/legend/legend_amulet_11.png', 10, 10),
  ('모래 명태',   'legend', '/uploads/legend/legend_amulet_12.png', 10, 10),
  ('바람 명태',   'legend', '/uploads/legend/legend_amulet_13.png', 10, 10),
  ('어둠 명태',   'legend', '/uploads/legend/legend_amulet_14.png', 10, 10),
  ('화산 명태',   'legend', '/uploads/legend/legend_amulet_15.png', 10, 10),
  ('숲 명태',     'legend', '/uploads/legend/legend_amulet_16.png', 10, 10);

-- hidden 등급 (weight: 0, 결제로만 획득)
INSERT INTO amulets (name, grade, image_url, weight, draft_weight) VALUES
  ('개발자 명태 #1', 'hidden', '/uploads/rare/rare_amulet_36.png', 0, 0),
  ('개발자 명태 #2', 'hidden', '/uploads/rare/rare_amulet_36.png', 0, 0),
  ('개발자 명태 #3', 'hidden', '/uploads/rare/rare_amulet_36.png', 0, 0),
  ('개발자 명태 #4', 'hidden', '/uploads/rare/rare_amulet_36.png', 0, 0),
  ('개발자 명태 #5', 'hidden', '/uploads/rare/rare_amulet_36.png', 0, 0);

-- 시퀀스 재설정
SELECT setval('amulets_id_seq', (SELECT MAX(id) FROM amulets));