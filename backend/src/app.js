//App.js에는 환경변수, 미들웨어, 라우트, 서버시작만 남길 것

'use strict';

const path = require('path');
const dotenv = require('dotenv');
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


//Swagger 관련
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./configuration/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

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
app.use('/api/v1/auth', meRoutes);


app.listen(PORT, () => {
  console.log(`🐟 액막이 명태 서버가 ${PORT}번 포트에서 헤엄치는 중...`);
});