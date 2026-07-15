const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});

const amulets = [
  // Common (1 ~ 31)
  { id: 1, name: '윙크 명태', grade: 'common', img: '/uploads/common/common_amulet_01.png', weight: 100 },
  { id: 2, name: '깜짝 명태', grade: 'common', img: '/uploads/common/common_amulet_02.png', weight: 100 },
  { id: 3, name: '겁먹은 명태', grade: 'common', img: '/uploads/common/common_amulet_03.png', weight: 100 },
  { id: 4, name: '화난 명태', grade: 'common', img: '/uploads/common/common_amulet_04.png', weight: 100 },
  { id: 5, name: '반짝이는 명태', grade: 'common', img: '/uploads/common/common_amulet_05.png', weight: 100 },
  { id: 6, name: '슬픈 명태', grade: 'common', img: '/uploads/common/common_amulet_06.png', weight: 100 },
  { id: 7, name: '메롱 명태', grade: 'common', img: '/uploads/common/common_amulet_07.png', weight: 100 },
  { id: 8, name: '기본 명태', grade: 'common', img: '/uploads/common/common_amulet_08.png', weight: 100 },
  { id: 9, name: '잠자는 명태', grade: 'common', img: '/uploads/common/common_amulet_09.png', weight: 100 },
  { id: 10, name: '사악한 명태', grade: 'common', img: '/uploads/common/common_amulet_10.png', weight: 100 },
  { id: 11, name: '짝사랑 명태', grade: 'common', img: '/uploads/common/common_amulet_11.png', weight: 100 },
  { id: 12, name: '뽀뽀 명태', grade: 'common', img: '/uploads/common/common_amulet_12.png', weight: 100 },
  { id: 13, name: '승리자 명태', grade: 'common', img: '/uploads/common/common_amulet_13.png', weight: 100 },
  { id: 14, name: '초롱초롱 명태', grade: 'common', img: '/uploads/common/common_amulet_14.png', weight: 100 },
  { id: 15, name: '익살 명태', grade: 'common', img: '/uploads/common/common_amulet_15.png', weight: 100 },
  { id: 16, name: '노곤 명태', grade: 'common', img: '/uploads/common/common_amulet_16.png', weight: 100 },
  { id: 17, name: '배부른 명태', grade: 'common', img: '/uploads/common/common_amulet_17.png', weight: 100 },
  { id: 18, name: '감탄 명태', grade: 'common', img: '/uploads/common/common_amulet_18.png', weight: 100 },
  { id: 19, name: '반장대소 명태', grade: 'common', img: '/uploads/common/common_amulet_19.png', weight: 100 },
  { id: 20, name: '식은땀 명태', grade: 'common', img: '/uploads/common/common_amulet_20.png', weight: 100 },
  { id: 21, name: '명상 명태', grade: 'common', img: '/uploads/common/common_amulet_21.png', weight: 100 },
  { id: 22, name: '부끄 명태', grade: 'common', img: '/uploads/common/common_amulet_22.png', weight: 100 },
  { id: 23, name: '열정 명태', grade: 'common', img: '/uploads/common/common_amulet_23.png', weight: 100 },
  { id: 24, name: '비웃는 명태', grade: 'common', img: '/uploads/common/common_amulet_24.png', weight: 100 },
  { id: 25, name: '의욕제로 명태', grade: 'common', img: '/uploads/common/common_amulet_25.png', weight: 100 },
  { id: 26, name: '흥얼 명태', grade: 'common', img: '/uploads/common/common_amulet_26.png', weight: 100 },
  { id: 27, name: '도파민 명태', grade: 'common', img: '/uploads/common/common_amulet_27.png', weight: 100 },
  { id: 28, name: '의심 명태', grade: 'common', img: '/uploads/common/common_amulet_28.png', weight: 100 },
  { id: 29, name: '발랄 명태', grade: 'common', img: '/uploads/common/common_amulet_29.png', weight: 100 },
  { id: 30, name: '밤샌 명태', grade: 'common', img: '/uploads/common/common_amulet_30.png', weight: 100 },
  { id: 31, name: '피곤 명태', grade: 'common', img: '/uploads/common/common_amulet_31.png', weight: 100 },

  // Rare
  { id: 32, name: '천문학자 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_01.png', weight: 40 },
  { id: 33, name: '패션디자이너 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_02.png', weight: 40 },
  { id: 34, name: '건축가 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_03.png', weight: 40 },
  { id: 35, name: '보석감정사 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_04.png', weight: 40 },
  { id: 36, name: '엔지니어 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_05.png', weight: 40 },
  { id: 40, name: '플로리스트 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_09.png', weight: 40 },
  { id: 41, name: '스쿠버다이버 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_10.png', weight: 40 },
  { id: 42, name: '연주가 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_11.png', weight: 40 },
  { id: 45, name: '파티시에 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_14.png', weight: 40 },
  { id: 47, name: '우주비행사 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_16.png', weight: 40 },
  { id: 48, name: '교사 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_17.png', weight: 40 },
  { id: 50, name: '영화감독 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_19.png', weight: 40 },
  { id: 51, name: '수의사 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_20.png', weight: 40 },
  { id: 55, name: '해커 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_24.png', weight: 40 },
  { id: 56, name: '의사 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_25.png', weight: 40 },
  { id: 57, name: '소방관 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_26.png', weight: 40 },
  { id: 58, name: '경찰관 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_27.png', weight: 40 },
  { id: 59, name: '판사 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_28.png', weight: 40 },
  { id: 67, name: '개발자 명태', grade: 'rare', img: '/uploads/rare/rare_amulet_36.png', weight: 40 },

  // Legend
  { id: 69, name: '태양 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_01.png', weight: 10 },
  { id: 70, name: '무지개 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_02.png', weight: 10 },
  { id: 71, name: '황금 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_03.png', weight: 10 },
  { id: 72, name: '구름 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_04.png', weight: 10 },
  { id: 73, name: '번개 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_05.png', weight: 10 },
  { id: 74, name: '수호신 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_06.png', weight: 10 },
  { id: 75, name: '얼음 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_07.png', weight: 10 },
  { id: 76, name: '불꽃 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_08.png', weight: 10 },
  { id: 77, name: '밤 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_09.png', weight: 10 },
  { id: 78, name: '보석 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_10.png', weight: 10 },
  { id: 79, name: '사탕 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_11.png', weight: 10 },
  { id: 80, name: '모래 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_12.png', weight: 10 },
  { id: 81, name: '바람 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_13.png', weight: 10 },
  { id: 82, name: '어둠 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_14.png', weight: 10 },
  { id: 83, name: '화산 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_15.png', weight: 10 },
  { id: 84, name: '숲 명태', grade: 'legend', img: '/uploads/legend/legend_amulet_16.png', weight: 10 },

  // Hidden
  { id: 85, name: 'Sourcandy 명태', grade: 'hidden', img: '/uploads/hidden/hidden_amulet_01.png', weight: 0 },
  { id: 86, name: 'Moshu 명태', grade: 'hidden', img: '/uploads/hidden/hidden_amulet_02.png', weight: 0 },
  { id: 87, name: 'LeeJin 명태', grade: 'hidden', img: '/uploads/hidden/hidden_amulet_03.png', weight: 0 },
  { id: 88, name: 'Baldy 명태', grade: 'hidden', img: '/uploads/hidden/hidden_amulet_04.png', weight: 0 },
  { id: 89, name: '억만이 명태', grade: 'hidden', img: '/uploads/hidden/hidden_amulet_05.png', weight: 0 }
];

