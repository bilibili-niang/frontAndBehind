import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, PropType, ref, watch } from 'vue'
import './style.scss'
import StatusBar from '../status-bar'
import MpMenu from '../mp-menu'
import CustomMenu from '../suctom-menu'
import useEditorStore from '../../../../stores/editor'
import { withUnit } from '../../../../utils'
import { defaultsDeep } from 'lodash'
import { emitter } from '@anteng/core'
import useCanvasStore from '../../../../stores/canvas'
import { useDecorationStore } from '../../../../store'

/**
 * 导航组件的默认配置：
 * - theme/title：主题与标题
 * - navigationBarTextStyle / navigationBarTextStyleFixed：前景文字颜色（滚动前/滚动后）
 * - backgroundColor：背景色（非图片时使用）
 * - immersion：是否启用沉浸式（头部不占位，内容上移）
 * - foreground：前景/扩散区域设置（图片或颜色、扩散高度等）
 */
const defaultOptions = () => ({
  theme: 'basic',
  title: '导航栏标题',
  navigationBarTextStyle: 'black',
  navigationBarTextStyleFixed: 'black',
  backgroundColor: '#ffffff',
  immersion: false,
  foreground: {
    enable: false,
    type: 'color',
    backgroundColor: '#59A9FF',
    backgroundHeight: 250
  }
})

