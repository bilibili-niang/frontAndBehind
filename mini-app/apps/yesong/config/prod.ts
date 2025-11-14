import type { UserConfigExport } from '@tarojs/cli'

export default {
  env: {
    NODE_ENV: '"production"'
  },
  mini: {},
  h5: {
    /** 生产构建：关闭压缩并开启 source map，便于问题定位 */
    webpackChain(chain) {
      // 关闭 JS/CSS 压缩混淆（包括所有 minimizer）
      chain.optimization.minimize(false)

      // 非压缩文件名，便于定位
      chain.output.filename('js/[name].js')
      chain.output.chunkFilename('js/[name].js')

      // 开启源码映射
      chain.devtool('source-map')
    }
  }
} satisfies UserConfigExport
