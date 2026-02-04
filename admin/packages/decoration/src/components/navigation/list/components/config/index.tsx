import './index.scss'
import { computed, defineComponent, type PropType, reactive, ref, watch } from 'vue'
import { Button, message } from '@pkg/ui'
import { type Schema, SchemaForm } from '@pkg/jsf'
import { cloneDeep } from 'lodash'
import { SCENE_YESONG } from '@pkg/config'
import { $createNavigation, $updateNavigation } from '../../../../../api'
import PagesSelector from '../../../../../widget/pagesSelector'

type IImage = { url?: string; width?: number; height?: number }
type INavItem = {
  page?: { id?: string; name?: string }
  actionEnable?: boolean
  action?: any
  text?: string
  icon?: { normal?: IImage; active?: IImage }
  iconScale?: number
  iconWidth?: number
  iconHeight?: number
}

type INavConfig = {
  name?: string
  theme: 'common' | 'raised' | 'rudder'
  borderRadius: [number, number, number, number]
  menuMargin?: [number, number, number, number]
  menuPadding?: [number, number, number, number]
  backgroundColor: string
  color: string
  activeColor: string
  list: INavItem[]
}

type INavigationDetail = {
  id?: string
  name?: string
  scene?: string
  status?: number
  editUser?: string
  description?: string
  createTime?: string
  updateTime?: string
  config?: INavConfig
}

// 导航默认配置
const defaultConfig = (): INavConfig => ({
  name: '',
  theme: 'common',
  borderRadius: [0, 0, 0, 0],
  menuMargin: [0, 0, 0, 0],
  menuPadding: [10, 10, 10, 10],
  backgroundColor: 'rgba(255, 255, 255, 1)',
  color: '#999',
  activeColor: 'rgba(0, 0, 0, 1)',
  list: []
})

