import type { UserConfigExport } from '@tarojs/cli'

export default {
  logger: {
    quiet: false,
    stats: true
  },
  mini: {},
  h5: {
    devServer: {
      port: 3000,
      // 关闭警告遮罩，仅在真正报错时显示覆盖层
      client: {
        overlay: {
          warnings: false,
          errors: true
        }
      },
      proxy: {
        '/api': {
          target: process.env.TARO_APP_REQUEST_PROXY_TARGET,
          ws: false,
          changeOrigin: true
        }
      }
    }
  }
} satisfies UserConfigExport
