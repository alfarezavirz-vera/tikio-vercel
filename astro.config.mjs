import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import node from '@astrojs/node';
import { getVPSIP } from './src/utils/config.ts';
import { ENV_CONFIG } from './src/config/env.ts';
let VPS_IP = await getVPSIP();
console.log('Frontend Environment Configuration:', {
  FE_PORT: ENV_CONFIG.FE_PORT,
  NODE_ENV: ENV_CONFIG.NODE_ENV,
  DEV_TOOLBAR: ENV_CONFIG.DEV_TOOLBAR
});
export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  adapter: node({
    mode: 'standalone'
  }),
  build: {
    inlineStylesheets: 'auto',
    assets: '_assets',
    assetsPrefix: '/_assets/'
  },
  server: {
    port: parseInt(ENV_CONFIG.FE_PORT),
    host: ENV_CONFIG.HOST
  },
  devToolbar: {
    enabled: ENV_CONFIG.DEV_TOOLBAR
  },
  vite: {
    css: {
      devSourcemap: true
    },
    build: {
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          assetFileNames: (assetInfo) => {
            if (assetInfo.name && assetInfo.name.endsWith('.css')) {
              return 'css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      }
    },
    server: {
      fs: {
        strict: true,
        allow: ['.'],
        deny: [
          'package.json',
          'package-lock.json',
          'bun.lock',
          '.env',
          'tsconfig.json',
          'astro.config.mjs',
          'tailwind.config.mjs',
          'ecosystem.config.cjs',
          'node_modules',
          'src',
          'backend',
          'logs',
          '.git',
          '.astro'
        ]
      },
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        'tikio.syaii.my.id', //Isi domain mu (aku malas)
        `${VPS_IP}:${ENV_CONFIG.FE_PORT}`
      ],
      hmr: {
        port: 24678,
        host: 'localhost'
      },
      ws: {
        port: 24679
      }
    }
  },
  security: {
    checkOrigin: false
  },
  server: {
    port: parseInt(ENV_CONFIG.FE_PORT),
    host: ENV_CONFIG.HOST
  }
});