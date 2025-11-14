// 页面/列表/商品 路径选择
import './style.scss'
import { defineComponent, ref, computed, nextTick, watch } from 'vue'
import { EmptyStatus, usePopup, useUserStore } from '@anteng/core'
import { Tabs, TabPane } from '@nutui/nutui-taro'
import '@nutui/nutui-taro/dist/packages/tabs/index.css'
import '@nutui/nutui-taro/dist/packages/tabpane/index.css'
import GoodsSelector from './commponents/goods-selector/index'
import InformationList from '../../packageA/information/list/index'
import GoodsCategory from './commponents/goods-category/index'
import { editorPoster } from '../../packageA/posterMaking/create/dataProcessing'
import { HOME_PAGE, tabsValue } from '../../constants'
import { utmStore } from '../../stores'
import { Search } from '@anteng/ui'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'PageSelector',
  emits: ['change'],
  setup(props, { emit, expose }) {
    const { getUtmData } = utmStore()
    // 这个是用来保存当前页面选择商品详情/商品分类的 id
    const tempPage = ref({})

    const pagePop = ref(null)
    // 当前选择的父级选择
    const selectionValue = ref('goodsDetail')
    const keywords = ref('')
    const goodsSelectorRef = ref(null)

    const userStore = useUserStore()

    const { user } = storeToRefs(userStore)

    watch(
      () => selectionValue.value,
      (newV: string) => {
        if (newV === HOME_PAGE) {
          console.log('跳转首页')
          editorPoster.value.qrcode.page = HOME_PAGE
          editorPoster.value.title = '首页'
          console.log('user----------------', user)
          getUtmData({
            isNull: true,
            page: HOME_PAGE,
            utmContent: JSON.stringify({
              posterId: editorPoster.value?.id,
              shareUserId: user.value.id
            })
          })
          pagePop.value.close()
          emit('change')
        }
      }
    )

    // 一级的选择
    const showPagePop = () => {
      pagePop.value = usePopup({
        placement: 'bottom',
        content: () => (
          <div class="show-page-pop">
            <Search
              value={keywords.value}
              onSearch={(value: string) => {
                keywords.value = value
                nextTick(() => {
                  goodsSelectorRef.value?.refreshData()
                })
              }}
              placeholder="输入关键字搜索商品"
              class="page-selector-search"
            />
            <Tabs
              size="large"
              direction="vertical"
              class="tab-content"
              title-scroll
              v-model={selectionValue.value}
              onChange={e => {
                selectionValue.value = e.paneKey
              }}
            >
              {tabsValue.map((it, index) => {
                return (
                  <TabPane paneKey={it.value} title={it.label}>
                    {it.value === HOME_PAGE ? (
                      <div>
                        <EmptyStatus description="暂无相关信息" />
                      </div>
                    ) : (
                      ''
                    )}

                    {it.value === 'goodsDetail' ? (
                      <scroll-view scroll-y={true} class="goods-detail-content pane-content">
                        {/*选择商品*/}
                        <GoodsSelector
                          ref={goodsSelectorRef}
                          keyword={keywords.value}
                          onChange={e => {
                            tempPage.value = e
                            editorPoster.value.title = e?.title || e?.name
                            editorPoster.value.qrcode.goodsId = e.id
                            editorPoster.value.qrcode.faId = null
                            editorPoster.value.qrcode.childrenId = null
                            editorPoster.value.qrcode.infId = null
                            editorPoster.value.qrcode.page = `${it.path}`
                            getUtmData({
                              utmKeyword: '',
                              page: `${it.path}`,
                              goodsId: e.id
                            })
                            pagePop.value.close()
                            emit('change')
                          }}
                        />
                      </scroll-view>
                    ) : (
                      ''
                    )}

                    {it.value === 'goodsGroup' ? (
                      <scroll-view scroll-y={true} class="goods-group-content pane-content">
                        {/*商品分类*/}
                        <GoodsCategory
                          onChange={e => {
                            tempPage.value = e
                            editorPoster.value.title = e?.title || e?.name
                            editorPoster.value.qrcode.goodsId = null
                            editorPoster.value.qrcode.infId = null
                            editorPoster.value.qrcode.faId = e.faId

                            getUtmData({
                              utmKeyword: '',
                              page: `${it.path}`,
                              faId: e.faId,
                              childrenId: e?.id
                            })

                            if (e.id) {
                              // 不一定有二级分类
                              editorPoster.value.qrcode.childrenId = e.id
                            }
                            editorPoster.value.qrcode.page = `${it.path}`
                            pagePop.value.close()
                            emit('change')
                          }}
                        />
                      </scroll-view>
                    ) : (
                      ''
                    )}

                    {it.value === 'information' ? (
                      <scroll-view scroll-y={true} class="information-detail-content pane-content">
                        {/*资讯列表*/}
                        <InformationList
                          asSelector
                          onChange={(e: object) => {
                            tempPage.value = e
                            editorPoster.value.qrcode.goodsId = null
                            editorPoster.value.qrcode.faId = null
                            editorPoster.value.qrcode.childrenId = null
                            editorPoster.value.title = e?.title || e?.name
                            editorPoster.value.qrcode.infId = e.id
                            editorPoster.value.qrcode.page = `${it.path}`

                            getUtmData({
                              utmKeyword: '',
                              page: `${it.path}`,
                              infId: e.id
                            })

                            pagePop.value.close()
                            emit('change')
                          }}
                        />
                      </scroll-view>
                    ) : (
                      ''
                    )}
                  </TabPane>
                )
              })}
            </Tabs>
          </div>
        )
      })
    }
    const init = () => {
      // 创建
      if (!editorPoster.value?.id) {
        tempPage.value = {}
      } else {
        // 编辑
        tempPage.value = {}
      }
    }

    const showLabel = computed(() => {
      if (!editorPoster.value?.qrcode?.page) {
        return ''
      }
      return tabsValue?.find(it => {
        return editorPoster.value.qrcode.page?.includes(it.path)
      })
    })

    init()
    expose({
      showPagePop
    })
    return () => {
      return (
        <div class="page-selector">
          {editorPoster.value?.qrcode?.page ? (
            <div class="pathResolution">
              <div
                class="fa-selection"
                onClick={() => {
                  showPagePop()
                }}
              >
                {showLabel.value?.label}
                <div class="children-selection">(点击更改)</div>
              </div>
              {editorPoster.value?.title && <div class="children-selection">{editorPoster.value?.title}</div>}
            </div>
          ) : (
            <div
              class="empty-addressSelector"
              onClick={() => {
                showPagePop()
              }}
            >
              点击选择页面
            </div>
          )}
        </div>
      )
    }
  }
})
