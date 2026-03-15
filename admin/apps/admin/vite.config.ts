import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import topLevelAwait from 'vite-plugin-top-level-await'
import config from './package.json'

import postCssPxToRem from 'postcss-pxtorem'
// @ts-ignore
import eslint from 'vite-plugin-eslint'

// 静默 Dart Sass 的 legacy-js-api 弃用警告（控制台不再刷屏）
process.env.SASS_SILENCE_DEPRECATIONS = ['legacy-js-api', 'import'].join(',')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_APP')
  const VITE_APP_NAME = config.name || ''
  console.log('===========================================')
  console.log('项目名称', VITE_APP_NAME)
  console.log('NODE_ENV：', process.env.NODE_ENV)
  console.log('构建目标', mode)
  console.log('环境变量', env)
  console.log('===========================================')
  // const isUseOSS = isProd && !(env.VITE_APP_SKIP_OSS === 'true')
  const isTest = mode === 'test'
  // 确保测试/部署构建的静态资源路径带上项目名前缀
  return {
    // 统一使用以斜杠包裹的前缀：`/admin/`；未设置则为 `/`
    base: VITE_APP_NAME ? `/${VITE_APP_NAME}/` : '/',
    define: {
      'import.meta.env.VITE_APP_NAME': `"${VITE_APP_NAME || ''}"`
    },
    plugins: [
      // TODO tailwindcss 配置
      tailwindcss(),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: (tag) => ['iconpark-icon'].includes(tag)
          }
        }
      }),
      vueJsx({
        isCustomElement: (tag) => ['iconpark-icon'].includes(tag),
        mergeProps: false
      }),
      eslint({
        include: ['src/**/*.{ts,tsx,vue,js,jsx}'],
        exclude: ['node_modules', 'dist', '../../packages/**'],
        // 不因 ESLint 问题阻断开发，也不触发覆盖层
        failOnError: false,
        failOnWarning: false
      }),
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
          manualChunks(id) {
            // 将 Vue 生态拆分独立 chunk，避免与其它依赖合并后出现初始化顺序问题
            if (id.includes('/node_modules/vue/')) return 'vue'
            if (id.includes('/node_modules/@vue/')) return 'vue'
            if (id.includes('/node_modules/vue-router/')) return 'vue'
            if (id.includes('/node_modules/pinia/')) return 'vue'

            // Ant Design Vue 及其图标独立拆分
            if (id.includes('/node_modules/@ant-design/icons-svg/')) return 'antd-icons'
            if (id.includes('/node_modules/ant-design-vue/')) return 'antd'

            // 其它第三方库归入 vendor
            if (id.includes('/node_modules/')) return 'vendor'
          }
        }
      }
    },
    optimizeDeps: {
      include: [
        'ant-design-vue/locale/zh_CN',
        'simplebar-vue'
      ]
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          // CI 环境下 sass-embedded 存在崩溃风险，切回 legacy API 更稳
          api: 'legacy',
          // 同步在 Vite 级别静默提示
          silenceDeprecations: ['import', 'legacy-js-api'],
          // 全局注入样式变量，所有 SCSS 均可使用 $prefix 等变量
          additionalData: '@use \'@pkg/styles/src/variables/index.scss\' as *;'
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
      hmr: { overlay: false },
      fs: {
        // 允许访问工作区 packages 源码（供 workspace 包直接以源码参与开发）
        allow: [
          fileURLToPath(new URL('../..', import.meta.url)),
          fileURLToPath(new URL('../../packages', import.meta.url))
        ]
      },
      proxy: {
        '/api': {
          target: env.VITE_APP_PROXY_TARGET,
          // target: 'http://localhost:3279',
          changeOrigin: true,
          // 覆写,替换掉/api
          // rewrite: (path) => {
          //   // return path
          //   return path.replace(/^\/api/, '')
          // }
        },
        // 让静态资源 /upload/* 在开发环境同源访问，避免绝对 3279 链接
        '/upload': {
          // target: 'http://localhost:3279',
          target: env.VITE_APP_PROXY_TARGET,
          changeOrigin: true
        },
        '/fakeApi': {
          // target: 'http://localhost:3279',
          target: env.VITE_APP_PROXY_TARGET,
          changeOrigin: true,
          // 覆写,替换掉/api
          rewrite: (path) => {
            return path
            // return path.replace(/^\/api/, '')
          }
        },
      }
    }
  }
})


