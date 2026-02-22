const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const worryRoutes = require('./routes/worryRoute');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API 경로 설정
app.use('/api/v1/worry', worryRoutes);
//3-3 유저 전체 조회 api
app.get('/api/admin/users',async(req,res)=>{
  try{
    
    const page= parseInt(req.query.page) ||1;
    const search =req.query.search || '';
    const limit=10;
    const offset=(page-1) * limit;
    const query=`
    select id, username, nickname, created, last_login,(Select count(*) from users where username like $1 or nickname like $1) as total_count
    from users where username like $1 order by created desc limit $2 offset $3;`;
    const values=[`%${search}%`,limit,offset];
    const result=await pool.query(query,values);
    const totalCount=result.rows.lengh>0 ? result.rows[0].total_count : 0;
    res.json({
      users: result.rows,
      pagination:{
        totalCount: parseInt(totalCount),
        totalPages:Math.ceil(totalCount/limit),
        currentPage:page
      }
    });    
  }
  catch(err){
    console.error('유저 전체 조회 오류:',err.message);
    res.status(500).send('Server')
  }
})

app.listen(PORT, () => {
  console.log(`🐟 액막이 명태 서버가 ${PORT}번 포트에서 헤엄치는 중...`);
});
