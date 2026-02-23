import './index.scss'
import { defineComponent, onMounted, ref, onBeforeUnmount, nextTick, watch } from 'vue'
import { useResumeStore } from '@pkg/resume'
import Render from '../render'

export default defineComponent({
  setup() {
    const store = useResumeStore()
    const onDragOver = (e: DragEvent) => { e.preventDefault() }
    const onDrop = (e: DragEvent) => { 
      e.preventDefault(); 
      const type = e.dataTransfer?.getData('text/plain') || ''; 
      if (!type) return

      if (type === 'basic-info' || type === 'summary') {
        store.setActiveModule('profile', type === 'summary' ? 'summary' : 'profile')
      } else if (type === 'style') {
        store.setActiveModule('style', 'style')
      } else if (type === 'education') {
        const newId = store.addListItem('educations', { school: 'New School' })
        store.setActiveModule(newId, 'education')
      } else if (type === 'work') {
        const newId = store.addListItem('experiences', { company: 'New Company' })
        store.setActiveModule(newId, 'work')
      } else if (type === 'project') {
        const newId = store.addListItem('projects', { name: 'New Project' })
        store.setActiveModule(newId, 'project')
      } else if (type === 'skills') {
        store.setActiveModule('skills', 'skills')
      }
    }

    const offsetX = ref(store.themeConfig.canvasOffsetX ?? 0)
    const offsetY = ref(store.themeConfig.canvasOffsetY ?? 80)
    const dragging = ref(false)
    let startY = 0
    let startX = 0
    let startOffset = 0
    let startOffsetX = 0
    const centerRef = ref<HTMLElement | null>(null)
    const wrapperRef = ref<HTMLElement | null>(null)
    const computeCenterX = () => {
      const center = centerRef.value
      const wrapper = wrapperRef.value
      const cw = center?.clientWidth || 0
      const ww = wrapper?.offsetWidth || 0
      return Math.max(0, Math.floor((cw - ww) / 2))
    }

    const onHandleDown = (e: MouseEvent) => {
      dragging.value = true
      startY = e.clientY
      startX = e.clientX
      startOffset = offsetY.value
      startOffsetX = offsetX.value
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
      
      // 修正边界计算逻辑
      // 允许 wrapper 向上移动（offsetY 为负），以便查看底部内容
      // 限制范围：
      // 1. 顶部限制：wrapper 底部不能高于 center 顶部 (minY)
      // 2. 底部限制：wrapper 顶部不能低于 center 底部 (maxY)
      
      const wrapperHeight = wrapper?.offsetHeight || 0
      const centerHeight = center?.clientHeight || 0
      const wrapperWidth = wrapper?.offsetWidth || 0
      const centerWidth = center?.clientWidth || 0

      // 垂直方向：允许更自由的拖动，只要有一部分在可视区域内即可
      // 比如保留 100px 的重叠区域
      const minY = -(wrapperHeight - 100) 
      const maxY = centerHeight - 100

      // 水平方向同理
      const minX = -(wrapperWidth - 100)
      const maxX = centerWidth - 100
      
      offsetY.value = Math.max(minY, Math.min(nextY, maxY))
      offsetX.value = Math.max(minX, Math.min(nextX, maxX))
      
    }
    const onHandleUp = () => {
      dragging.value = false
      window.removeEventListener('mousemove', onHandleMove)
      window.removeEventListener('mouseup', onHandleUp)
      store.updateTheme({ canvasOffsetX: offsetX.value, canvasOffsetY: offsetY.value })
    }
    const onBackgroundClick = () => {
      if (!dragging.value) {
        store.setActiveModule(null, null)
      }
    }

    onMounted(async () => {
      await nextTick()
      const center = centerRef.value
      const wrapper = wrapperRef.value
      const cw = center?.clientWidth || 0
      const ww = wrapper?.offsetWidth || 0
      if (store.themeConfig.canvasOffsetX === undefined || store.themeConfig.canvasOffsetX === null) {
        offsetX.value = Math.max(0, Math.floor((cw - ww) / 2))
      } else {
        offsetX.value = store.themeConfig.canvasOffsetX || 0
      }
      if (store.themeConfig.canvasOffsetY !== undefined && store.themeConfig.canvasOffsetY !== null) {
        offsetY.value = store.themeConfig.canvasOffsetY || 0
      }
    })
    
    watch(
      () => [store.themeConfig.canvasOffsetX, store.themeConfig.canvasOffsetY],
      ([x, y]) => {
        if (dragging.value) return
        offsetX.value = (x ?? computeCenterX())
        offsetY.value = (y ?? offsetY.value)
      },
      { immediate: true }
    )
    onBeforeUnmount(() => onHandleUp())

    return () => (
      <div class="resume-center" ref={(el) => (centerRef.value = el as HTMLElement)} onDragover={onDragOver} onDrop={onDrop} onClick={onBackgroundClick}>
        <div class="a4-drag-wrapper" ref={(el) => (wrapperRef.value = el as HTMLElement)} style={{ transform: `translate(${offsetX.value}px, ${offsetY.value}px)` }}>
          <div class="a4-drag-handle" onMousedown={onHandleDown}>拖动页面</div>
          <Render />
        </div>
      </div>
    )
  }
})
