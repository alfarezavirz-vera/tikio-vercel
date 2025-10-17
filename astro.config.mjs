import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import vercel from '@astrojs/vercel/serverless'; // Ganti dari '@astrojs/node'
// import { getVPSIP } from './src/utils/config.ts'; // Hapus impor yang tidak perlu di Vercel
import { ENV_CONFIG } from './src/config/env.ts';
// let VPS_IP = await getVPSIP(); // Hapus kode yang tidak perlu di Vercel

console.log('Frontend Environment Configuration...');

export default defineConfig({
  integrations: [tailwind()],

  // Wajib: Mengaktifkan Server-Side Rendering (SSR) untuk API/fungsi dinamis
  output: 'server',

  // Gunakan Vercel Adapter
  adapter: vercel(),

  // Hapus konfigurasi 'server' yang bertentangan dengan Vercel (host: ENV_CONFIG.HOST, port: ...)

  // Pertahankan konfigurasi build dan vite lainnya sesuai kebutuhan.
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
    assetsPrefix: '/_assets/'
  },
  devToolbar: {
    enabled: ENV_CONFIG.DEV_TOOLBAR
  },
  vite: {
    // ... (Pertahankan konfigurasi vite Anda, tetapi hapus allowedHosts, hmr, dan ws)
    server: {
      fs: {
        // ... (Pertahankan deny list Anda)
      }
    }
  },
  security: {
    checkOrigin: false
  },
});