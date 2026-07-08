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
  status        VARCHAR(50) DEFAULT '?듬??湲?,
  created       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 湲곗〈 ?곗씠????젣 ??id 1遺???ㅼ떆 ?쒖옉
DELETE FROM consultation_amulets;
DELETE FROM user_amulets;
DELETE FROM amulets;

-- ?쒗??1遺??由ъ뀑
ALTER SEQUENCE amulets_id_seq RESTART WITH 1;

-- common ?깃툒 (weight: 100)
INSERT INTO amulets (name, grade, image_url, weight, draft_weight) VALUES
  ('?숉겕 紐낇깭',       'common', '/uploads/common/common_amulet_01.png', 100, 100),
  ('源쒖쭩 紐낇깭',       'common', '/uploads/common/common_amulet_02.png', 100, 100),
  ('寃곷㉨? 紐낇깭',     'common', '/uploads/common/common_amulet_03.png', 100, 100),
  ('?붾궃 紐낇깭',       'common', '/uploads/common/common_amulet_04.png', 100, 100),
  ('諛섏쭩?대뒗 紐낇깭',   'common', '/uploads/common/common_amulet_05.png', 100, 100),
  ('?ы뵂 紐낇깭',       'common', '/uploads/common/common_amulet_06.png', 100, 100),
  ('硫붾” 紐낇깭',       'common', '/uploads/common/common_amulet_07.png', 100, 100),
  ('湲곕낯 紐낇깭',       'common', '/uploads/common/common_amulet_08.png', 100, 100),
  ('?좎옄??紐낇깭',     'common', '/uploads/common/common_amulet_09.png', 100, 100),
  ('?ъ븙??紐낇깭',     'common', '/uploads/common/common_amulet_10.png', 100, 100),
  ('吏앹궗??紐낇깭',     'common', '/uploads/common/common_amulet_11.png', 100, 100),
  ('戮戮 紐낇깭',       'common', '/uploads/common/common_amulet_12.png', 100, 100),
  ('?밸━??紐낇깭',     'common', '/uploads/common/common_amulet_13.png', 100, 100),
  ('珥덈”珥덈” 紐낇깭',   'common', '/uploads/common/common_amulet_14.png', 100, 100),
  ('?듭궡 紐낇깭',       'common', '/uploads/common/common_amulet_15.png', 100, 100),
  ('?멸낀 紐낇깭',       'common', '/uploads/common/common_amulet_16.png', 100, 100),
  ('諛곕?瑜?紐낇깭',     'common', '/uploads/common/common_amulet_17.png', 100, 100),
  ('媛먰깂 紐낇깭',       'common', '/uploads/common/common_amulet_18.png', 100, 100),
  ('諛섏옣???紐낇깭',   'common', '/uploads/common/common_amulet_19.png', 100, 100),
  ('?앹?? 紐낇깭',     'common', '/uploads/common/common_amulet_20.png', 100, 100),
  ('紐낆긽 紐낇깭',       'common', '/uploads/common/common_amulet_21.png', 100, 100),
  ('遺??紐낇깭',       'common', '/uploads/common/common_amulet_22.png', 100, 100),
  ('?댁젙 紐낇깭',       'common', '/uploads/common/common_amulet_23.png', 100, 100),
  ('鍮꾩썐??紐낇깭',     'common', '/uploads/common/common_amulet_24.png', 100, 100),
  ('?섏슃?쒕줈 紐낇깭',   'common', '/uploads/common/common_amulet_25.png', 100, 100),
  ('?μ뼹 紐낇깭',       'common', '/uploads/common/common_amulet_26.png', 100, 100),
  ('?꾪뙆誘?紐낇깭',     'common', '/uploads/common/common_amulet_27.png', 100, 100),
  ('?섏떖 紐낇깭',       'common', '/uploads/common/common_amulet_28.png', 100, 100),
  ('諛쒕엫 紐낇깭',       'common', '/uploads/common/common_amulet_29.png', 100, 100),
  ('諛ㅼ깒 紐낇깭',       'common', '/uploads/common/common_amulet_30.png', 100, 100),
  ('?쇨낀 紐낇깭',       'common', '/uploads/common/common_amulet_31.png', 100, 100);

