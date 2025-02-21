/// <reference types="vite/client" />

import { defineConfig, UserConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 添加类型声明
declare module 'vite' {
  export function defineConfig(config: any): any
}

export default defineConfig({
  plugins: [react({
    // 添加 JSX 运行时配置
    jsxRuntime: 'automatic',
    jsxImportSource: 'react'
  })],
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    },
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 500,
    cssCodeSplit: true,
    write: true
  },
  server: {
    host: true
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']
  },
  esbuild: {
    charset: 'utf8',
    supported: {
      'top-level-await': true
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      charset: 'utf8'
    }
  }
} as UserConfig) 