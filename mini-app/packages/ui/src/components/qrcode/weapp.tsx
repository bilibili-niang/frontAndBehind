import { uuid } from '@pkg/utils'
import { Canvas } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { defineComponent, onMounted } from 'vue'
import drawQrcode from '../../utils/qrcode'
import { commonQRCodePropsDefine } from './common'

const QrCode = defineComponent({
  props: commonQRCodePropsDefine,
  setup(props) {
    const correctLevel = { L: 1, M: 0, Q: 3, H: 2 }[props.correctLevel] ?? 1

    console.log(correctLevel)

    const canvasId = `qr-code-${uuid()}`

    const query = Taro.createSelectorQuery().select(`#${canvasId}`).fields({ node: true, size: true })

    onMounted(() => {
      draw()
    })

    const draw = () => {
      const sizeNumber = parseFloat(Taro.pxTransform(props.size))
      const logoSizeNumber = parseFloat(Taro.pxTransform(props.logoSize))
      query.exec(res => {
        console.log(res)
        const canvas = res[0].node
        canvas.width = sizeNumber
        canvas.height = sizeNumber
        const ctx = canvas.getContext('2d')
        ctx.setFillStyle =
          ctx.setFillStyle ??
          ((color: string) => {
            ctx.fillStyle = color
          })
        const options = {
          width: sizeNumber,
          height: sizeNumber,
          canvasId: 'custom_qrcode',
          text: props.content,
          foreground: props.color,
          background: props.backgroundColor,
          ctx,
          canvas,
          correctLevel,
          callback: () => {
            Taro.canvasToTempFilePath({
              canvas,
              success: r => {
                props.callback?.(r.tempFilePath)
              }
            })
          }
        }
        if (props.logo) {
          Taro.getImageInfo({
            src: props.logo,
            success(result) {
              drawQrcode({
                ...options,
                image: {
                  imageResource: result.path,
                  dx: sizeNumber / 2 - logoSizeNumber / 2,
                  dy: sizeNumber / 2 - logoSizeNumber / 2,
                  dWidth: logoSizeNumber,
                  dHeight: logoSizeNumber
                }
              })
            }
          })
        } else {
          drawQrcode(options)
        }
      })
    }

    return () => (
      <Canvas
        style={{
          width: '100%',
          height: '100%'
        }}
        id={canvasId}
        canvasId={canvasId}
        type="2d"
      />
    )
  }
})

export default QrCode