export default defineComponent({
  name: 'w_basic-navigator',
  props: {
    options: {
      type: Object as PropType<any>,
      default: defaultOptions
    },
    theme: {
      type: String,
      default: 'default'
    }
  },
  setup(props) {
    const editorStore = useEditorStore()
    const decorationStore = useDecorationStore()
    /** 合并外部传入的 options 与默认配置，得到最终的导航配置 */
    const navigatorRef = computed(() => defaultsDeep(props.options, defaultOptions()))

    /** 是否启用沉浸式导航（内容与导航叠加显示） */
      // 兼容 immersive/immersion 两种字段，避免配置命名差异导致判断错误
    const isImmersion = computed(() => navigatorRef.value.immersive ?? navigatorRef.value.immersion)
    /** 是否使用自定义主题（仅渲染顶部菜单，无标准背景/标题） */
    const isCustom = computed(() => {
      return props.theme === 'custom'
    })

    /** 导航外层样式：沉浸式时通过负 margin 让内容上移并覆盖导航 */
    const navStyle = computed(() => {
      return {
        marginBottom: isImmersion.value ? withUnit(-88) : undefined,
      }
    })

    /**
     * 背景层样式（背景渲染）：
     * - type === 'image'：使用背景图，固定 100% 对齐底部，并根据配置的高度偏移
     * - 其他：使用背景色；当未启用前景且非沉浸式时不透明，否则随滚动 tween 渐变
     */
    const navBgStyle = computed(() => {
      const { enable, type, backgroundImage, backgroundHeight } = navigatorRef.value.foreground
      if (type === 'image') {
        return {
          backgroundImage: `url(${backgroundImage?.url})`,
          backgroundPosition: `0 calc(100% - ${withUnit(-backgroundHeight)})`,
          opacity: 1
        }
      }
      return {
        backgroundColor: navigatorRef.value.backgroundColor,
        opacity: !enable && !isImmersion.value ? 1 : scrollTween.value
      }
    })
    /**
     * 扩散/前景层样式（前景渲染）：
     * - enable=false：不渲染前景层
     * - type === 'image'：渲染图片前景，前景高度 = 导航高度(88) + 配置高度
     * - 其他：渲染颜色前景，支持 dynamicColor（动态主题色联动）
     */
    const diffusionStyle = computed(() => {
      const {
        enable,
        type,
        backgroundColor,
        backgroundImage,
        backgroundHeight,
        dynamicColor = false
      } = navigatorRef.value.foreground
      if (!enable) {
        return undefined
      }
      if (type === 'image') {
        return {
          backgroundImage: `url(${backgroundImage?.url})`,
          height: withUnit(88 + backgroundHeight)
        }
      }

      return {
        backgroundColor: (dynamicColor && tempTheme.value) || backgroundColor,
        height: withUnit(88 + backgroundHeight)
      }
    })

    /** 滚动插值（0~1），用于控制背景/前景透明度渐变与文字颜色切换 */
    const scrollTween = ref(0)
    // 调试：占位层引用与状态输出
    const placeholderRef = ref<HTMLElement | null>(null)
    // 调试开关：只有当 localStorage.navDebug === '1' 时才输出日志
    const navDebug = typeof window !== 'undefined' && localStorage.getItem('navDebug') === '1'

    // 调试：统一的布局日志方法
    const logLayout = (phase: string) => {
      if (!navDebug) return
      try {
        const wrapper = document.querySelector('.w_basic-nav-wrapper') as HTMLElement | null
        const ph = placeholderRef.value
        const df = document.querySelector('.w_basic-nav__diffusion') as HTMLElement | null
        const rectPh = ph?.getBoundingClientRect()
        const rectDf = df?.getBoundingClientRect()
        const csPh = ph && window.getComputedStyle(ph)
        const csDf = df && window.getComputedStyle(df)
        const children = wrapper ? Array.from(wrapper.children).map(el => (el as HTMLElement).className) : []
        console.groupCollapsed(`[basic-nav] layout@${phase}`)
        console.log({
          isImmersion: isImmersion.value,
          scrollTween: scrollTween.value,
          placeholderRect: rectPh,
          diffusionRect: rectDf,
          placeholderStyle: csPh && {
            position: csPh.position,
            zIndex: csPh.zIndex,
            top: csPh.top,
            height: csPh.height
          },
          diffusionStyle: csDf && {
            position: csDf.position,
            zIndex: csDf.zIndex,
            top: csDf.top,
            height: csDf.height
          },
          children
        })
        console.groupEnd()
      } catch (err) {
        console.log('[basic-nav] layout log error', err)
      }
    }

    onMounted(() => {
      document.querySelector('.deck-editor-render__viewport')?.addEventListener('scroll', onScroll)
      if (navDebug) {
        // 控制台输出关键状态，便于定位顶贴问题
        console.log('[basic-nav] mount', {
          isImmersion: isImmersion.value,
          foreground: navigatorRef.value?.foreground,
          diffusionStyle: diffusionStyle.value,
          navBgStyle: navBgStyle.value
        })
        // 输出占位层在视口中的位置
        try {
          const rect = placeholderRef.value?.getBoundingClientRect()
          rect && console.log('[basic-nav] placeholder rect', rect)
        } catch (err) {
        }
      }
      nextTick(() => logLayout('mounted-nextTick'))
    })

    const onScroll = (e: any) => {
      let t = (e.target as HTMLElement).scrollTop / (80 * editorStore.scale)
      t = t > 1 ? 1 : t < 0 ? 0 : t
      scrollTween.value = t
    }

    onBeforeUnmount(() => {
      document
        .querySelector('.deck-editor-render__viewport')
        ?.removeEventListener('scroll', onScroll)
      emitter.off(`nav-swiper-theme-color-${currentPageId.value}`, onThemeChange as any)
    })

    /* ---------------------------------- 轮播图联动 --------------------------------- */
    /** 当前画布页面 id，用于事件通道区分不同页面的主题联动 */
    const currentPageId = computed(() => useCanvasStore().id)
    /** 临时主题色：当轮播图广播颜色时用于动态渲染前景 */
    const tempTheme = ref<string | null>(null)
    /** 主题色变化事件处理 */
    const onThemeChange = (color: string | null) => {
      tempTheme.value = color
      try {
        console.log('[basic-nav] onThemeChange', {
          pageId: currentPageId.value,
          color
        })
      } catch {}
    }
    /** 监听带页面通道的主题色事件，实现前景的动态颜色联动 */
    emitter.on(`nav-swiper-theme-color-${currentPageId.value}`, onThemeChange as any)
    /* ---------------------------------- 轮播图联动 --------------------------------- */

    // 调试：状态变更日志（开启 navDebug 时输出最小必要集）
    watch(isImmersion, (val, old) => {
      if (navDebug) {
        console.log('[basic-nav] immersion changed', { val, old })
      }
      nextTick(() => logLayout('immersion-change'))
    })
    watch(() => navigatorRef.value.foreground, (val, old) => {
      if (navDebug) {
        console.log('[basic-nav] foreground changed', val)
      }
      nextTick(() => logLayout('foreground-change'))
    }, { deep: true })

    watch(scrollTween, (value, preValue) => {
      if (navDebug && ((value <= 0.5 && preValue > 0.5) || (value > 0.5 && preValue <= 0.5))) {
        const { navigationBarTextStyle, navigationBarTextStyleFixed } = navigatorRef.value
        console.log('[basic-nav] text color threshold', {
          value,
          navigationBarTextStyle,
          navigationBarTextStyleFixed
        })
      }
    })

    return () => {
      if (!navigatorRef.value) return null
      const { navigationBarTextStyle, navigationBarTextStyleFixed } = navigatorRef.value
      // 左侧按钮显隐的控制对象 {leftBack : boolean , leftMenu :boolean}
      const showButtons = computed(() => {
        return decorationStore.pageValue.basic.buttons
      })

      // 返回按钮的控制
      const showBackButtonCfg = computed(() => {
        return decorationStore.pageValue.basic.buttons?.leftBack
      })
      // 快捷菜单的控制
      const showMenuButtonCfg = computed(() => {
        return decorationStore.pageValue.basic.buttons?.leftMenu
      })

      // 左侧是否需要渲染（只要两者其一为 true 即显示）
      const showLeftMenu = computed(() => !!(showBackButtonCfg.value || showMenuButtonCfg.value))

      const showRightMenu = true // 右侧按钮不受显隐控制，始终展示

      return (
        <div
          class={{
            'p_custom': true,
          }}
        >
          {!isCustom.value && (
            <div
              class="w_basic-nav-wrapper"
              style={navStyle.value}
            >
              <div
                class={[
                  'w_basic-nav',
                  `w_basic-nav--${
                    scrollTween.value < 0.5 ? navigationBarTextStyle : navigationBarTextStyleFixed
                  }`
                ]}
              >
                <StatusBar/>
                <div class="w_basic-nav__content">
                  <div class="w_basic-nav__bg" style={navBgStyle.value}></div>
                  <div class="w_basic-nav__content">
                    {showLeftMenu.value && (
                      <div
                        class={['w_basic-nav__menu', 'clickable', !(showBackButtonCfg.value && showMenuButtonCfg.value) ? '--no-shadow' : undefined]}
                      >
                        <CustomMenu
                          backIcon={!!showBackButtonCfg.value}
                          menuIcon={!!showMenuButtonCfg.value}
                        />
                      </div>
                    )}
                    <div class="w_basic-nav__view">
                      <div class="w_basic-nav__title">{navigatorRef.value.title}</div>
                    </div>
                    {1 && (
                      <div class="w_basic-nav__menu weapp clickable">
                        <MpMenu/>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* 先渲染占位层，确保在正常文档流首位，从而顶贴顶部 */}
              {!isImmersion.value && (
                <div
                  class="w_basic-nav-placeholder"
                  ref={el => (placeholderRef.value = el as HTMLElement)}
                ></div>
              )}
              {navigatorRef.value.foreground?.enable && (
                <div
                  class="w_basic-nav__diffusion"
                  style={diffusionStyle.value}
                ></div>
              )}
            </div>
          )}
          {showRightMenu && (
            <div class="w_basic-nav-wrapper top-index" style={navStyle.value}>
              <div
                class={[
                  'w_basic-nav',
                  `w_basic-nav--${
                    scrollTween.value < 0.5 ? navigationBarTextStyle : navigationBarTextStyleFixed
                  }`
                ]}
              >
                <StatusBar/>
                <div class="w_basic-nav__content">
                  <div class="w_basic-nav__content">
                    <div class="w_basic-nav__menu weapp clickable">
                      <MpMenu/>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )
    }
  }
})
