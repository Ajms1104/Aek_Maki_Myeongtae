#!/bin/bash
echo "🚀 [액막이 명태] 프론트엔드 자동 배포를 시작합니다..."

# 1. 깃허브 최신 패치 가져오기
echo "📦 1. 깃허브 최신 패치 가져오는 중..."
git pull origin main

# 2. 빌드 실행
echo "⚙️ 2. Vite 프로덕션 빌드 구동 중..."
cd frontend
npx vite build

# 3. 배포 복사
echo "🚚 3. Nginx 실 배포 경로로 복사 중..."
sudo cp -rf dist/* /var/www/myeongtae/web/

echo "✅ 배포가 성공적으로 완료되었습니다! 브라우저에서 새로고침하여 확인하세요."
