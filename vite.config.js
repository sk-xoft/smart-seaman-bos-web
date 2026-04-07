import { fileURLToPath, URL } from 'url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { quasar, transformAssetUrls } from '@quasar/vite-plugin'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue({
          template: { transformAssetUrls }
        }),
    
        quasar({
          sassVariables: 'src/quasar-variables.sass'
        })
    ],
    server: {
        port: 8080,
        proxy:{
            "/v1": {
                target: 'https://api-dev.smartseaman.com',
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/v1/, ''),
            },
        }
    },
    preview: {
        port: 10000,
        proxy: {
                "/v1": {
                target: "https://api.smartseaman.com",
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.replace(/^\/v1/, ""),
            },
        },
    },
    watch: {
        usePolling: true,
    },
    host: true, // needed for the Docker Container port mapping to work
    strictPort: true,
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }
});
