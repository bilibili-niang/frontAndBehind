import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import topLevelAwait from 'vite-plugin-top-level-await'
// vuetify按需导入
import vuetify from 'vite-plugin-vuetify'
// 自动生成路由
import Pages from 'vite-plugin-pages'

import postCssPxToRem from 'postcss-pxtorem'
// @ts-ignore
import eslint from 'vite-plugin-eslint'

const isProd = process.env.NODE_ENV !== 'development'
// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const { ALI_OSS_ACCESS_KEY, ALI_OSS_SECRET_KEY, ALI_OSS_BUCKET, ALI_OSS_ENDPOINT, ALI_OSS_PUBLIC_PATH } = loadEnv(
    mode,
    process.cwd(),
    'ALI_OSS'
  )
  /*  const ossOptions = {
      accessKeyId: ALI_OSS_ACCESS_KEY,
      accessKeySecret: ALI_OSS_SECRET_KEY,
      bucket: ALI_OSS_BUCKET,
      endpoint: ALI_OSS_ENDPOINT
    }*/
  const env = loadEnv(mode, process.cwd(), 'VITE_APP')
  const VITE_APP_NAME = env.VITE_APP_NAME || ''
  console.log('===========================================')
  console.log('项目名称', VITE_APP_NAME)
  console.log('NODE_ENV：', process.env.NODE_ENV)
  console.log('构建目标', mode)
  console.log('环境变量', env)
  console.log('===========================================')
  // const isUseOSS = isProd && !(env.VITE_APP_SKIP_OSS === 'true')
  const isTest = mode === 'test'
  return {
    // base: isUseOSS ? ALI_OSS_PUBLIC_PATH : `/${VITE_APP_NAME}`,
    define: {
      'import.meta.env.VITE_APP_NAME': `"${VITE_APP_NAME || ''}"`
    },
    plugins: [
      // 自动生成路由
      Pages({
        dirs: 'src/views',
        extensions: ['vue', 'tsx'],
        exclude: ['**/components/**', '**/composables/**', '**/__tests__/**'],
        importMode: 'async',
        routeBlockLang: 'json5',
        extendRoute(route) {
          // 可以在这里扩展路由配置
          return route
        }
      }),
      // TODO tailwindcss 配置
      tailwindcss(),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => ['iconpark-icon'].includes(tag)
          }
        }
      }),
      vuetify({ autoImport: true, }),
      vueJsx({
        isCustomElement: (tag) => ['iconpark-icon'].includes(tag),
        mergeProps: false
      }),
      eslint(),
      topLevelAwait({
        promiseExportName: '__tla',
        promiseImportName: (i) => `__tla_${i}`
      }),
      // @ts-ignore
      // isUseOSS ? vitePluginAliOss(ossOptions) : undefined
    ],
    build: {
      minify: isTest ? false : true,
      sourcemap: isTest,
      rollupOptions: {
        output: {
          manualChunks(id, { getModuleInfo, getModuleIds }) {
            if (id.includes('@ant-design/icons-svg')) {
              return 'antd-icons'
            }
            if (id.includes('ant-design-vue')) {
              return 'antd'
            }
            if (id.includes('node_modules')) {
              return 'vendor'
            }
          }
        }
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern',
          silenceDeprecations: ['import'],
          javascriptEnabled: true,
        }
      },
      postcss: {
        plugins: [
          postCssPxToRem({
            // 自适应，px>rem转换
            rootValue: 1, // 75表示750设计稿，37.5表示375设计稿
            propList: ['*'], // 需要转换的属性，这里选择全部都进行转换 也可以'font', 'font-size', 'line-height', 'letter-spacing'等
            selectorBlackList: ['.van'], // 过滤掉van-开头的class，不进行rem转换
            exclude: (file) => {
              return !/canvas-components/i.test(file)
            }
          })
        ]
      }
    },
    server: {
      port: 3300,
      proxy: {
        '/api': {
          // target: process.env.VITE_APP_PROXY_TARGET,
          target: 'http://localhost:3279',
          changeOrigin: true,
          // 覆写,替换掉/api
          rewrite: (path) => {
            return path.replace(/^\/api/, '')
          }
        },
      }
    }
  }
})