-- rare ?깃툒 (weight: 40)
INSERT INTO amulets (name, grade, image_url, weight, draft_weight) VALUES
  ('泥쒕Ц?숈옄 紐낇깭',       'rare', '/uploads/rare/rare_amulet_01.png', 40, 40),
  ('?⑥뀡?붿옄?대꼫 紐낇깭',   'rare', '/uploads/rare/rare_amulet_02.png', 40, 40),
  ('嫄댁텞媛 紐낇깭',         'rare', '/uploads/rare/rare_amulet_03.png', 40, 40),
  ('蹂댁꽍媛먯젙??紐낇깭',     'rare', '/uploads/rare/rare_amulet_04.png', 40, 40),
  ('?붿??덉뼱 紐낇깭',       'rare', '/uploads/rare/rare_amulet_05.png', 40, 40),
  ('?댁뼇?숈옄 紐낇깭',       'rare', '/uploads/rare/rare_amulet_06.png', 40, 40),
  ('湲곗긽?숈옄 紐낇깭',       'rare', '/uploads/rare/rare_amulet_07.png', 40, 40),
  ('怨좉퀬?숈옄 紐낇깭',       'rare', '/uploads/rare/rare_amulet_08.png', 40, 40),
  ('?뚮줈由ъ뒪??紐낇깭',     'rare', '/uploads/rare/rare_amulet_09.png', 40, 40),
  ('?ㅼ퓼踰꾨떎?대쾭 紐낇깭',   'rare', '/uploads/rare/rare_amulet_10.png', 40, 40),
  ('?곗＜媛 紐낇깭',         'rare', '/uploads/rare/rare_amulet_11.png', 40, 40),
  ('怨듭썝愿由ъ옄 紐낇깭',     'rare', '/uploads/rare/rare_amulet_12.png', 40, 40),
  ('?뺣퉬??紐낇깭',         'rare', '/uploads/rare/rare_amulet_13.png', 40, 40),
  ('?뚰떚?쒖뿉 紐낇깭',       'rare', '/uploads/rare/rare_amulet_14.png', 40, 40),
  ('?덉쟾愿由ъ옄 紐낇깭',     'rare', '/uploads/rare/rare_amulet_15.png', 40, 40),
  ('?곗＜鍮꾪뻾??紐낇깭',     'rare', '/uploads/rare/rare_amulet_16.png', 40, 40),
  ('援먯궗 紐낇깭',           'rare', '/uploads/rare/rare_amulet_17.png', 40, 40),
  ('?ъ쫰?뚯븙媛 紐낇깭',     'rare', '/uploads/rare/rare_amulet_18.png', 40, 40),
  ('?곹솕媛먮룆 紐낇깭',       'rare', '/uploads/rare/rare_amulet_19.png', 40, 40),
  ('?섏쓽??紐낇깭',         'rare', '/uploads/rare/rare_amulet_20.png', 40, 40),
  ('?밸Т??紐낇깭',         'rare', '/uploads/rare/rare_amulet_21.png', 40, 40),
  ('吏묐같??紐낇깭',         'rare', '/uploads/rare/rare_amulet_22.png', 40, 40),
  ('?뺤썝??紐낇깭',         'rare', '/uploads/rare/rare_amulet_23.png', 40, 40),
  ('?댁빱 紐낇깭',           'rare', '/uploads/rare/rare_amulet_24.png', 40, 40),
  ('?섏궗 紐낇깭',           'rare', '/uploads/rare/rare_amulet_25.png', 40, 40),
  ('?뚮갑愿 紐낇깭',         'rare', '/uploads/rare/rare_amulet_26.png', 40, 40),
  ('寃쎌같愿 紐낇깭',         'rare', '/uploads/rare/rare_amulet_27.png', 40, 40),
  ('?먯궗 紐낇깭',           'rare', '/uploads/rare/rare_amulet_28.png', 40, 40),
  ('?ㅺ퀎??紐낇깭',         'rare', '/uploads/rare/rare_amulet_29.png', 40, 40),
  ('?ㅼ뼱?붿옄?대꼫 紐낇깭',   'rare', '/uploads/rare/rare_amulet_30.png', 40, 40),
  ('硫붿씠?ъ뾽?꾪떚?ㅽ듃 紐낇깭','rare', '/uploads/rare/rare_amulet_31.png', 40, 40),
  ('?ㅼ씪?꾪떚?ㅽ듃 紐낇깭',   'rare', '/uploads/rare/rare_amulet_32.png', 40, 40),
  ('?뚭퀎??紐낇깭',         'rare', '/uploads/rare/rare_amulet_33.png', 40, 40),
  ('議고뼢??紐낇깭',         'rare', '/uploads/rare/rare_amulet_34.png', 40, 40),
  ('?ы뙋??紐낇깭',         'rare', '/uploads/rare/rare_amulet_35.png', 40, 40),
  ('媛쒕컻??紐낇깭',         'rare', '/uploads/rare/rare_amulet_36.png', 40, 40),
  ('?ъ꽌 紐낇깭',           'rare', '/uploads/rare/rare_amulet_37.png', 40, 40);

