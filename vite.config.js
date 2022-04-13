import { defineConfig } from 'vite';
import path from 'path';
import { createVuePlugin } from 'vite-plugin-vue2';
import envCompatible from 'vite-plugin-env-compatible';
import { injectHtml } from 'vite-plugin-html';
import { viteCommonjs } from '@originjs/vite-plugin-commonjs';
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  base:"",
  resolve: {
    alias: [
      {
        find: /^~/,
        replacement: ''
      },
      {
        find: '@',
        replacement: path.resolve(__dirname, 'src')
      }
    ],
    extensions: [
      '.mjs',
      '.js',
      '.ts',
      '.jsx',
      '.tsx',
      '.json',
      '.vue'
    ]
  },
  plugins: [
    createVuePlugin({ jsx: true }),
    viteCommonjs(),
    envCompatible(),
    injectHtml(),
    VitePWA({
      includeAssets: ["favicon.svg","favicon.ico","robots.txt","apple-touch-icon.png"],
      manifest: {
        name: "明天健！｜運動中心圖表",
        short_name: "明天健！",
        description: "利用圖表提供運動中心的人流資訊",
        theme_color: "rgb(0,61,124)",
        start_url:"/gym-stats",
        scope:"/gym-stats",
        icons:[
          {
            src:"pwa-192x192.png",
            sizes:"192x192",
            type:"image/png"
          },
          {
            src:"pwa-512x512.png",
            sizes:"512x512",
            type:"image/png"
          },
          {
            src:"pwa-512x512.png",
            sizes:"512x512",
            type:"image/png",
            purpose:"any maskable"
          }
        ]

      }

    })
  ],
  server: {
    host:true,
    port:8080,
    strictPort: false,
    proxy: 'http://home.tonyyu.taipei:1337'
  },
  build: {}
})
