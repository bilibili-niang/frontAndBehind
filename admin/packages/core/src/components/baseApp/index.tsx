import { ConfigProvider, } from '@anteng/ui'
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { PREFIX_CLS } from '@anteng/config'
import zhCN from 'ant-design-vue/locale/zh_CN'
import { theme as antdTheme } from 'ant-design-vue'

export default defineComponent({
  name: 'BaseApp',
  setup(props, { slots }) {
    const themeVersion = ref(0)
    const onThemeChange = () => {
      themeVersion.value++
    }
    onMounted(() => window.addEventListener('theme-change', onThemeChange))
    onBeforeUnmount(() => window.removeEventListener('theme-change', onThemeChange))

    return () => {
      // 建立响应依赖，主题变化时重新计算
      void themeVersion.value
      const isDark = document.documentElement.getAttribute('theme') === 'dark'
      const themeConfig = {
        inherit: true,
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          // colorText: 'var(--color-text-base)',
          // colorTextSecondary: 'var(--color-text-secondary)',
          // colorTextTertiary: 'var(--color-text-tertiary)',
          // colorTextQuaternary: 'var(--color-text-disabled)',
          // colorPrimary: 'var(--color-4)',
          // colorPrimaryHover: 'var(--color-5)',
          // colorPrimaryActive: 'var(--color-7)',
          // colorLink: 'var(--color-6)',
          // colorLinkHover: 'var(--color-5)',
          // colorLinkActive: 'var(--color-7)',
        }
      } as any
      return (
        <ConfigProvider prefixCls={PREFIX_CLS} locale={zhCN} theme={themeConfig}>
          <div class={`${PREFIX_CLS}-base-app`}>{slots.default?.()}</div>
          <Progress/>
        </ConfigProvider>
      )
    }
  }
})

const progress = ref(1)

export const AppProgress = {
  start: () => {
    progress.value = 0
  },
  done: () => {
    progress.value = 1
  }
}

const Progress = defineComponent({
  setup() {
    return () => {
      return (
        <div class={['base-app-progress', progress.value >= 1 && 'base-app-progress--done']}>
          <div class="base-app-progress__bar"></div>
        </div>
      )
    }
  }
})
