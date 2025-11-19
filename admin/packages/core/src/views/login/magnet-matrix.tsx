import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'magnet-matrix',
  setup() {
    const containerRef = ref<HTMLElement | null>(null)

    const enter = (e: MouseEvent) => {
      const el = containerRef.value
      if (!el) return
      el.style.setProperty('--mouse-x', String(e.clientX))
      el.style.setProperty('--mouse-y', String(e.clientY))
    }
    const move = (e: MouseEvent) => {
      const el = containerRef.value
      if (!el) return
      el.style.setProperty('--mouse-x', String(e.clientX))
      el.style.setProperty('--mouse-y', String(e.clientY))
    }
    const leave = (_e: MouseEvent) => {
      const el = containerRef.value
      if (!el) return
      el.style.setProperty('--mouse-x', '-999')
      el.style.setProperty('--mouse-y', '-999')
    }

    let paintSupported = false
    try {
      if ((CSS as any)?.paintWorklet?.addModule) {
        paintSupported = true
        // 注册自定义属性，确保数值类型被识别并触发重绘
        try {
          if ((CSS as any)?.registerProperty) {
            ;(CSS as any).registerProperty({ name: '--mouse-x', syntax: '<number>', inherits: false, initialValue: '0' })
            ;(CSS as any).registerProperty({ name: '--mouse-y', syntax: '<number>', inherits: false, initialValue: '0' })
            ;(CSS as any).registerProperty({ name: '--magnet-size', syntax: '<number>', inherits: false, initialValue: '1' })
            ;(CSS as any).registerProperty({ name: '--magnet-gap', syntax: '<number>', inherits: false, initialValue: '32' })
            ;(CSS as any).registerProperty({ name: '--magnet-radius', syntax: '<number>', inherits: false, initialValue: '200' })
            ;(CSS as any).registerProperty({ name: '--magnet-color', syntax: '<color>', inherits: false, initialValue: 'rgba(97, 123, 255, 0.35)' })
          }
        } catch (_e) { /* no-op */ }
        ;(CSS as any).paintWorklet.addModule(
        `data:application/javascript;charset=utf8,${encodeURIComponent(`
        class MagnetMatrixPaintWorklet {
          static get inputProperties() { return ['--mouse-x', '--mouse-y', '--magnet-color', '--magnet-size', '--magnet-gap', '--magnet-radius']; }
      
          paint(ctx, size, props) {
            const toNum = (v) => {
              try { return parseFloat(v?.toString?.() ?? String(v)) } catch(_e) { return NaN }
            }
            const mouseX = toNum(props.get('--mouse-x'))
            const mouseY = toNum(props.get('--mouse-y'))
            const color = props.get('--magnet-color')
            const lineWidth = toNum(props.get('--magnet-size')) || 1
            const gap = toNum(props.get('--magnet-gap')) || 32
            const radius = toNum(props.get('--magnet-radius')) || 200
            ctx.lineCap = "round";
            for (let i = 0; i * gap < size.width; i++) {
              for (let j = 0; j * gap < size.height; j++) {
                const posX = i * gap
                const posY = j * gap
                const distance = (isNaN(mouseX) || isNaN(mouseY)) ? Infinity : Math.sqrt(Math.pow(posX - mouseX, 2) + Math.pow(posY - mouseY, 2))
                const width = distance < radius ? (1 - distance / radius * distance / radius) * gap * 0.4 : 0
                const startPosX = posX - width * 0.5
                const endPosX = posX + width * 0.5
                const rotate = (isNaN(mouseX) || isNaN(mouseY)) ? 0 : Math.atan2(mouseY - posY, mouseX - posX)
      
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
      }
    } catch (_err) {
      paintSupported = false
    }

    onMounted(() => {
      // 绑定事件在挂载后，避免 ref 为空
      document.documentElement.addEventListener('mouseenter', enter, true)
      document.documentElement.addEventListener('mousemove', move, true)
      document.documentElement.addEventListener('mouseleave', leave, true)

      // 不支持 Paint Worklet 时启用回退样式
      if (!paintSupported && containerRef.value) {
        containerRef.value.classList.add('--fallback')
      }
    })

    onBeforeUnmount(() => {
      document.documentElement.removeEventListener('mouseenter', enter, true)
      document.documentElement.removeEventListener('mousemove', move, true)
      document.documentElement.removeEventListener('mouseleave', leave, true)
    })

    return () => {
      return <div ref={containerRef} class="magnet-matrix"></div>
    }
  }
})
