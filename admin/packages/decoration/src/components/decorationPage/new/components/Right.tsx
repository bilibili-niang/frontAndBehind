import './right.scss'
import { defineComponent } from 'vue'
import { SchemaForm } from '@pkg/jsf'
import { Empty, PropertyTabs, ScrollContainer } from '@pkg/ui'
import { useDecorationStore } from '../../../../store'
import commonAttrsSchema from '../../../../common/attrs-schema'
import { copyText } from '@pkg/utils'
import customPageSchema from '../../../../store/customPageSchema'

export default defineComponent({
  name: 'DecorationNewRight',
  setup() {
    const store = useDecorationStore()

    const tabs = [
      {
        key: 'component',
        title: '组件属性',
        icon: 'platte',
        render: () => (
          <div class="space-y-3">
            {(() => {
              const s: any = store.activeComponent?.schema || ({ type: 'object', properties: {} } as any)
              const hasProps = s?.type === 'object' && s?.properties && Object.keys(s.properties).length > 0
              return hasProps ? (
                <SchemaForm
                  schema={s}
                  value={store.activeComponent?.value || {}}
                  theme="compact"
                  onChange={(val: any) => store.updateActiveValue(val)}
                />
              ) : (
                <div class="p-3">
                  <Empty description="该组件暂无可配置项"/>
                </div>
              )
            })()}
          </div>
        )
      },
      {
        key: 'common',
        title: '通用属性',
        icon: 'stickers',
        render: () => (
          <SchemaForm
            schema={commonAttrsSchema}
            value={store.activeComponent?.attrs || {}}
            theme="compact"
            onChange={(val: any) => store.updateActiveAttrs(val)}
          />
        )
      }
    ]

    return () => (
      <div class="decoration-right">
        <ScrollContainer
          class="attr-scroll"
          thickness={8}
          autoHide={false}>
        {!store.activeComponent ? (
          <>
            <div class="component-title-wrap">
              <div class="component-title-name">页面配置</div>
              <div
                class="component-version-tag"
                onClick={() => {
                  copyText('custom-page')
                }}
              >custom-page
              </div>
            </div>
            <SchemaForm
              class="decoration-right-schema-form"
              schema={customPageSchema.schema as any}
              value={store.pageValue as any}
              theme="compact"
              onChange={(val: any) => store.updatePageValue(val)}
            />
          </>
        ) : (
          <div class='decoration-right-attribute-tab'>
            <div class="component-title-wrap">
              <div class="component-title-name">{store.activeComponent?.name}</div>
              <div
                class="component-version-tag"
                onClick={() => {
                  copyText(store.activeComponent?.key)
                }}
              >{store.activeComponent?.key}</div>
            </div>
            <PropertyTabs
              tabs={tabs}
              defaultActiveKey="component"
            />
          </div>
        )}
        </ScrollContainer>
      </div>
    )
  }
})