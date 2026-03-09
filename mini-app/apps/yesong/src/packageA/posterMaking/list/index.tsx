// 海报制作 - 列表
import './style.scss'
import { computed, defineComponent, ref } from 'vue'
import {
  BasePage,
  ScrollList,
  ScrollListRefType,
  useConfirm,
  usePopup,
  useResponseMessage,
  useToast,
  useUserStore
} from '@pkg/core'
import { deletePoster, getPosterList } from '../../../api/posterMarking'
import { Image } from '@tarojs/components'
import { navigateToPosterMakingCreate } from '../../../router'
import '@nutui/nutui-taro/dist/packages/dialog/index.css'
import { tabsValue } from '../../../constants'
import Taro from '@tarojs/taro'
import { editorPoster } from '../create/dataProcessing'
import { Icon } from '@pkg/ui'
import PosterBuilder from '../create/PosterBuilder/index.vue'
import { storeToRefs } from 'pinia'
import { downloadImage } from '../../../utils/downloadFile'
import { utmStore } from '../../../stores'
import { $getWxacodeUnlimit } from '@pkg/core/src/api'
import { base64src } from '../create/PosterBuilder/utils/tools'
import { DEFAULT_AVATAR } from '@pkg/config'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true
})

export default defineComponent({
  name: 'PostMarkingList',
  setup() {
    // 跳转制作海报
    const makeAPoster = () => {
      if (isEditor.value) {
        console.log('当前是编辑模式,不准选这个')
        return void 0
      }
      //  false 新建 true 编辑
      editorPoster.value.isEdit = false
      navigateToPosterMakingCreate()
    }

    const ScrollRef = ref<ScrollListRefType>(null)

    const refreshData = () => {
      ScrollRef.value?.refreshData()
    }

    // 添加页面显示时的刷新逻辑
    Taro.useDidShow(() => {
      refreshData()
    })

    // 生成海报会用到
    const userStore = useUserStore()
    const { nickname, avatar, user } = storeToRefs(userStore)

    const utmStoreEle = utmStore()

    const { generateSpecifiedContentShortChain } = utmStoreEle

    const { env } = storeToRefs(utmStoreEle)

    // 是否展示删除的确认弹窗
    const selectedId = ref('')
    // 弹出海报操作菜单
    const optionsPopup = ref({
      close: () => 0
    })

    // 是否展示海报的builter
    const generationPoster = ref(false)
    // 当前需要生成的海报url
    const nowPoster = ref('')
    // 生成海报的小程序码
    const posterQrcodeImage = ref('')
    // 生成海报的配置
    const generationPosterConfig = computed(() => {
      return {
        width: 750,
        height: 1334,
        backgroundColor: '#ffffff',
        debug: false,
        blocks: [
          // 头部底色
          {
            x: 32,
            y: 80,
            width: 686,
            height: 160,
            paddingLeft: 0,
            paddingRight: 0,
            backgroundColor: '#FFFFFF',
            borderRadius: 32,
            zIndex: 10
          },
          //底部图片
          {
            x: 32,
            y: 990,
            width: 686,
            height: 365,
            paddingLeft: 0,
            paddingRight: 0,
            borderRadiusGroup: [0, 0, 16, 16],
            backgroundColor: '#FFFFFF',
            zIndex: 11
          }
        ],
        texts: [
          {
            x: 216,
            y: 108,
            text: nickname.value || '-',
            width: 380,
            lineNum: 2, // 最多几行
            fontSize: 36,
            fontWeight: 'bold',
            color: '#1A171B',
            zIndex: 11
          },
          {
            x: 216,
            y: 174,
            text: '为你挑选了一个好物',
            width: 380,
            fontSize: 28,
            color: '#7C7D7A',
            zIndex: 11
          }
        ],
        images: [
          {
            x: 50,
            y: 100,
            width: 120,
            height: 120,
            borderRadius: 60,
            url: avatar.value || DEFAULT_AVATAR,
            zIndex: 11
          },
          {
            x: 32,
            y: 272,
            width: 686,
            height: 770,
            url: nowPoster.value,
            borderRadiusGroup: [16, 16, 16, 16],
            zIndex: 20
          },
          {
            isBase64: true,
            x: 260,
            y: 1100,
            width: editorPoster.value.qrcode.size,
            height: editorPoster.value.qrcode.size,
            base64Url: posterQrcodeImage.value,
            url: posterQrcodeImage.value || 'https://dev-cdn.ice.cn/upload/72b3fcb5135bb9566a7cbb8ce05a85a1.png',
            zIndex: 15
          }
        ]
      }
    })
    // 下载海报
    const isDownloading = ref(false)

    const downloadPoster = (item: any) => {
      if (isDownloading.value) return
      isDownloading.value = true
      console.log('item:')
      console.log(item)
      generateSpecifiedContentShortChain({
        utmSource: '海报分享',
        utmCampaign: item.name,
        page: item.qrcode?.page,
        goodsId: item.qrcode?.goodsId
      }).then(res => {
        if (res.success) {
          // 获取小程序码
          $getWxacodeUnlimit({
            page: 'pagesB/goodDetail/GoodDetail',
            scene: `utmCode=${res.data.shortCode}`,
            env: env.value
          })
            .then(async res => {
              if (res.success) {
                const qrcodeImage = `data:image/png;base64,${res.data}`
                await base64src(qrcodeImage, Math.random() * 100000 + '').then(re => {
                  posterQrcodeImage.value = re as string
                  nowPoster.value = item.url
                  // loading
                  Taro.showLoading({
                    title: '生成海报中...',
                    mask: true
                  })
                  generationPoster.value = true
                })
              } else {
                useToast('获取小程序码失败了')
                isDownloading.value = false
              }
            })
            .catch(() => {
              isDownloading.value = false
            })
        } else {
          useToast('生成utmCode失败了')
        }
      })
    }

    const posterOptions = (item: object) => {
      selectedId.value = item.id
      optionsPopup.value = usePopup({
        placement: 'bottom',
        content: (
          <div class="poster-options">
            <div
              class="option-btn"
              onClick={() => {
                downloadPoster(item)
              }}
            >
              下载海报
            </div>
            <div
              class="option-btn"
              onClick={() => {
                navigateToPosterMakingCreate(item)
                // 关闭操作弹窗
                optionsPopup.value.close()
              }}
            >
              编辑
            </div>
            <div
              class="option-btn danger-color"
              onClick={() => {
                useConfirm({
                  title: '提示',
                  content: '您确定要删除该海报？',
                  onConfirm: () => {
                    deletePoster(selectedId.value)
                      .then(res => {
                        if (res.success) {
                          Taro.showToast({
                            title: res.msg || '删除成功',
                            icon: 'none'
                          })
                          // 关闭操作弹窗
                          optionsPopup.value.close()
                        } else {
                          Taro.showToast({
                            title: '删除失败',
                            icon: 'error'
                          })
                        }
                      })
                      .catch(useResponseMessage)
                      .finally(refreshData)
                  }
                })
              }}
            >
              删除海报
            </div>
            <div
              class="option-btn"
              onClick={() => {
                optionsPopup.value.close()
              }}
            >
              取消
            </div>
          </div>
        )
      })
    }

    const render = it => {
      const itemType = it.qrcode?.page || null
      return (
        <div
          class={`poster-item ${isEditor.value ? 'editing' : ''}`}
          onClick={() => {
            if (isEditor.value) {
              // 编辑模式下点击整个卡片进行选择
              handleSelect(it.id)
            } else {
              // 非编辑模式下才触发海报操作
              posterOptions(it)
            }
          }}
        >
          <div class={`bubble ${selectedIds.value.includes(it.id) ? 'selected' : ''}`}></div>
          <Image class="poster-cover" mode="aspectFill" src={it.url} lazyLoad />
          <div class="detail">
            {it?.name}
            {/* {itemType && ( */}
            {0 ? (
              <div class="detail-title">
                选择类型:{' ' + tabsValue?.find(item => itemType.includes(item.path))?.label}
                {!isEditor.value ? <div class="item-right-button">编辑</div> : <div />}
              </div>
            ) : (
              ''
            )}
          </div>
        </div>
      )
    }

    // 总数
    const totalNum = ref(0)
    // 是否是编辑模式
    const isEditor = ref(false)
    // 选中的海报id数组
    const selectedIds = ref<string[]>([])
    // 列表数据
    const listData = ref([])

    const editMode = () => {
      isEditor.value = !isEditor.value
      // 退出编辑模式时清空选中状态
      if (!isEditor.value) {
        selectedIds.value = []
      }
    }

    // 处理选择状态
    const handleSelect = (id: string) => {
      const index = selectedIds.value.indexOf(id)
      if (index === -1) {
        selectedIds.value.push(id)
      } else {
        selectedIds.value.splice(index, 1)
      }
    }

    // 删除选中的海报
    const deleteSelected = () => {
      if (selectedIds.value.length === 0) {
        Taro.showToast({
          title: '请选择要删除的海报',
          icon: 'none'
        })
        return
      }

      useConfirm({
        title: '提示',
        content: `确定要删除选中的${selectedIds.value.length}张海报吗？`,
        onConfirm: () => {
          Promise.all(selectedIds.value.map(id => deletePoster(id)))
            .then(() => {
              Taro.showToast({
                title: '删除成功',
                icon: 'success'
              })
              selectedIds.value = []
              refreshData()
            })
            .catch(useResponseMessage)
        }
      })
    }

    // 全选功能
    const handleSelectAll = () => {
      // 如果已经全选了，就取消全选，否则执行全选
      if (isAllSelected.value) {
        selectedIds.value = []
      } else {
        selectedIds.value = ScrollRef.value.data.map(item => item.id)
      }
    }

    // 计算是否全选
    const isAllSelected = computed(() => {
      return ScrollRef.value.data.length > 0 && ScrollRef.value.data.length === selectedIds.value.length
    })

    return () => {
      return (
        <BasePage
          backgroundColor="rgba(30, 40, 62, 1)"
          navigator={{
            title: '我的海报',
            showMenuButton: false,
            navigationBarBackgroundColor: 'rgba(0,0,0,0)',
            navigationBarTextStyle: 'white'
          }}
          class="post-marking-list-page"
        >
          <div class="poster-list-top-number">
            {totalNum.value ? <div class="poster-listy-top-left-text">共{' ' + totalNum.value + ' '}张</div> : <div />}
            <div class="post-list-top-right-button" onClick={editMode}>
              {isEditor.value ? '完成' : '管理'}
            </div>
          </div>
          <ScrollList
            showEmpty={false}
            refresherDefaultStyle={'white'}
            height="100vh"
            ref={ScrollRef}
            request={sss => {
              return new Promise((resolve, reject) => {
                getPosterList(sss)
                  .then(res => {
                    totalNum.value = res.data.total
                    listData.value = res.data.list || []
                    resolve(res)
                  })
                  .catch(reject)
              })
            }}
            class="post-marking-page-scroll"
          >
            {{
              topSlots: () => {
                return (
                  <div class="poster-item poster-item-sp" onClick={makeAPoster}>
                    <div class="empty-content-block">
                      <Icon name="zhizuo" />
                      <div class="empty-content-text">制作新海报</div>
                    </div>
                  </div>
                )
              },
              default: render
            }}
          </ScrollList>
          {isEditor.value ? (
            <div class="bottom-operations">
              <div class="top-select-text">已选择{' ' + selectedIds.value.length + ' '}张</div>
              <div class="bottom-content">
                <div class="bottom-content-left" onClick={handleSelectAll}>
                  <div class={`select-bubble ${isAllSelected.value ? 'selected' : ''}`}></div>
                  {isAllSelected.value ? '取消全选' : '全选'}
                </div>
                <div class="bottom-content-right">
                  {/*<div class="bottom-btn">下载</div>*/}
                  <div class="bottom-btn" onClick={deleteSelected}>
                    <Icon name="shanchu" />
                    删除
                  </div>
                </div>
              </div>
            </div>
          ) : (
            ''
          )}

          {/*  生成海报的builder*/}
          {generationPoster.value ? (
            <PosterBuilder
              config={generationPosterConfig.value}
              onSuccess={result => {
                downloadImage(result.tempFilePath)
                // 关掉弹窗
                generationPoster.value = false
                posterQrcodeImage.value = ''
                optionsPopup.value.close()
                isDownloading.value = false
              }}
              onFail={e => {
                console.log('生成失败了', e)
                useToast('海报生成失败')
                Taro.hideLoading()
                isDownloading.value = false
              }}
              showLoading
            />
          ) : (
            ''
          )}
        </BasePage>
      )
    }
  }
})
