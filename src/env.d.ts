/// <reference types="vite/client" />

declare module '@vitejs/plugin-react' {
  import type { Plugin } from 'vite'
  interface Options {
    jsxRuntime?: 'classic' | 'automatic'
    jsxImportSource?: string
  }
  const plugin: (options?: Options) => Plugin
  export default plugin
}

declare module 'vite' {
  export interface UserConfig {
    plugins?: any[]
    build?: {
      sourcemap?: boolean
      rollupOptions?: any
      assetsInlineLimit?: number
      chunkSizeWarningLimit?: number
      cssCodeSplit?: boolean
      write?: boolean
    }
    server?: {
      host?: boolean
    }
    resolve?: {
      extensions?: string[]
    }
    esbuild?: {
      charset?: string
      supported?: {
        'top-level-await'?: boolean
      }
    }
    optimizeDeps?: {
      esbuildOptions?: {
        charset?: string
      }
    }
  }
  export function defineConfig(config: UserConfig): UserConfig
} 