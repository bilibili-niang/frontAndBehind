import { defineComponent, onMounted } from 'vue'
import QRCode from 'qrcode'
import { uuid } from '@anteng/utils'
import { commonQRCodePropsDefine } from './common'
import './style.scss'

export default defineComponent({
  name: 'anteng-qr-code',
  props: commonQRCodePropsDefine,
  setup(props) {
    const canvasId = `qr-code-${uuid()}`
    const sizeNumber = Number(props.size) * devicePixelRatio
    const logoSizeNumber = Number(props.logoSize) * devicePixelRatio
    const draw = () => {
      const canvas = document.getElementById(canvasId) as HTMLCanvasElement
      QRCode.toCanvas(
        canvas,
        props.content,
        {
          width: sizeNumber,
          margin: 0,
          errorCorrectionLevel: props.correctLevel as any,
          color: {
            dark: props.color,
            light: props.backgroundColor
          }
        },
        () => {
          drawImage()
        }
      )
    }

    const drawImage = () => {
      if (!props.logo) return void 0
      const image = new Image()
      image.crossOrigin = 'Anonymous'
      image.src = props.logo
      image.onload = () => {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement
        const ctx = canvas.getContext('2d')!
        const dx = sizeNumber / 2 - logoSizeNumber / 2
        const dy = sizeNumber / 2 - logoSizeNumber / 2
        ctx.drawImage(image, dx, dy, logoSizeNumber, logoSizeNumber)
      }
    }

    onMounted(() => {
      draw()
    })
    return () => {
      return (
        <div class="anteng-qr-code">
          <canvas class="anteng-qr-code__canvas" id={canvasId}></canvas>
        </div>
      )
    }
  }
})
