// src/app.js
const express = require('express');
const app = express();
const port = 3000;

app.use(express.json()); // JSON 요청 본문 해석

// 테스트 API
app.get('/', (req, res) => {
  res.send('안녕? 나는 액막이 명태 서버야!');
});

app.listen(port, () => {
  console.log(`서버가 ${port}번 포트에서 헤엄치고 있습니다 🐟`);
});