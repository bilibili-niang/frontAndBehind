import './style.scss'
import Taro, { useRouter } from '@tarojs/taro'
import { storeToRefs } from 'pinia'
import { defineComponent, computed, ref, watchEffect, shallowRef, nextTick, onMounted } from 'vue'
import { useGoodsDetailStore } from '../../goods/detail/store'
import { BasePage, useAppStore, useToast } from '@anteng/core'
import { ScrollView } from '@tarojs/components'
import { useDrawImage, wrapText, puzzle, drawRoundRect } from '../../../utils'
import { withUnit, uuid } from '@anteng/utils'
import { $getWxacodeUnlimit } from '@anteng/core/src/api'
import { useGoodsStore, utmStore } from '../../../stores'
import { InputNumber } from '@nutui/nutui-taro'
import '@nutui/nutui-taro/dist/packages/inputnumber/index.css'
import { DPR, CANVAS_WIDTH, CANVAS_HEIGHT, PADDING, BG_WIDTH, BG_HEIGHT, QrData } from './operateFunction'

definePageConfig({
  navigationStyle: 'custom',
  disableScroll: true
})

export default defineComponent({
  name: 'Poster',
  setup() {
    const goodsId = useRouter().params.gid
    const contextRef = shallowRef<Taro.CanvasContext>()
    const canvasRef = shallowRef<Taro.Canvas>()
    const bgCanvasRef = shallowRef<Taro.Canvas>()
    const bgContextRef = shallowRef<Taro.CanvasContext>()
    const bgCanvasId = ref(`canvas-${uuid()}`)
    const canvasId = ref(`canvas-${uuid()}`)
    const canvasHeight = ref(0)
    const { getUtmData, env, generateSpecifiedContentShortChain } = utmStore()
    // 为H5和小程序封装了使用统一的图片绘制
    const drawImage = useDrawImage(canvasRef as any, contextRef as any)
    const goodsDetailStore = useGoodsDetailStore(goodsId)
    goodsDetailStore.getGoodsDetail()
    const borderRadious = ref(0)

    const goodsDetail = storeToRefs(goodsDetailStore).goodsDetail
    // 修改一下utm参数,只能在utmContent中放将要跳转页面的id
    getUtmData({
      utmContent: '',
      page: 'packageA/goods/detail',
      goodsId: goodsDetail.value.id,
      utmSource: '海报分享',
      utmCampaign: '商品详情页海报'
    })

    const anchorY = ref(0)
    const qrcodeImage = ref('')
    const appStore = useAppStore()

    const { systemInfo } = storeToRefs(appStore)
    const goodsStore = useGoodsStore()

    const images = computed(() => {
      return goodsDetail.value.coverImages
    })
    const selectedImages = ref([])

    /** 初始化画布 */
    const initCanvas = () => {
      PADDING.value = 6
      nextTick(() => {
        if (process.env.TARO_ENV === 'h5') {
          const canvas = document.getElementById(canvasId.value) as HTMLCanvasElement
          if (!canvas) return void 0
          const ctx = canvas.getContext('2d')
          if (ctx?.getTransform().a === 1) {
            ctx!.scale(DPR, DPR)
          }
          canvasRef.value = canvas as any
          contextRef.value = ctx as any
          draw()
          bgCanvasRef.value = document.getElementById(bgCanvasId.value) as any
          bgContextRef.value = bgCanvasRef.value!.getContext('2d') as any
        } else {
          Taro.createSelectorQuery()
            .select(`#${canvasId.value}`)
            ?.node()
            .exec(res => {
              const canvas = res[0]?.node
              canvas.width = CANVAS_WIDTH * DPR
              canvas.height = CANVAS_HEIGHT * DPR
              canvasRef.value = canvas
              const ctx = canvas.getContext('2d')
              if (ctx?.getTransform().a === 1) {
                ctx!.scale(DPR, DPR)
              }
              contextRef.value = ctx
              draw()
            })
          Taro.createSelectorQuery()
            .select(`#${bgCanvasId.value}`)
            .node()
            .exec(res => {
              const canvas = res[0].node
              canvas.width = BG_WIDTH * DPR
              canvas.height = BG_HEIGHT * DPR
              bgCanvasRef.value = canvas
              const ctx = canvas.getContext('2d')
              if (ctx?.getTransform().a === 1) {
                ctx!.scale(DPR, DPR)
              }
              bgContextRef.value = ctx
            })
        }
      })
    }

    watchEffect(() => {
      if (selectedImages.value.length === 0 && images.value.length > 0) {
        selectedImages.value.push(images.value[0])
      }
    })
    // 选择图片
    const toggleSelect = (item: string) => {
      if (selectedImages.value.includes(item)) {
        // 剔除图片
        const tempList = selectedImages.value.filter(it => it !== item)
        selectedImages.value = tempList
      } else {
        if (selectedImages.value.length >= 9) {
          useToast('最多可选9张图片')
          return void 0
        }
        selectedImages.value.push(item)
      }
      if (selectedImages.value?.length >= 1) {
        draw()
        // bug如影随形,看不懂,但管用 fix: 绘制图片后，图片会自动缩小，导致图片位置错位
        setTimeout(() => {
          PADDING.value = Number(PADDING.value) + 1
          PADDING.value = Number(PADDING.value) - 1
          draw()
        }, 500)
      }
    }

    const draw = async () => {
      renderText()
      const ctx = contextRef.value
      if (!ctx) {
        return void 0
      }
      ;(ctx as any).imageSmoothingEnabled = true
      // 起始坐标置0
      canvasHeight.value = 0
      anchorY.value = 0
      // 清除画布
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      const result = puzzle({
        images: selectedImages.value,
        width: CANVAS_WIDTH - PADDING.value * 2,
        dy: anchorY.value
      })

      // 绘制商品图片
      result?.list?.forEach(item => {
        // 商品的背景颜色
        ctx.fillStyle = '#ffffff'
        drawRoundRect(ctx, item.x + PADDING.value, item.y + PADDING.value, item.w, item.h, 14)
        ctx.fill()
        // drawImage(item.url, item.x + PADDING.value, item.y + PADDING.value, item.w, item.h, 4)
        drawImage(item.url, item.x + PADDING.value, item.y + PADDING.value, item.w, item.h, borderRadious.value)
      })
      anchorY.value += result?.height ?? 0

      anchorY.value = renderQRCode(ctx, anchorY.value) + 30

      // 将多余空白清除
      ctx.clearRect(0, anchorY.value, CANVAS_WIDTH, CANVAS_HEIGHT * DPR)
      canvasHeight.value = anchorY.value
      return void 0
    }

    const renderText = (ctx: Taro.CanvasContext & { [k: string]: any }, dy: number) => {
      let y = dy
      return void 0
    }

    // 画二维码和二维码上面文字
    const renderQRCode = (ctx: Taro.CanvasContext & { [k: string]: any }, dy: number) => {
      ctx.save()
      let y = dy + 4
      // 二维码
      const qrCodeSize = 70
      ctx.fillStyle = '#f1f1f1'
      ctx.fillRect(PADDING.value + 125, y + 40, qrCodeSize, qrCodeSize)
      drawImage(qrcodeImage.value, PADDING.value + 125, y + 40, qrCodeSize, qrCodeSize)
      // 绘制提示信息
      ctx.textBaseline = 'top'
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 15px Arial'

      const restRows: string[] = wrapText(
        ctx,
        goodsDetail.value?.shareTitle || goodsDetail.value?.title || '分享主标题',
        CANVAS_WIDTH - PADDING.value * 2,
        2
      )
      //  TODO
      restRows.forEach(text => {
        y += 17
        ctx.fillText(text, PADDING.value, y)
      })
      ctx.closePath()
      ctx.restore()
      y += 82
      return y
    }

    const init = () => {
      initCanvas()
      generateSpecifiedContentShortChain(
        getUtmData({
          page: 'packageA/goods/detail',
          goodsId: goodsDetail.value.id + '',
          utmSource: '海报分享',
          utmCampaign: '商品详情页海报'
        })
      ).then(async res => {
        console.log('初始化生成的短链:', res)
        console.log({
          page: 'packageA/goods/detail',
          goodsId: goodsDetail.value.id + '',
          utmSource: '海报分享',
          utmCampaign: '商品详情页海报'
        })
        // 获取二维码
        await $getWxacodeUnlimit({
          page: 'pagesB/goodDetail/GoodDetail',
          scene: `utmCode=${res.data.shortCode}`,
          env
        }).then(res => {
          if (res.success) {
            qrcodeImage.value = `data:image/png;base64,${res.data}`
            draw()
          } else {
            // 没获取到二维码时
            qrcodeImage.value = QrData
            draw()
          }
        })
      })
    }

    // 设计尺寸为375宽
    const deviceRatio = computed(() => systemInfo.value.windowWidth / 375)
    const savePoster = async () => {
      const withBg = false
      if (withBg) {
        await drawBg()
      }
      if (process.env.TARO_ENV === 'h5') {
        const link = document.createElement('a')
        link.href = (withBg ? bgCanvasRef : canvasRef).value!.toDataURL('image/png', 1)
        link.download = `${(withBg ? bgCanvasId : canvasId).value}.png`
        link.click()
      } else {
        const width = withBg ? BG_WIDTH : CANVAS_WIDTH
        Taro.canvasToTempFilePath({
          canvas: (withBg ? bgCanvasRef : canvasRef).value,
          x: 0,
          y: 0,
          width: width * deviceRatio.value,
          height: canvasHeight.value * deviceRatio.value,
          destWidth: width * DPR,
          destHeight: canvasHeight.value * DPR,
          success: function (res) {
            Taro.saveImageToPhotosAlbum({
              filePath: String(res.tempFilePath),
              success: () => {
                Taro.showToast({
                  title: '海报已经保存到相册',
                  icon: 'success'
                })
              },
              fail: err => {
                Taro.showToast({
                  title: '保存失败！' + err?.errMsg,
                  icon: 'none'
                })
              }
            })
          }
        })
      }
    }
    onMounted(init)

    return () => {
      return (
        <BasePage
          backgroundColor="#f5f5f5"
          navigator={{
            title: '海报绘制'
          }}
          class="poster-page"
        >
          <div class="poster-render">
            <div class="poster-render__tool">
              <ScrollView scrollX>
                <div class="poster-render__images">
                  {images.value.map(item => {
                    const i = selectedImages.value.indexOf(item)
                    const isSelected = i !== -1
                    return (
                      <div
                        class={['poster-render__image-item', isSelected && 'selected']}
                        style={{
                          backgroundImage: `url(${item})`
                        }}
                        onClick={() => {
                          toggleSelect(item)
                        }}
                      >
                        {isSelected && <div class="poster-render__image-index">{i + 1}</div>}
                      </div>
                    )
                  })}
                </div>
              </ScrollView>
            </div>

            <div class="options-layout">
              <div class="left-input-content">
                调整边距
                <InputNumber
                  v-model={PADDING.value}
                  step={1}
                  min={1}
                  max={11}
                  onChange={e => {
                    if (Number(e) >= 1 && Number(e) < 12) {
                      PADDING.value = Number(e)
                      draw()
                    }
                  }}
                ></InputNumber>
                {/*调整图片圆角
                <InputNumber
                  v-model={borderRadious.value}
                  step={1}
                  min={1}
                  max={11}
                  onChange={e => {
                    if (Number(e) >= 1 && Number(e) < 12) {
                      borderRadious.value = Number(e)
                      draw()
                    }
                  }}
                ></InputNumber>*/}
              </div>
              <div>
                <div class="poster-render__done" onClick={savePoster}>
                  保存海报
                </div>
              </div>
            </div>
            <div class="poster-render__view">
              <div class="poster-render__canvas-area">
                <div class="poster-render__canvas-wrapper">
                  <canvas
                    key={canvasId.value}
                    id={canvasId.value}
                    canvasId={canvasId.value}
                    type="2d"
                    width={process.env.TARO_ENV === 'h5' ? `${CANVAS_WIDTH * DPR}` : `${CANVAS_WIDTH * DPR}px`}
                    height={process.env.TARO_ENV === 'h5' ? `${CANVAS_HEIGHT * DPR}` : `${CANVAS_HEIGHT * DPR}px`}
                    class="poster-render__canvas"
                    style={{
                      width: withUnit(CANVAS_WIDTH),
                      height: process.env.TARO_ENV == 'h5' ? undefined : withUnit(CANVAS_HEIGHT)
                    }}
                    disableScroll={false}
                  />
                  <canvas
                    key={bgCanvasId.value}
                    id={bgCanvasId.value}
                    canvasId={bgCanvasId.value}
                    type="2d"
                    width={process.env.TARO_ENV === 'h5' ? `${BG_WIDTH * DPR}` : `${BG_WIDTH * DPR}px`}
                    height={process.env.TARO_ENV === 'h5' ? `${BG_HEIGHT * DPR}` : `${BG_HEIGHT * DPR}px`}
                    class="poster-render__canvas off-screen"
                    style={{
                      width: withUnit(BG_WIDTH),
                      height: process.env.TARO_ENV == 'h5' ? undefined : withUnit(BG_HEIGHT)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </BasePage>
      )
    }
  }
})
