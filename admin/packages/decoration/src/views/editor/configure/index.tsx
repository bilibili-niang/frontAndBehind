import { computed, defineComponent, reactive, ref, watch } from 'vue'
import './style.scss'
import useCanvasStore from '../../../stores/canvas'
import { storeToRefs } from 'pinia'
import attrsDefine from './attrs'
import { SchemaForm } from '@pkg/jsf'
import { uuid } from '@pkg/core'
import { Icon, JsonView } from '@pkg/ui'
import { copyText } from '@pkg/utils'

export default defineComponent({
  name: 'IndexPage',
  setup() {
    const canvasStore = useCanvasStore()
    const { currentSelectedComponent, page, layerTree } = storeToRefs(canvasStore)
    const { pageDefine } = storeToRefs(canvasStore)

    const tabs = [
      {
        code: 'config',
        icon: 'figma-component',
        title: '组件配置'
      },
      {
        code: 'attrs',
        icon: 'check-one',
        title: '通用属性'
      },
      {
        code: 'profile',
        icon: 'application-one',
        title: '高级'
      }
    ]
    const state = reactive({
      currentTab: 'config'
    })

    watch(
      () => currentSelectedComponent.value,
      () => {
        state.currentTab = 'config'
      }
    )

    const dataVisible = ref(false)

    const pageKey = ref(uuid())

    watch(
      () => canvasStore.page,
      () => {
        pageKey.value = uuid()
        // console.log(pageKey.value)
      }
    )

    const currentLayer = computed(() => {
      return layerTree.value.getNode(currentSelectedComponent.value?.id!)
    })

    const PageConfigure = () => {
      const handleChange = (v: any) => {
      }
      if (!pageDefine.value?.schema) return <div>加载中...</div>
      return (
        <div class="component-configure-content scroller jsf-ui-affix-target">
          <SchemaForm
            key={pageKey.value}
            theme="compact"
            id={`page-config`}
            schema={pageDefine.value.schema}
            onChange={handleChange}
            value={page.value}
            // slots={{ ...pageDefine.value?.slots }}
          ></SchemaForm>
        </div>
      )
    }
    const ComponentConfigure = () => {
      const { id } = currentSelectedComponent.value!
      const locked = currentLayer.value?.locked || currentLayer.value?.inheritLocked || false
      const hidden = currentLayer.value?.hidden || currentLayer.value?.inheritHidden || false

      const schema = currentSelectedComponent.value!.package?.manifest?.schema
      if (!schema) {
        return <div class="component-configure-loading">组件包加载中，请稍候...</div>
      }
      const handleChange = (v: any) => {
        // console.log(v)
      }
      const value = currentSelectedComponent.value!.config
      return (
        <div class="component-configure-content scroller--hidden jsf-ui-affix-target">
          {(locked || hidden) && (
            <div class="locked-tips">
              <div class="flex-center" style="gap:8px;">
                {locked && <Icon name="lock"/>}
                {hidden && <Icon name="hidden"/>}
              </div>
              <strong>当前组件已锁定／隐藏</strong>
            </div>
          )}
          <SchemaForm
            theme="compact"
            id={`${id}-config`}
            schema={schema}
            onChange={handleChange}
            value={value}
          />
        </div>
      )
    }

    const ComponentAttrs = () => {
      const { id } = currentSelectedComponent.value!
      const attrs = currentSelectedComponent.value!.attrs
      const handleAttrsChange = (v: any) => {
        // console.log(v)
      }
      if (!attrsDefine) return <div>加载中...</div>
      return (
        <div class="component-configure-attrs scroller">
          <SchemaForm
            theme="compact"
            id={`${id}-attrs`}
            // @ts-ignore
            schema={attrsDefine.schema}
            onChange={handleAttrsChange}
            value={attrs}
          />
        </div>
      )
    }

    const OriginalName = () => {
      const oname = currentSelectedComponent.value?.package?.manifest.name
      if (oname !== currentSelectedComponent.value?.name) {
        return <small class="color-disabled">（{oname}）</small>
      }
      return null
    }

    return () => {
      const { name, version, key } = currentSelectedComponent.value || {}
      const dataToggler = !dataVisible.value && (
        <div
          class="component-data-toggler clickable"
          onClick={() => (dataVisible.value = !dataVisible.value)}
        >
          <iconpark-icon name="code-brackets"></iconpark-icon>
        </div>
      )
      if (!pageDefine.value) {
        return null
      }
      return (
        <div class="deck-editor-configure-wrapper">
          <div class="deck-editor-configure">
            {currentSelectedComponent.value ? (
              <>
                <div class="lego-config-tab">
                  {tabs.map((tab) => {
                    return (
                      <div
                        class={[
                          'lego-config-tab__item clickable',
                          state.currentTab === tab.code && '--active'
                        ]}
                        onClick={() => (state.currentTab = tab.code ?? state.currentTab)}
                      >
                        <iconpark-icon class="lego-icon" name={tab.icon}></iconpark-icon>
                        <span>{tab.title}</span>
                        <i class="--arc-l"></i>
                        <i class="--arc-r"></i>
                      </div>
                    )
                  })}
                </div>
                <div class="component-title-wrap">
                  <div class="component-title-name">
                    {name}
                    <OriginalName/>
                  </div>
                  <div class="component-version-tag">
                    {key}&nbsp;|&nbsp;{version}
                  </div>
                  {dataToggler}
                </div>
                <ComponentConfigure
                  v-show={state.currentTab === 'config'}
                  key={`${currentSelectedComponent.value.id}-config`}
                />
                <ComponentAttrs
                  v-show={state.currentTab === 'attrs'}
                  key={`${currentSelectedComponent.value.id}-attrs`}
                />
                <div
                  class="flex-center"
                  style="height:300px"
                  v-show={state.currentTab === 'profile'}
                >
                  空空如也
                </div>
              </>
            ) : (
              <>
                <div class="component-title-wrap">
                  <div class="component-title-name">{pageDefine.value.name}</div>
                  <div
                    class="component-version-tag"
                    onClick={() => {
                      if (process.env.NODE_ENV === 'development') {
                        copyText(pageDefine.value.key, '复制成功')
                      }
                    }}
                  >
                    {pageDefine.value.key} {pageDefine.value.version}
                  </div>
                  {dataToggler}
                  {pageDefine.value.description && (
                    <div class="component-description">{pageDefine.value.description}</div>
                  )}
                </div>
                {pageDefine.value && <PageConfigure/>}
              </>
            )}
          </div>
          <div class={['deck-editor-configure-data-wrapper', dataVisible.value && '--active']}>
            <div class="deck-editor-configure-data-header">
              <iconpark-icon name="code-brackets"></iconpark-icon>
              &nbsp;
              {currentSelectedComponent.value ? '组件数据' : '页面数据'}
              <div class="close-btn clickable" onClick={() => (dataVisible.value = false)}>
                <iconpark-icon name="close-small"></iconpark-icon>
              </div>
            </div>
            <div class="deck-editor-configure-data scroller">
              <JsonView data={currentSelectedComponent.value ?? page.value} defaultUnfold/>
            </div>
          </div>
        </div>
      )
    }
  }
})