-- legend ?깃툒 (weight: 10)
INSERT INTO amulets (name, grade, image_url, weight, draft_weight) VALUES
  ('?쒖뼇 紐낇깭',   'legend', '/uploads/legend/legend_amulet_01.png', 10, 10),
  ('臾댁?媛?紐낇깭', 'legend', '/uploads/legend/legend_amulet_02.png', 10, 10),
  ('?⑷툑 紐낇깭',   'legend', '/uploads/legend/legend_amulet_03.png', 10, 10),
  ('援щ쫫 紐낇깭',   'legend', '/uploads/legend/legend_amulet_04.png', 10, 10),
  ('踰덇컻 紐낇깭',   'legend', '/uploads/legend/legend_amulet_05.png', 10, 10),
  ('?섑샇??紐낇깭', 'legend', '/uploads/legend/legend_amulet_06.png', 10, 10),
  ('?쇱쓬 紐낇깭',   'legend', '/uploads/legend/legend_amulet_07.png', 10, 10),
  ('遺덇퐙 紐낇깭',   'legend', '/uploads/legend/legend_amulet_08.png', 10, 10),
  ('諛?紐낇깭',     'legend', '/uploads/legend/legend_amulet_09.png', 10, 10),
  ('蹂댁꽍 紐낇깭',   'legend', '/uploads/legend/legend_amulet_10.png', 10, 10),
  ('?ы깢 紐낇깭',   'legend', '/uploads/legend/legend_amulet_11.png', 10, 10),
  ('紐⑤옒 紐낇깭',   'legend', '/uploads/legend/legend_amulet_12.png', 10, 10),
  ('諛붾엺 紐낇깭',   'legend', '/uploads/legend/legend_amulet_13.png', 10, 10),
  ('?대몺 紐낇깭',   'legend', '/uploads/legend/legend_amulet_14.png', 10, 10),
  ('?붿궛 紐낇깭',   'legend', '/uploads/legend/legend_amulet_15.png', 10, 10),
  ('??紐낇깭',     'legend', '/uploads/legend/legend_amulet_16.png', 10, 10);

-- hidden ?깃툒 (weight: 0, 寃곗젣濡쒕쭔 ?띾뱷)
INSERT INTO amulets (name, grade, image_url, weight, draft_weight) VALUES
  ('Sourcandy 紐낇깭', 'hidden', '/uploads/hidden/hidden_amulet_01.png', 0, 0),
  ('Moshu 紐낇깭',      'hidden', '/uploads/hidden/hidden_amulet_02.png', 0, 0),
  ('LeeJin 紐낇깭',     'hidden', '/uploads/hidden/hidden_amulet_03.png', 0, 0),
  ('Baldy 紐낇깭',      'hidden', '/uploads/hidden/hidden_amulet_04.png', 0, 0),
  ('?듬쭔??紐낇깭',     'hidden', '/uploads/hidden/hidden_amulet_05.png', 0, 0);

-- ?쒗???ъ꽕??
SELECT setval('amulets_id_seq', (SELECT MAX(id) FROM amulets));

