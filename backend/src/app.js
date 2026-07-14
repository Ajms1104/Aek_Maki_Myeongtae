//App.js에는 환경변수, 미들웨어, 라우트, 서버시작만 남길 것

'use strict';

const path = require('path');
const dotenv = require('dotenv');
// 프로젝트 루트의 .env와 src/.env 모두 시도
dotenv.config(); 
dotenv.config({ path: path.join(__dirname, '.env') }); 

const express = require('express');
const cors = require('cors');

const adminRoutes = require('./routes/adminRoute');
const authRoutes = require('./routes/authRoute');
const supportRoutes = require('./routes/supportRoute');
const announcementRoutes = require('./routes/announcementRoute');
const consultationRoutes = require('./routes/consultationRoute'); //고민사항
const amuletRoutes = require('./routes/amuletRoute'); // 부적
const meRoutes = require('./routes/meRoute');
const paymentRoutes = require('./routes/paymentRoute');
const debugRoutes = require('./routes/debugRoute');


// Swagger 관련
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./configuration/swagger');

// 🔒 [보안 검증] 상용 환경 대비 핵심 비밀키 누락 시 강제 중단 처리
if (!process.env.JWT_SECRET) {
  console.error('❌ [CRITICAL ERROR] JWT_SECRET이 .env 파일에 누락되었습니다! 보안을 위해 서버 가동을 즉시 중단합니다.');
  process.exit(1);
}

const app = express();
app.disable('x-powered-by'); // 🔒 Express 프레임워크 유출 헤더 제거
const PORT = process.env.PORT || 3000;

const IS_PROD = process.env.NODE_ENV === 'production';
const corsOptions = {
  origin: (origin, callback) => {
    // 브라우저가 아닌 환경(네이티브 앱 등)에서 origin이 비어오는 경우 허용
    if (!origin) return callback(null, true);
    
    // 토스 인앱 및 실서버 허용 오리진 검사
    const isAllowed = 
      origin === 'https://aekmaki.site' ||
      origin === 'https://localhost' ||
      origin.startsWith('toss-mini-app://') ||
      /\.toss\.im$/.test(origin) ||
      /\.tossmini\.com$/.test(origin) || // 토스 폰 웹뷰 도메인 대응 (*.tossmini.com)
      /\.tossmini\.app$/.test(origin) || 
      /\.ait$/.test(origin); // 토스 인앱(AIT) 번들 호스팅 도메인 대응

    if (isAllowed || !IS_PROD) {
      callback(null, true);
    } else {
      console.warn(`[CORS Blocked] Origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// ✅ 이미지 정적 파일 서비스 (캐싱 및 CORS 설정 추가)
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '30d', // 30일간 강력 캐싱
  immutable: true,
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // CDN 및 Canvas 합성 대응
  }
}));

// Swagger UI
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📋🐟 액막이 명태 API 문서: http://localhost:${PORT}/api-docs`);
}

// 라우트
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/support', supportRoutes);
app.use('/api/v1/announcements', announcementRoutes);
app.use('/api/v1/consultations', consultationRoutes);
app.use('/api/v1/me', meRoutes);
app.use('/api/v1/amulets', amuletRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/debug', debugRoutes);


app.listen(PORT, () => {
  console.log(`🐟 액막이 명태 서버가 ${PORT}번 포트에서 헤엄치는 중...`);
});
