# Aek_Maki_Myeongtae
- 액막이 명태
* github : ``` git clone https://github.com/Ajms1104/Aek_Maki_Myeongtae.git ```
* 개발은 실기기로 연동중이면 VSCODE / 에뮬 연동이면 Androd Studio 추천
* 서버 열기전 까진 로컬에서 back/frontend 둘 다 켜놓고 시작

---
## Backend 설명
- 프레임워크 : Node.js (24.13.1 LTS) , Postgre SQL
- 기본 실행 :  ``` npm start ```
      -  안된다면 package.json 이 있는지 체크하고 / 없으면 ``` npm init -y ```
* 라이브러리
  ``` npm install pg #postgre SQL 설치
      npm install express
      npm install dotenv
      npm install cors
  ``` 
파일 구조 : ``` backend/src/main/controller, Service, repository, configuration, ... ```  # 핵사고날_아키텍쳐 # 책임분리  

---
## Frontend 설명
- 프레임워크 : React + vite + WebView(TDS)
- 기본 실행 : ``` npm run dev ```
      -  안된다면 본인이 ./frontend 파일에서 실행하는 중인지 확인해보아요.
* 휴대폰(실기기, 에뮬 포함)에서 안 뜨면 아래 결과 확인해볼 것
```  adb reverse tcp:8081 tcp:8081 //결과 : 8081
     adb reverse tcp:5170 tcp:5170 //결과 : 5170
```
  
* 라이브러리
파일 구조 : ```frontend/src/main/assets, pages```

- 페이지별로 필요한 이미지(.svg , .webp 추천)나 페이지를 폴더 추가해서 정리해도 됨 (정리하고 나면 각 소스코드마다 경로 재설정 필요)
---
