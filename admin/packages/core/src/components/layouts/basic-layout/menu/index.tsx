import { type PropType, computed, defineComponent, ref } from 'vue'
import './style.scss'

import { type RouteRecordRaw, useRoute, useRouter } from 'vue-router'
import useBasicLayoutStore from '../../../../stores/basic-layout'
import { storeToRefs } from 'pinia'
import { PREFIX_CLS } from '@anteng/config'
import { Icon } from '@anteng/ui'

type MenuNode = RouteRecordRaw & {
  children?: MenuNode[]
  meta?: {
    title?: string
    icon?: string
    hidden?: boolean
  }
}

const MenuNode = defineComponent({
  name: 'BasicLayoutMenuNode',
  props: {
    node: {
      type: Object as PropType<MenuNode>,
      required: true
    },
    depth: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const router = useRouter()
    const route = useRoute()

    const isActive = computed(() => {
      return route.path === props.node.path || route.matched.find((item) => item.path === props.node.path)
    })

    const indentStyle = computed(() => {
      return `width: ${props.depth * 36}px;`
    })
    const children = computed(
      () =>
        props.node.children?.filter((item) => {
          return item.meta?.hiddenInMenu !== true
        }) || []
    )
    const hasChildren = computed(() => children.value.length! > 0)
    const isFold = ref(!isActive.value)
    const handleClick = () => {
      if (hasChildren.value) {
        isFold.value = !isFold.value
      } else {
        router.push(props.node.path)
      }
    }
    return () => {
      const icon = props.node.meta?.icon || 'icon-lose'
      return (
        <>
          <div
            class={[
              `${PREFIX_CLS}-basic-layout__menu-node`,
              'clickable',
              hasChildren.value && '--folder',
              isActive.value && '--active'
            ]}
            onClick={handleClick}
          >
            {props.depth === 0 ? (
              <Icon
                class="menu-node__icon"
                style={{
                  backgroundImage: `url(${icon})`
                }}
                name={icon}
              ></Icon>
            ) : (
              <span style={indentStyle.value}></span>
            )}
            <div class="menu-node__title">{props.node.meta?.title ?? props.node.name}</div>
            {hasChildren.value && (
              <div class={['menu-node__folder', !isFold.value && '--active']}>
                <Icon name="right-solid"></Icon>
              </div>
            )}
          </div>
          {!isFold.value && children.value.map((node) => <MenuNode node={node} depth={props.depth + 1} />)}
        </>
      )
    }
  }
})

export default defineComponent({
  name: 'BasicLayoutMenu',
  setup() {
    const router = useRouter()
    const basicLayoutStore = useBasicLayoutStore()
    const { sideMenus, currentHeaderMenu } = storeToRefs(basicLayoutStore)
    const listRef = computed(() => {
      const indexRoute = useBasicLayoutStore().registeredRoutes.find((item) => item.name === 'index')!
      return (import.meta.env.VITE_APP_USE_DEV_ROUTES === 'true' ? indexRoute?.children ?? [] : sideMenus.value).filter(
        (item) => {
          return item.meta?.hiddenInMenu !== true
        }
      )
    })
    // const list = mockData
    return () => {
      const list = listRef.value
      if (list.length === 0) return null
      return (
        <div class={`${PREFIX_CLS}-basic-layout__menu`}>
          {/* <div class={`${prefixCls}-basic-layout__menu-search`}></div> */}
          {list.map((node) => {
            return <MenuNode node={node} />
          })}
        </div>
      )
    }
  }
})
