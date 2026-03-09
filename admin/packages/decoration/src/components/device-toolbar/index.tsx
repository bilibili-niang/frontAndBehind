import './style.scss'
import { defineComponent, computed } from 'vue'
import { Icon } from '@pkg/ui'
import { useDecorationStore } from '../../store'

export default defineComponent({
  name: 'DeviceToolbar',
  props: {},
  setup() {
    const store = useDecorationStore()
    const presets = [0.5, 0.67, 0.75, 1.0, 1.2, 1.5, 2.0]
    const percentText = computed(() => `${Math.round(store.zoom * 100)}%`)
    const stepZoom = (dir: 'in' | 'out') => {
      // 找到最近的预设值
      let idx = presets.findIndex((p) => Math.abs(p - store.zoom) < 0.001)
      if (idx < 0) {
        // 不在预设中，找到最接近的索引
        let nearest = 0
        let minDelta = Infinity
        presets.forEach((p, i) => {
          const d = Math.abs(p - store.zoom)
          if (d < minDelta) {
            minDelta = d
            nearest = i
          }
        })
        idx = nearest
      }
      const nextIdx = dir === 'in' ? Math.min(idx + 1, presets.length - 1) : Math.max(idx - 1, 0)
      store.setZoom(presets[nextIdx])
    }
    return () => (
      <div class="device-toolbar w-full flex items-center justify-between px-3 py-1">
        <div class="left">
          <span class="chip bg-[var(--ice-color-bg-500)] text-[var(--color-text-secondary)] border border-[var(--color-border-base)] rounded-full px-2 py-0.5 text-xs mr-2">设备：iPhone6/7/8</span>
          <div class="zoom-control" title="缩放">
            <button class="ctrl-btn" aria-label="缩小" onClick={() => stepZoom('out')}>
              <Icon name="zoom-out" />
            </button>
            <span class="label">自适应：</span>
            <span class="percent">{percentText.value}</span>
            <button class="ctrl-btn" aria-label="放大" onClick={() => stepZoom('in')}>
              <Icon name="zoom-in" />
            </button>
          </div>
        </div>
        <div class="right">
          <span class="btn text-[var(--color-text-secondary)] px-2 text-xs cursor-pointer">快捷</span>
          <span class="btn text-[var(--color-text-secondary)] px-2 text-xs cursor-pointer">预览</span>
        </div>
      </div>
    )
  }
})