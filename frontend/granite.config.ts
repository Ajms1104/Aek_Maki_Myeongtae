import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'aekmagi-ai',
  brand: {
    displayName: '액막이 AI', 
    primaryColor: '#3182F6', 
    icon: './src/assets/main_app_logo.png',
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
