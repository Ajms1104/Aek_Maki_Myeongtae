const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const worryRoutes = require('./routes/worryRoute');

dotenv.config(); // .env 파일 로드

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API 경로 설정
app.use('/api/v1/worry', worryRoutes);

app.listen(PORT, () => {
  console.log(`🐟 액막이 명태 서버가 ${PORT}번 포트에서 헤엄치는 중...`);
});