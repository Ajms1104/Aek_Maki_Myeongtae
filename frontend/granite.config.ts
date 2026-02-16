//앱인토스 설정문서

import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'aekmagi-ai',
  brand: {
    displayName: 'aekmagi-ai', // 화면에 노출될 앱의 한글 이름으로 바꿔주세요.
    primaryColor: '#3182F6', // 화면에 노출될 앱의 기본 색상으로 바꿔주세요.
    icon: ' ', // 화면에 노출될 앱의 아이콘 이미지 주소로 바꿔주세요.
  },
  web: {
    host: 'localhost', //실기기 사용하는 사람은 본인 IP로 수정
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  outdir: 'dist',
});
