import { Icon, Popover } from '@pkg/ui'
import { computed, defineComponent } from 'vue'
import './style.scss'
import useBasicLayoutStore, { type IHeaderMenuNode } from '../../../../stores/basic-layout'
import useAppStore from '../../../../stores/app'
import { storeToRefs } from 'pinia'
import { LOGO_URL } from '@pkg/config'

export default defineComponent({
  setup() {
    const basicLayoutStore = useBasicLayoutStore()
    const { headerMenus, currentHeaderMenuId, currentHeaderMenu } = storeToRefs(basicLayoutStore)
    const appStore = useAppStore()
    const placement = computed(() => {
      return appStore.theme.layout === 'layoutB' ? 'rightTop' : 'bottomLeft'
    })
    const useClick = (menuNode: IHeaderMenuNode) => {
      const hasChildren = Array.isArray(menuNode.children) && menuNode.children.length > 0
      if (hasChildren) {
        return void 0
      }
      basicLayoutStore.toggleMenu(menuNode.id!)
    }
    return () => {
      return (
        <>
          {/* <div class="basic-layout__app-item clickable --active">
            <img src="https://dev-cdn.cardcat.cn/anteng/example_01.png" draggable={false} />
            <strong>精选商城</strong>
          </div>
          <Badge size="small" offset={[-8, 3]} count={8}>
            <div class="basic-layout__app-item clickable">
              <img src="https://dev-cdn.cardcat.cn/anteng/example_02.png" style="padding: 3px;" draggable={false} />
              <strong>供应链平台</strong>
            </div>
          </Badge> */}
          {headerMenus.value?.map((item) => {
            const hasChildren = Array.isArray(item.children) && item.children.length > 0
            const isActive = item.id === currentHeaderMenuId.value || currentHeaderMenu?.value?.parentId === item.id

            // if (isActive) return null

            const logo = (item.customSource || item.source)?.startsWith('http')
              ? item.customSource || item.source
              : LOGO_URL
            const MenuNode = (
              <div class={['basic-layout__app-item clickable', isActive && '--active']} onClick={() => useClick(item)}>
                <img src={logo} draggable={false} />
                <strong>
                  {item.customName || item.title}
                  {hasChildren && <Icon name={placement.value === 'rightTop' ? 'right' : 'down'}></Icon>}
                </strong>
              </div>
            )
            if (!hasChildren) {
              return MenuNode
            }
            return (
              <Popover
                placement={placement.value}
                content={
                  <div class="basic-layout__app-popover">
                    {item.children!.map((child) => {
                      return (
                        <div
                          class={[
                            'basic-layout__app-link clickable',
                            child.id === currentHeaderMenuId.value && '--active'
                          ]}
                          onClick={() => useClick(child)}
                        >
                          <img class="hyperelliptic" src="https://dev-cdn.cardcat.cn/anteng/example_03.png" alt="" />
                          <div>
                            <strong>{child.title}</strong>
                            {/* <small>社区生活数字化运营方案</small> */}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                }
              >
                {MenuNode}
              </Popover>
            )
          })}
        </>
      )
    }
  }
})
