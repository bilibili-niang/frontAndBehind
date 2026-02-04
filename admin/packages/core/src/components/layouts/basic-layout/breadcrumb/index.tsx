import { computed, defineComponent, onBeforeMount, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import './style.scss'
import { Icon } from '@pkg/ui'
import useBasicLayoutStore from '../../../../stores/basic-layout'
import { storeToRefs } from 'pinia'
import emitter from '../../../../utils/emitter'

const breadcrumbMap = ref(new Map())

export const setBreadcrumb = (title: string, asChild = false) => {
  emitter.emit('setBreadcrumb', {
    title,
    asChild
  })
}

export default defineComponent({
  name: 'BasicLayoutBreadcrumb',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const basicLayoutStore = useBasicLayoutStore()
    const { flatenSideMenus } = storeToRefs(basicLayoutStore)

    const breadcrumbTitle = computed(() => {
      return breadcrumbMap.value.get(route.path)?.title ?? ''
    })
    const asChild = computed(() => {
      return breadcrumbMap.value.get(route.path)?.asChild ?? false
    })
    const setBreadcrumb = (t: any) => {
      breadcrumbMap.value.set(route.path, t)
    }

    onMounted(() => {
      emitter.on('setBreadcrumb', setBreadcrumb)
    })

    onUnmounted(() => {
      emitter.off('setBreadcrumb', setBreadcrumb)
    })

    return () => {
      const paths = route.matched.filter((item) => item.name !== 'index')
      return (
        <div class="basic-layout-breadcrumb">
          <div
            class="basic-layout-breadcrumb__back clickable"
            onClick={() => {
              router.back()
            }}
          >
            <Icon name="left" />
            返回
          </div>
          <i class="basic-layout-breadcrumb__divider"></i>
          {paths.map((item, index) => {
            const isActive = index === paths.length - 1
            const a = flatenSideMenus.value.find((r) => r.path === item.path)
            if (isActive && !asChild.value && breadcrumbTitle.value) {
              return (
                <>
                  <span class={['basic-layout-breadcrumb__link --active']}>{breadcrumbTitle.value}</span>
                </>
              )
            }
            return (
              <>
                <span
                  class={['basic-layout-breadcrumb__link clickable', isActive && !asChild.value && '--active']}
                  onClick={() => {
                    if (item.path.includes(':')) {
                      return void 0
                    }
                    router.push(item.path)
                  }}
                >
                  {(a?.meta?.title || item.meta?.title) ?? item.name}
                </span>
                {index < paths.length - 1 && <i class="basic-layout-breadcrumb__split">/</i>}
              </>
            )
          })}
          {asChild.value && breadcrumbTitle.value && (
            <>
              <i class="basic-layout-breadcrumb__split">/</i>
              <span class={['basic-layout-breadcrumb__link --active']}>{breadcrumbTitle.value}</span>
            </>
          )}
        </div>
      )
    }
  }
})