async function reset() {
  try {
    await client.connect();
    console.log('DB Connected for reset...');

    // 1. 기존 테이블 강제 드랍
    console.log('Dropping tables...');
    await client.query(`
      DROP TABLE IF EXISTS system_performance_logs CASCADE;
      DROP TABLE IF EXISTS user_access_logs CASCADE;
      DROP TABLE IF EXISTS user_challenges CASCADE;
      DROP TABLE IF EXISTS user_amulets CASCADE;
      DROP TABLE IF EXISTS amulet_downloads CASCADE;
      DROP TABLE IF EXISTS consultations CASCADE;
      DROP TABLE IF EXISTS consultation_amulets CASCADE;
      DROP TABLE IF EXISTS announcements CASCADE;
      DROP TABLE IF EXISTS support CASCADE;
      DROP TABLE IF EXISTS probability_configs CASCADE;
      DROP TABLE IF EXISTS amulet_probability_schedules CASCADE;
      DROP TABLE IF EXISTS amulets CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    // 2. init.sql 로드 및 실행
    console.log('Executing init.sql...');
    const sqlPath = path.join(__dirname, 'src', 'sql', 'init.sql');
    let sql = fs.readFileSync(sqlPath, 'utf8');

    // 🔒 [안전장치] 한글 인코딩 깨짐 주석 및 다중 행 주석 일괄 청소
    sql = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

    // 세미콜론(;) 단위로 분할하여 개별 쿼리 순차 실행
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await client.query(stmt);
      } catch (err) {
        console.error(`[SQL Error at statement ${i + 1}]:`, stmt);
        throw err;
      }
    }

    // 3. 깨끗한 UTF-8 부적 시드 데이터 직접 삽입
    console.log('Inserting UTF-8 Amulet Seed Data...');
    for (const amulet of amulets) {
      await client.query(
        'INSERT INTO amulets (id, name, grade, image_url, weight, draft_weight) VALUES ($1, $2, $3, $4, $5, $6)',
        [amulet.id, amulet.name, amulet.grade, amulet.img, amulet.weight, amulet.weight]
      );
    }
    
    // 시퀀스 최댓값 동기화
    await client.query("SELECT setval('amulets_id_seq', (SELECT MAX(id) FROM amulets))");

    console.log('DB Reset completed successfully!');
  } catch (err) {
    console.error('DB Reset failed:', err);
  } finally {
    await client.end();
  }
}

reset();
