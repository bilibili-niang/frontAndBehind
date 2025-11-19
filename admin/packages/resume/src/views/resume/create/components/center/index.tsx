import './index.scss'
import { defineComponent, onMounted, ref, onBeforeUnmount, nextTick } from 'vue'
import { useResumeStore } from '@anteng/resume'
import Render from '../render'

export default defineComponent({
  setup() {
    const store = useResumeStore()
    const onDragOver = (e: DragEvent) => { e.preventDefault() }
    const onDrop = (e: DragEvent) => { e.preventDefault(); const type = e.dataTransfer?.getData('text/plain') || ''; if (type) store.add(type) }

    const offsetX = ref(0)
    const offsetY = ref(80)
    const dragging = ref(false)
    let startY = 0
    let startX = 0
    let startOffset = 0
    let startOffsetX = 0
    const centerRef = ref<HTMLElement | null>(null)
    const wrapperRef = ref<HTMLElement | null>(null)

    const onHandleDown = (e: MouseEvent) => {
      dragging.value = true
      startY = e.clientY
      startX = e.clientX
      startOffset = offsetY.value
      startOffsetX = offsetX.value
      console.log('drag:start', {
        startX,
        startY,
        offsetX: offsetX.value,
        offsetY: offsetY.value,
        center: { w: centerRef.value?.clientWidth, h: centerRef.value?.clientHeight },
        wrapper: { w: wrapperRef.value?.offsetWidth, h: wrapperRef.value?.offsetHeight }
      })
      window.addEventListener('mousemove', onHandleMove)
      window.addEventListener('mouseup', onHandleUp)
    }
    const onHandleMove = (e: MouseEvent) => {
      if (!dragging.value) return
      const dy = e.clientY - startY
      const dx = e.clientX - startX
      const nextY = startOffset + dy
      const nextX = startOffsetX + dx
      const center = centerRef.value
      const wrapper = wrapperRef.value
      const maxY = Math.max(0, (center?.clientHeight || 0) - (wrapper?.offsetHeight || 0) - 24)
      const maxX = Math.max(0, (center?.clientWidth || 0) - (wrapper?.offsetWidth || 0) - 24)
      offsetY.value = Math.max(0, Math.min(nextY, maxY))
      offsetX.value = Math.max(0, Math.min(nextX, maxX))
      console.log('drag:move', { dx, dy, nextX, nextY, maxX, maxY, offsetX: offsetX.value, offsetY: offsetY.value })
    }
    const onHandleUp = () => {
      dragging.value = false
      window.removeEventListener('mousemove', onHandleMove)
      window.removeEventListener('mouseup', onHandleUp)
      console.log('drag:end', { offsetX: offsetX.value, offsetY: offsetY.value })
    }

    onMounted(async () => {
      await nextTick()
      const center = centerRef.value
      const wrapper = wrapperRef.value
      const cw = center?.clientWidth || 0
      const ww = wrapper?.offsetWidth || 0
      offsetX.value = Math.max(0, Math.floor((cw - ww) / 2))
    })
    onBeforeUnmount(() => onHandleUp())

    return () => (
      <div class="resume-center" ref={(el) => (centerRef.value = el as HTMLElement)} onDragover={onDragOver} onDrop={onDrop}>
        <div class="a4-drag-wrapper" ref={(el) => (wrapperRef.value = el as HTMLElement)} style={{ transform: `translate(${offsetX.value}px, ${offsetY.value}px)` }}>
          <div class="a4-drag-handle" onMousedown={onHandleDown}>拖动页面</div>
          <Render />
        </div>
      </div>
    )
  }
})