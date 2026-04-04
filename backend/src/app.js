const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

const worryRoutes = require('./routes/worryRoute');
const adminRoutes = require('./routes/adminRoute');
const authRoutes = require('./routes/authRoute');

const pool = require('./db');
const { nextTick } = require('process');

//Swagger 
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./configuration/swagger'); //Swagger 설정문서 위치

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


//Swagger UI 설정
if (process.env.NODE_ENV !== 'production') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(`📋🐟 액막이 명태 API 문서: http://localhost:${PORT}/api-docs`);
}

// API 경로 설정
app.use('/api/v1/worry', worryRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/auth', authRoutes);

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


//3-4 고객센터 문의 조회  api
app.get('/api/support',async(req,res)=>{
  try{
    const{status}=req.query;
    let query='select user_id, content,created,status from support ';
    let values=[];
    if(status && status!=='전체'){
      query+=' Where status=$1 ';
      values.push(status);

    }
    query+=' order by created desc';
    const result=await pool.query(query,values);
    res.status(200).json({success:true,data:result.rows});
    }catch(err){
      console.error('고객센터 문의 조회 오류:',err.message);
      res.status(500).send('Server Error');
    }
  });


  //1-1 고객센터 문의 등록 api
  app.post('/api/support/tickets',async(req,res)=>{
    //const authHeather=req.headers['authorization'];
    const{user_id,title,content,reply_email}=req.body;

    /*if(!authHeather){
      return res.status(401).json({
        message:"Unauthorized: 인증토큰이 없습니다."
      });
    }*/
  if(!title || !content){
    return res.status(400).json({
      message:"제목과 내용을 모두 입력해주세요."
    });
  }
  try{
    const query=`insert into support(user_id,title,content,reply_email) values($1,$2,$3,$4) returning id as "ticketId"`;
    const values=[user_id,title,content,reply_email];
    const {rows}=await pool.query(query,values);
    const ticketid=rows[0].id;

  return res.status(201).json({
    ticketId:ticketid,
    message:"성공적으로 접수되었습니다."
  });
  }
  catch(err){
    console.error('고객센터 문의 등록 오류:',err.message);
    res.status(500).send('Server Error');
  }
});

  //1-2 내 문의사항조회
  app.get('/api/support/tickets',async(req,res)=>{
    //const authHeather=req.headers['authorization'];
    const cursor=req.query.cursor;
    const limit = parseInt(req.query.limit) || 20;
    /* 인증 시스템 구현 전까지 주석 유지
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  */
 try{
  let query;
  let values;
  if(!cursor){
    query=`
    select ticket_id,title,status,created_at,updated_at from support order by ticket_id desc limit $1;`;
    values=[limit];
  }else{
    query=`select ticket_id,title,status,created_at,updated_at from support where ticket_id<$1 order by ticket_id desc limit $2;`;
  values=[cursor,limit];
 }
 const result=await pool.query(query,values);
 const items =result.rows.map(row=>({
  ticketId: String(row.ticket_id),
  title: row.title,
  status: row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at
 }));
 let nextCursor=null;
 if(items.length ===limit){
  nextCursor=items[items.length-1].ticketId;
 }
 return res.status(200).json({
  items,
  nextCursor
 });
} catch(err){
  console.error('내 문의사항 조회 오류:',err.message);
  res.status(500).send('Server Error');
}
});


  //1-3 공지사항조회
  app.get('/api/announcements', async(req,res)=>{
    try{
      const query='select announcement_id,title,content,is_urgent,start_at,end_at,created_at from announcements where start_at<=current_timestamp and(end_at is null or end_at>=current_timestamp) order by is_urgent desc, created_at desc;';
      const result=await pool.query(query);
      const items =result.rows.map(row=>({
        announcementId: String(row.announcement_id),
      title: row.title,
    content:row.content,
  isUrgent: row.is_urgent,
  startAt: row.start_at,
  endAt: row.end_at,
  createdAt: row.created_at
      }));
      res.status(200).json({
        items
      });
    }catch(err){
      console.error('공지사항 조회 오류:',err.message);
      res.status(500).send('Server Error');
    }
  });
  //5-1 문의리스트 조회(관리자)
    app.get('/api/admin/support/tickets',async(req,res)=>{
      try{
        const{status ='ALL',cursor,limit=50} =req.query;
        const adminToken=req.headers.authorization;
        // if(!adminToken) return res.status(401).json({message:"Unauthorized"});

        const lastId=cursor ? parseInt(cursor) :99999999;
        const queryLimit=parseInt(limit)>50?50: parseInt(limit);

        const query = `
        select id as "ticketId", user_id as "userid",title,status,created as "createdat"
        from support where ($1 ='ALL' or status =$1) and id <$2
        order by id desc limit $3`;
        const values=[status,lastId, queryLimit];
        const {rows}=await pool.query(query, values);
        res.json({
          items: rows,nextCursor: rows.length>0? rows[rows.length-1].ticketId :null});
        }catch(err){
          console.error(err);
          res.status(500).json({message: "Server Error"});
        }
        });
  //5-2 문의상태변경/답변등록(관리자)
  app.patch('/api/admin/support/tickets/:ticketId',async(req,res)=>{
    const{ticketId}=req.params;
    const{status,replyContent}=req.body;
    try{
      let finalStatus = status;
      if(replyContent&&!status){
        finalStatus ='Done';
      }
      const query=`
      update support set status=coalesce($1,status),reply_content=coalesce($2,reply_content),
      updated_at=now() where id=$3 returning id as "ticketId",status,reply_content as "replycontent",updated_at as "updatedat"
      `;
      const values=[finalStatus,replyContent,ticketId];
      const {rows}= await pool.query(query,values);
      if(rows.length===0){
        return res.status(404).json({message:"문의를 찾을수없음"});
      }
      res.json(rows[0]);
      }catch(err){
        console.error(err);
        res.status(500).json({message:"server error"});
      }
    });

app.listen(PORT, () => {
  console.log(`🐟 액막이 명태 서버가 ${PORT}번 포트에서 헤엄치는 중...`);
});
