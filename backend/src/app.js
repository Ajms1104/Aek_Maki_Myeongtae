const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

const express = require('express');
const cors = require('cors');
const worryRoutes = require('./routes/worryRoute');
const adminRoutes = require('./routes/adminRoute');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API 경로 설정
app.use('/api/v1/worry', worryRoutes);
app.use('/api/v1/admin', adminRoutes);

app.listen(PORT, () => {
  console.log(`🐟 액막이 명태 서버가 ${PORT}번 포트에서 헤엄치는 중...`);
});