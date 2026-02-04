import { onMounted, nextTick } from 'vue'
import gsap from 'gsap'

/**
 * 列表交错入场动画 Hook
 * @param selector 列表项的选择器 (例如 '.list-item')
 * @param containerRef 容器的 ref (可选，用于限定查找范围)
 * @param options GSAP 配置项
 */
export const useGsapList = (
  selector: string,
  options: gsap.TweenVars = {}
) => {
  const animate = () => {
    nextTick(() => {
      const elements = document.querySelectorAll(selector)
      if (elements.length === 0) return

      gsap.fromTo(
        elements,
        {
          opacity: 0,
          y: 30,
          scale: 0.95
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.4,
          stagger: 0.05,
          ease: 'power2.out',
          clearProps: 'all', // 动画结束后清除内联样式，避免影响后续交互
          ...options
        }
      )
    })
  }

  onMounted(() => {
    animate()
  })

  return {
    animate
  }
}
