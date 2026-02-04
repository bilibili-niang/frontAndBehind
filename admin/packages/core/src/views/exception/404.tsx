import { Button, Icon, Result } from '@pkg/ui'
import { defineComponent, ref, watch } from 'vue'
import './404.scss'
import { useRouter } from 'vue-router'
import useBasicLayoutStore from '../../stores/basic-layout'
import Spin from '../../components/spin'
import useUserStore from '../../stores/user'
import { storeToRefs } from 'pinia'
import useContextMenu from '../../hooks/useContextMenu'

export default defineComponent({
  name: '404',
  props: {
    isRoutesError: {
      type: Boolean
    }
  },
  setup(props) {
    const router = useRouter()
    const basicLayoutStore = useBasicLayoutStore()
    const { headerMenus } = storeToRefs(basicLayoutStore)
    const backHome = () => {
      router.replace('/')
    }

    const showLoading = ref(true)

    watch(
      () => basicLayoutStore.isRoutesLoading,
      () => {
        if (!basicLayoutStore.isRoutesLoading) {
          router.replace(decodeURIComponent(router.currentRoute.value.path))
          setTimeout(() => {
            showLoading.value = false
          }, 300)
        } else {
          showLoading.value = true
        }
      },
      {
        immediate: true
      }
    )

    const onToggleApp = (e: MouseEvent) => {
      console.log(headerMenus.value)

      const loop = (item: any) => {
        return {
          key: item.id,
          title: item.title,
          children: (item.children || []).map(loop),
          handler: () => {
            window.location.replace(`/${item.value}`)
          }
        }
      }

      useContextMenu(e, {
        list: headerMenus.value.map(loop)
      })
    }

    return () => {
      if (showLoading.value) {
        return (
          <div class="exception-404">
            <Spin style="margin-left: -24px;" />
            <strong style="margin-top:32px;padd">页面正在加载中，请稍候...</strong>
          </div>
        )
      } else if (props.isRoutesError || basicLayoutStore.isRoutesError) {
        return (
          <div class="exception-404">
            <Result status="403" title="403" sub-title="抱歉，您没有权限访问" />
            <div class="flex-center" style="gap:12px;">
              <Button
                onClick={() => {
                  useUserStore().logout()
                }}
              >
                退出登录
              </Button>
              <Button type="primary" onClick={onToggleApp}>
                切换应用
                <Icon name="right" style="margin-right:-6px;" />
              </Button>
            </div>
          </div>
        )
      }
      return (
        <div class="exception-404">
          <Result status="404" title="404" sub-title="抱歉，您访问的页面不存在" />
          <Button type="primary" shape="round" onClick={backHome}>
            返回首页
          </Button>
        </div>
      )
    }
  }
})
