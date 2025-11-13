import { defineComponent, onBeforeUnmount, ref } from 'vue'

export default defineComponent({
  name: 'magnet-matrix',
  setup() {
    const containerRef = ref()

    const enter = (e: MouseEvent) => {
      containerRef.value.style.setProperty('--mouse-x', e.clientX)
      containerRef.value.style.setProperty('--mouse-y', e.clientY)
    }
    const move = (e: MouseEvent) => {
      containerRef.value.style.setProperty('--mouse-x', e.clientX)
      containerRef.value.style.setProperty('--mouse-y', e.clientY)
    }
    const leave = (e: MouseEvent) => {
      containerRef.value.style.setProperty('--mouse-x', '-999')
      containerRef.value.style.setProperty('--mouse-y', '-999')
    }

    document.documentElement.addEventListener('mouseenter', enter, true)
    document.documentElement.addEventListener('mousemove', move, true)
    document.documentElement.addEventListener('mouseleave', leave, true)

    onBeforeUnmount(() => {
      document.documentElement.removeEventListener('mouseenter', enter, true)
      document.documentElement.removeEventListener('mousemove', move, true)
      document.documentElement.removeEventListener('mouseleave', leave, true)
    })

    try {
      ;(CSS as any).paintWorklet.addModule(
        `data:application/javascript;charset=utf8,${encodeURIComponent(`
        class MagnetMatrixPaintWorklet {
          static get inputProperties() { return ['--mouse-x', '--mouse-y', '--magnet-color', '--magnet-size', '--magnet-gap', '--magnet-radius']; }
      
          paint(ctx, size, props) {
            const mouseX = parseInt(props.get('--mouse-x'))
            const mouseY = parseInt(props.get('--mouse-y'))
            const color = props.get('--magnet-color')
            const lineWidth = parseInt(props.get('--magnet-size'))
            const gap = parseInt(props.get('--magnet-gap'))
            const radius = parseInt(props.get('--magnet-radius'))
            ctx.lineCap = "round";
            for (let i = 0; i * gap < size.width; i++) {
              for (let j = 0; j * gap < size.height; j++) {
                const posX = i * gap
                const posY = j * gap
                const distance = Math.sqrt(Math.pow(posX - mouseX, 2) + Math.pow(posY - mouseY, 2))
                const width = distance < radius ? (1 - distance / radius * distance / radius) * gap * 0.4 : 0
                const startPosX = posX - width * 0.5
                const endPosX = posX + width * 0.5
                const rotate = Math.atan2(mouseY - posY, mouseX - posX)
      
                ctx.save()
                ctx.beginPath();
                ctx.translate(posX, posY);
                ctx.rotate(rotate);
                ctx.translate(-posX, -posY);
                ctx.moveTo(startPosX, posY);
                ctx.strokeStyle = color
                ctx.lineWidth = lineWidth;
                ctx.lineCap = "round";
                ctx.lineTo(endPosX, posY);
                ctx.stroke()
                ctx.closePath()
                ctx.restore()
              }
            }
          }
        }
        registerPaint('magnet-matrix', MagnetMatrixPaintWorklet);
      `)}`
      )
    } catch (err) {
      err
    }

    return () => {
      return <div ref={containerRef} class="magnet-matrix"></div>
    }
  }
})