export default defineComponent({
  name: 'NavigationConfig',
  props: {
    data: {
      type: Object as PropType<INavigationDetail>,
      default: () => ({})
    }
  },
  emits: {
    close: () => true,
    refresh: () => true
  },
  setup(props, { emit }) {
    const state = reactive<INavConfig>(cloneDeep(props.data?.config ?? defaultConfig()))
    // 保证名称与外层一致（便于编辑态修改）
    if (!state.name && props.data?.name) state.name = props.data.name

    // 预览高亮索引，支持点击联动右侧选中项
    const activeIndex = ref(0)
    const isEdit = computed(() => !!props.data?.id)

    // 默认图标地址（新建菜单项时兜底）
    const DEFAULT_ICON_URL = 'http://222.77.126.187:8083/yeah-song/static/defaultMenuIcon/defaultIcon.png'
    const ACTIVE_ICON_URL = 'http://222.77.126.187:8083/yeah-song/static/defaultMenuIcon/activeIcon.gif'

    // 当新增菜单项时，自动填充默认的名称与图标
    watch(
      () => state.list.length,
      (len, prev) => {
        if (len > (prev ?? 0)) {
          const idx = len - 1
          const item = state.list[idx] ?? {}
          // 默认名称与页面名
          if (!item.text || item.text.trim().length === 0) item.text = `菜单${len}`
          item.page = item.page ?? { name: `菜单${len}` }
          // 默认图标
          item.icon = item.icon ?? { normal: {}, active: {} }
          item.icon.normal = item.icon.normal ?? {}
          item.icon.active = item.icon.active ?? {}
          if (!item.icon.normal.url) item.icon.normal.url = DEFAULT_ICON_URL
          if (!item.icon.active.url) item.icon.active.url = ACTIVE_ICON_URL
          // 新增项默认倍率按主题兜底（raised: 1.8，其他: 1）
          if (item.iconScale == null) item.iconScale = state.theme === 'raised' ? 1.8 : 1
          // 默认图标宽高
          if (item.iconWidth == null) item.iconWidth = 35
          if (item.iconHeight == null) item.iconHeight = 35
          state.list[idx] = item
        }
      },
      { immediate: false }
    )

    const schema: Schema = {
      title: '自定义导航栏',
      type: 'object',
      properties: {
        name: {
          title: '导航名称', type: 'string',
          required: true,
        },
        theme: {
          title: '导航样式',
          type: 'string',
          widget: 'select',
          config: {
            options: [
              { label: '普通', value: 'common' },
              { label: '立式', value: 'raised' },
              { label: '舵式（仅3/5个生效）', value: 'rudder' }
            ]
          }
        },
        backgroundColor: { title: '背景颜色', type: 'string', widget: 'color' },
        borderRadius: { title: '圆角', type: 'array', widget: 'border-radius' },
        color: { title: '文本颜色', type: 'string', widget: 'color' },
        activeColor: { title: '选中文本颜色', type: 'string', widget: 'color' },
        menuMargin: {
          title: '外边距',
          type: 'array',
          widget: 'padding'
        },
        menuPadding: {
          title: '内边距',
          type: 'array',
          widget: 'padding'
        },
        list: {
          title: '菜单列表',
          type: 'array',
          config: { maxLength: 5, itemTitle: '菜单' },
          items: {
            title: '节点',
            type: 'object',
            properties: {
              page: {
                title: '关联页面',
                type: 'object',
                // 若后续提供 PageSelector，再替换为组件
                properties: {
                  id: {
                    title: '展示页面',
                    type: 'string',
                    widget: PagesSelector
                  },
                }
              },
              action: {
                title: '点击动作',
                type: 'object',
                widget: 'action',
                enableKey: 'actionEnable'
              },
              text: {
                title: '文本内容',
                type: 'string',
                config: { maxlength: 6, placeholder: '最多6字' }
              },
              activeText: {
                title: '选中时文本',
                type: 'string',
                config: { maxlength: 6, placeholder: '最多6字' }
              },
              icon: {
                title: '图标',
                type: 'object',
                widget: 'suite',
                properties: {
                  normal: {
                    title: '默认图标',
                    type: 'object',
                    widget: 'image',
                    config: { ratio: '1:1', flex: 12, simple: true }
                  },
                  active: {
                    title: '选中图标',
                    type: 'object',
                    widget: 'image',
                    config: { ratio: '1:1', flex: 12, simple: true }
                  }
                }
              },
              iconWidth: {
                title: '图标宽度',
                type: 'number',
                config: { min: 12, max: 128, step: 1, placeholder: '默认35' }
              },
              iconHeight: {
                title: '图标高度',
                type: 'number',
                config: { min: 12, max: 128, step: 1, placeholder: '默认35' }
              },
              iconScale: {
                title: '图标放大倍率',
                type: 'number',
                config: { min: 0.5, max: 3, step: 0.1 }
              }
            }
          }
        }
      }
    }

    const loading = ref(false)

    const onSave = async () => {
      loading.value = true

      try {
        if (isEdit.value) {
          const res = await $updateNavigation(
            props.data!.id!,
            {
              name: state.name,
              status: props.data?.status,
              editUser: props.data?.editUser,
              scene: import.meta.env.VITE_APP_SCENE,
              description: props.data?.description,
              config: state
            }
          )
          if (res.code === 200 || res.success) {
            message.success(res.msg || '编辑成功')
            emit('refresh')
            emit('close')
          } else {
            message.error(res.msg || '编辑失败')
          }
        } else {
          const res = await $createNavigation({
            name: state.name,
            scene: SCENE_YESONG,
            status: 1,
            editUser: 'system',
            description: '自定义创建的导航',
            config: state
          })
          if (res.code === 200 || res.success) {
            message.success(res.msg || '创建成功')
            emit('refresh')
            emit('close')
          } else {
            message.error(res.msg || '创建失败')
          }
        }
      } catch (err: any) {
        message.error(err?.message || '保存失败')
      } finally {
        loading.value = false
      }
    }

    // 预览区点击后，尝试联动右侧 SchemaForm 的数组当前选中项
    const focusFormItemByIndex = (idx: number) => {
      const root = document.getElementById('deck-tab')
      if (!root) return
      // 竖向列表模式（default/widgets/array -> .w_array__item-wrap）
      const verticalItems = root.querySelectorAll('.w_array__item-wrap')
      if (verticalItems && verticalItems[idx]) {
        ;(verticalItems[idx] as HTMLElement).click()
        return
      }
      // 横向 tabs 模式（default/widgets/array -> .w_array-tabs .ant-tabs-tab）
      const tabItems = root.querySelectorAll('.w_array-tabs .ant-tabs-tab')
      if (tabItems && tabItems[idx]) {
        ;(tabItems[idx] as HTMLElement).click()
        return
      }
      // 兼容其它列表实现（若存在）
      const listItems = root.querySelectorAll('.sw_list__item')
      if (listItems && listItems[idx]) {
        ;(listItems[idx] as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }

    const TabBarStyle = computed(() => {
      const [tl, tr, bl, br] = state.borderRadius || [0, 0, 0, 0]
      const [mt, mr, mb, ml] = state.menuMargin || [0, 0, 0, 0]
      const [pt, pr, pb, pl] = state.menuPadding || [0, 0, 0, 0]
      return {
        borderTopLeftRadius: tl + 'px',
        borderTopRightRadius: tr + 'px',
        borderBottomLeftRadius: bl + 'px',
        borderBottomRightRadius: br + 'px',
        margin: `${mt}px ${mr}px ${mb}px ${ml}px`,
        padding: `${pt}px ${pr}px ${pb}px ${pl}px`,
      }
    })

    const TabBarPreview = () => {
      const items = (state.list || []).filter(Boolean)
      return (
        <div
          class="tabbar-preview"
          style={{
            '--tabbar-bg': state.backgroundColor,
            '--tabbar-color': state.color,
            '--tabbar-active-color': state.activeColor
          } as any}
        >
          <div class="tabbar-preview__viewport"/>
          <div
            class="tabbar-preview__bar"
            style={TabBarStyle.value}
          >
            {items.map((it, idx) => {
              const isActive = idx === activeIndex.value
              const iconUrl = (isActive ? it?.icon?.active?.url : it?.icon?.normal?.url) ||
                it?.icon?.normal?.url || it?.icon?.active?.url
              const scale = it?.iconScale ?? (state.theme === 'raised' ? 1.8 : 1)
              const width = it?.iconWidth ?? 35
              const height = it?.iconHeight ?? 35
              return (
                <div
                  class="tabbar-preview__item clickable"
                  onClick={() => {
                    activeIndex.value = idx
                    focusFormItemByIndex(idx)
                  }}
                >
                  {iconUrl ? (
                    <img src={iconUrl} class="tabbar-preview__icon" style={{ width: width + 'px', height: height + 'px', transform: `scale(${scale})`, transformOrigin: 'bottom center' }}/>
                  ) : (
                    <div class="tabbar-preview__icon tabbar-preview__icon--placeholder" style={{ width: width + 'px', height: height + 'px', transform: `scale(${scale})`, transformOrigin: 'bottom center' }}/>
                  )}
                  <span
                    class={isActive ? 'tabbar-preview__label tabbar-preview__label--active' : 'tabbar-preview__label'}>
                    {it?.text || it?.page?.name || `菜单${idx + 1}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )
    }

    return () => {
      return (
        <div class="deck-tab">
          <div class="deck-tab__content">
            <div class="deck-tab__preview">
              <TabBarPreview/>
            </div>
            <div class="deck-tab__config scroller">
              <SchemaForm
                theme="compact"
                id="deck-tab"
                schema={schema}
                value={state}
                onChange={(e) => {
                }}
                class="deck-schema-form"
              />
            </div>
          </div>
          <div class="deck-tab__footer">
            <Button disabled={loading.value} onClick={() => emit('close')}>
              取消
            </Button>
            <Button type="primary" loading={loading.value} onClick={onSave}>
              {isEdit.value ? '保存' : '创建'}
            </Button>
          </div>
        </div>
      )
    }
  }
})
