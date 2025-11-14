import './style.scss'
import { defineComponent, computed, onMounted, reactive, ref, nextTick } from 'vue'
import { BasePage, useConfirm, useUserStore, ImageUploader } from '@anteng/core'
import Taro from '@tarojs/taro'
import { Input } from '@tarojs/components'
import PageSelector from '../../../components/page-selector'
import { editorPoster, getQrcode, submitData, qrCodeUrl, qrcodeImage } from './dataProcessing/index'
import PosterBuilder from './PosterBuilder/index.vue'
import { base64src } from './PosterBuilder/utils/tools'
import { utmStore } from '../../../stores'
import { getGoodsDetail } from '../../../api'
import { cloneDeep } from 'lodash-es'
import { Icon } from '@anteng/ui'
import { navigateBack } from '../../../router'
import { storeToRefs } from 'pinia'
import { DEFAULT_AVATAR } from '@anteng/config'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true
})

export default defineComponent({
  name: 'posterCreate',
  setup() {
    const PosterRef = ref(null)
    // 选择器的ref
    const PageSelectorRef = ref({
      showPagePop: () => 0
    })
    const utmEleStore = utmStore()
    const { generateSpecifiedContentShortChain, getUtmData } = utmEleStore

    // 海报名称
    const posterName = ref('')

    // 选择的页面详情
    const userStore = useUserStore()
    // 这里的avatar如果格式不对,会导致windows端绘制canvas失败
    const { nickname, avatar } = storeToRefs(userStore)

    // 用户选择的图片
    const imageSrc = ref([])
    const showCanvas = ref(false)
    const tempOldData = ref({})
    const init = () => {
      qrCodeUrl.value = ''
      qrcodeImage.value = ''
      if (editorPoster.value?.isEdit) {
        tempOldData.value = cloneDeep(editorPoster.value)
        imageSrc.value[0] = editorPoster.value.url
        showCanvas.value = true
        // 需要对选择的商品数据进行回显
        dataEcho()
        // 回显海报名称
        posterName.value = editorPoster.value.name || ''
      } else {
        editorPoster.value = {
          url: '',
          qrcode: {
            id: 0,
            x: 251,
            y: 1100,
            size: 200
          }
        }
      }
    }

    // 数据回显
    const dataEcho = () => {
      if (editorPoster.value.qrcode?.goodsId) {
        getUtmData({
          utmCampaign: editorPoster.value.name,
          utmSource: '海报分享',
          page: editorPoster.value.qrcode.page,
          goodsId: editorPoster.value.qrcode?.goodsId
        })
        getGoodsDetail(editorPoster.value.qrcode.goodsId).then(res => {
          editorPoster.value.title = res.data.title
        })
      }
      getQrcodeAndRefresh()
      // 回显海报名称
      posterName.value = editorPoster.value.name || ''
    }

    // 获取小程序二维码一般伴随着刷新
    const getQrcodeAndRefresh = async () => {
      if (!editorPoster.value?.qrcode?.page) return
      try {
        const shortLinkRes = await generateSpecifiedContentShortChain({
          utmCampaign: editorPoster.value.name,
          utmSource: '海报分享',
          page: editorPoster.value.qrcode.page,
          goodsId: editorPoster.value.qrcode?.goodsId
        })
        await getQrcode(shortLinkRes.data.shortCode)
        await PosterRef.value?.init()
      } catch (e) {
        console.error('获取二维码失败:', e)
        Taro.showToast({
          title: '获取二维码失败',
          icon: 'none'
        })
      }
    }

    onMounted(() => {
      init()
    })

    const posterConfig = computed(() => {
      if (!qrCodeUrl.value && qrcodeImage.value) {
        base64src(qrcodeImage.value)
          .then(res => {
            qrCodeUrl.value = res
          })
          .catch(err => {
            console.error('二维码转换失败:', err)
          })
      }
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
            url: imageSrc.value?.[0],
            borderRadiusGroup: [16, 16, 16, 16],
            zIndex: 20
          },
          {
            isBase64: true,
            x: 260,
            y: 1100,
            width: editorPoster.value.qrcode.size,
            height: editorPoster.value.qrcode.size,
            // url: qrCodeUrl.value || 'https://dev-cdn.anteng.cn/upload/db870a3b1ee7a76eacbd68506a8ebd3b.png',
            url: qrCodeUrl.value || 'https://dev-cdn.anteng.cn/upload/72b3fcb5135bb9566a7cbb8ce05a85a1.png',
            // 渲染二维码这里如果有圆角,二维码底下会有一条线(OnlyAppleCanDo),可能是 base64src 这个方法在安卓和ios下的差异导致的
            // borderRadiusGroup: [15, 15, 15, 15],
            zIndex: 999
          }
        ]
      }
    })

    const state = reactive({
      posterPath: ''
    })

    const drawSuccess = result => {
      state.posterPath = result.tempFilePath
    }
    const drawFail = result => {
      console.log('绘制失败', result)
      Taro.hideLoading()
      /* Taro.showToast({
        title: '图片格式不支持，请使用jpg或png格式',
        icon: 'none',
        duration: 2000
      }) */
      // 不清除状态，避免闪烁
    }
    const drawCanvas = () => {
      if (imageSrc.value?.length !== 0) {
        showCanvas.value = true
      }
    }
    const needBackEle = () => {
      return new Promise((resolve, reject) => {
        // 如果不是编辑模式，直接返回
        if (!editorPoster.value?.isEdit) {
          resolve(true)
          return
        }

        // 检查是否有未保存的更改
        const hasUnsavedChanges = () => {
          const oldData = tempOldData.value
          const currentData = editorPoster.value

          // 检查图片URL是否变化
          if (oldData.url !== currentData.url) return true

          // 检查商品信息是否变化
          if (
            oldData.qrcode.goodsId !== currentData.qrcode.goodsId ||
            oldData.qrcode.informationId !== currentData.qrcode.informationId
          )
            return true
          return false
        }

        // 如果有未保存的更改，显示确认对话框
        if (hasUnsavedChanges()) {
          useConfirm({
            title: '提示',
            content: '当前页面有未保存的更改，确定要离开吗？',
            confirmText: '确定',
            cancelText: '取消',
            success: res => {
              if (res.confirm) {
                resolve(true)
              } else {
                reject(false)
              }
            }
          })
        } else {
          // 没有未保存的更改，直接返回
          resolve(true)
        }
      })
    }

    // 更换图片
    const changeImage = () => {
      useConfirm({
        title: '是否更换图片',
        content: '这将无法恢复当前上传的图片',
        onConfirm: () => {
          // 重置所有相关状态
          qrCodeUrl.value = ''
          qrcodeImage.value = ''
          editorPoster.value.url = ''
          editorPoster.value.title = ''
          imageSrc.value = []
          showCanvas.value = false
          state.posterPath = ''
          // 重置二维码相关状态
          if (editorPoster.value.qrcode) {
            editorPoster.value.qrcode = {
              ...editorPoster.value.qrcode,
              goodsId: undefined,
              faId: undefined,
              infId: undefined,
              childrenId: undefined
            }
          }
        },
        onCancel: () => {}
      })
    }
    // 保存图片
    const saveImage = () => {
      if (!posterName.value?.trim()) {
        Taro.showToast({
          title: '请输入海报名称',
          icon: 'none'
        })
        return
      }
      if (!qrCodeUrl.value && !qrcodeImage.value) {
        Taro.showToast({
          title: '请先选择页面生成二维码',
          icon: 'none'
        })
        return
      }
      Taro.saveImageToPhotosAlbum({
        filePath: state.posterPath,
        success: () => {
          Taro.showToast({
            title: '已保存到相册',
            icon: 'success'
          })
        },
        fail: () => {
          Taro.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      })
    }
    // 保存文件
    const saveFile = () => {
      if (!posterName.value?.trim()) {
        Taro.showToast({
          title: '请输入海报名称',
          icon: 'none'
        })
        return
      }
      submitData(editorPoster.value.id).then(r => {
        editorPoster.value = r?.data
        tempOldData.value = cloneDeep(editorPoster.value)
        setTimeout(() => {
          navigateBack()
        }, 1000)
      })
    }
    return () => {
      return (
        <BasePage
          backgroundColor="rgba(30, 40, 62, 1)"
          navigator={{
            title: '制作海报',
            showMenuButton: false,
            navigationBarBackgroundColor: 'rgba(0,0,0,0)',
            navigationBarTextStyle: 'white',
            whetherBack: needBackEle
          }}
          class="poster-create-page"
          onClick={() => {
            // console.log('editorPoster.value:')
            // console.log(editorPoster.value)
          }}
        >
          {state.posterPath ? (
            <div class="poster-create-top-operations">
              <Input
                class="poster-name-input"
                type="text"
                placeholder="请输入海报名称"
                value={posterName.value}
                onInput={e => {
                  posterName.value = e.detail.value
                  if (editorPoster.value) {
                    editorPoster.value.name = e.detail.value
                  }
                }}
              />
              <div class="bottom-btn" onClick={saveImage}>
                下载海报
              </div>
              <div class="bottom-btn" onClick={saveFile}>
                保存文件
              </div>
            </div>
          ) : (
            ''
          )}

          <div
            class="image-container"
            onClick={() => {
              if (!state.posterPath) {
                return void 0
              }
              const pageTitle = editorPoster.value?.title
              const page = editorPoster.value?.qrcode?.page
              let jumpInfo = ''

              if (page === 'homePage') {
                jumpInfo = '首页'
              } else if (pageTitle) {
                jumpInfo = `页面类型：${pageTitle}`
              } else {
                jumpInfo = '暂未选择跳转页面'
              }

              Taro.showToast({
                title: `扫码后跳转到${jumpInfo}`,
                icon: 'none',
                duration: 2000
              })
            }}
          >
            <image v-if={state.posterPath} class="poster-image" src={state.posterPath} mode="aspectFit" />
            {showCanvas.value && (
              <PosterBuilder
                custom-style="position: fixed; left: 400%;"
                config={posterConfig.value}
                onSuccess={drawSuccess}
                onFail={drawFail}
                ref={PosterRef}
                showLoading
              />
            )}
            {imageSrc.value.length === 0 && (
              <ImageUploader
                class="image-uploader"
                maxCount={1}
                images={imageSrc.value}
                onChange={list => {
                  imageSrc.value = list
                  drawCanvas()
                  editorPoster.value.url = list[0]
                  // 图片更换后需要刷新下当前canvas
                  getQrcodeAndRefresh()
                }}
              />
            )}
          </div>
          <div class="options">
            {imageSrc.value.length === 0 ? (
              <div class="tips"></div>
            ) : (
              <>
                <div class="row-layout">
                  <div class="key-title">跳转页面</div>
                  <PageSelector
                    class="page-selector"
                    ref={PageSelectorRef}
                    onChange={() => {
                      nextTick(() => {
                        getQrcodeAndRefresh()
                      })
                    }}
                  />
                </div>
              </>
            )}
            {imageSrc.value.length !== 0 ? (
              <div class="poster-create-bottom-operations">
                <div
                  class="poster-create-bottom-left"
                  onClick={() => {
                    PageSelectorRef.value?.showPagePop()
                  }}
                >
                  <Icon name="shengchengxiaochengxuma" />
                  生成小程序码
                </div>
                <div class="poster-create-bottom-right" onClick={changeImage}>
                  <Icon name="genghuantupian" />
                  更换图片
                </div>
              </div>
            ) : (
              ''
            )}
          </div>
        </BasePage>
      )
    }
  }
})
