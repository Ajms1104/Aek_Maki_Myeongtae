import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'aekmagi-ai',
  brand: {
    displayName: '액막이AI', 
    primaryColor: '#3182F6', 
    icon: 'https://static.toss.im/appsintoss/16735/bca00758-7ffe-41cb-9210-0017b194f21e.png',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: {
      dev: 'vite --host',
      build: 'tsc -b && vite build',
    },
  },
  permissions: [],
  navigationBar: {
    withBackButton: true, // ✅ 토스 네이티브 뒤로가기 버튼 활성화!
    withHomeButton: true, 
  },
  outdir: 'dist',
});
