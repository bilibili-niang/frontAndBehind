// 多行商品
import { defineComponent, computed, ref, watch, PropType, ComputedRef } from 'vue'
import './style.scss'
import { withUnit } from '@anteng/utils'
import GoodsItem from './goods-item/index'
import getGoodsList from '../../../api/deck-comps/getGoodsList'
import useAction from '../../../hooks/useAction'
import { DeckComponentConfig } from '@anteng/deck'

type cacheArrayType = any

// multi-line-goods 可以配置的值
export interface multiLineGoodsType {
  styleAImage: {
    url: string
  }
  styleBImage: {
    url: string
  }
  styleCImage: {
    url: string
  }
  headerTitle: string
  subTitle: string
  styleType: string
  titleColor: string
  backgroundColor: string
  componentMargin: number[]
  componentRadius: number[]
  rowLayout: string
  componentPadding: number[]
  image: { width: string; height: string; url: string }
  goodsList: any[]
}

export default defineComponent({
  name: 'multiLineGoods',
  props: {
    comp: {
      type: Object as PropType<DeckComponentConfig<multiLineGoodsType>>,
      required: true
    }
  },
  setup(props) {
    // 组件外层
    const componentStyle = computed(() => {
      const {
        backgroundColor = 'rgba(0,0,0,.2)',
        componentMargin = [0, 0, 0, 0],
        componentPadding = [0, 0, 0, 0],
        componentRadius = [5, 5, 5, 5]
      } = props.comp.config
      return {
        background: backgroundColor,
        margin: componentMargin.map(i => withUnit(i)).join(' '),
        padding: componentPadding.map(i => withUnit(i)).join(' '),
        borderRadius: componentRadius.map((i: any) => withUnit(i)).join(' ')
      }
    })
    // 背景图
    const backgroundImgStyle = computed(() => {
      const { image = {} } = props.comp.config
      return {
        backgroundImage: `url(${image?.url})`
      }
    })
    const titleColor = computed(() => {
      const { titleColor = 'rgba(255,255,255,1)' } = props.comp.config
      return {
        color: titleColor
      }
    })
    // 存放商品列表
    const cacheArray = ref<any[]>([])
    // 第一行的商品列表
    const topGoods = ref()
    // 第二行的商品列表
    const bottomGoods = ref()

    // 计算出上下行需要划分的个数
    const splitArray: ComputedRef<number[]> = computed(() => {
      const { rowLayout = '2,3' } = props.comp.config
      const stringArray = rowLayout.split(',')

      return stringArray.length !== 2 ? [2, 3] : stringArray.map(str => parseInt(str, 10)) // Convert each string element to a number
    })

    // 获取商品的数据
    const getData = () => {
      if (props.comp.config?.goodsList === undefined || props.comp.config.goodsList?.length === 0) {
        return void 0
      } else {
        const goodsIds = props.comp.config.goodsList.map((item: any) => item?.goods?.id)
        if (goodsIds.length > 0) {
          getGoodsList(goodsIds).then(res => {
            // 需要根据id去重一次
            cacheArray.value = res.data.reduce((pre: any, cur: any) => {
              if (!pre.includes(cur.id)) {
                pre.push(cur)
              }
              return pre
            }, [])
            // 复制下图片列表的第一个
            cacheArray.value?.map((item: any) => {
              item.image = item.coverImages![0] || ''
            })
            // 划分
            topGoods.value = cacheArray.value.slice(0, Number(splitArray.value[0]))
            bottomGoods.value = cacheArray.value.slice(
              Number(splitArray.value[0]),
              Number(splitArray.value[0]) + Number(splitArray.value[1])
            )
          })
        }
      }
    }
    watch(
      () => props.comp.config.goodsList,
      () => {
        getData()
      },
      { immediate: true, deep: true }
    )

    // 监听上下两行的数字修改
    watch(
      () => props.comp.config.rowLayout,
      () => {
        getData()
      },
      { immediate: true, deep: true }
    )
    const jumpToTextStyle = computed(() => {
      const { jumpToTextSize = '12' } = props.comp.config
      return {
        fontSize: withUnit(Number(jumpToTextSize))
      }
    })
    const jumpTarget = computed(() => {
      const { arrowAction = '' } = props.comp.config
      return arrowAction
    })

    // 点击文字跳转
    const titleJump = () => {
      useAction(jumpTarget.value)
    }

    return () => {
      return (
        <div class="multiLineGoods-page">
          <div class="multi-line-goods-container" style={componentStyle.value}>
            <div
              class={[
                'backgroundImageCover',
                props.comp.config.styleType === 'styleB' && 'backgroundImageCover-styleB',
                props.comp.config.styleType === 'styleC' && 'backgroundImageCover-styleC'
              ]}
              style={backgroundImgStyle.value}
            >
              <img src={props.comp.config.image?.url} alt="" />
            </div>

            <div class={['m-l-title-' + props.comp.config.styleType, 'text-top-content']} style={titleColor.value}>
              <div class="m-l-title-container">
                <div class="headerTitle">{props.comp.config.headerTitle || '超值商品看得见质量'}</div>
                <div class="subTitle">{props.comp.config.subTitle || '错过再难遇'}</div>
              </div>
              <div class="m-l-button" style={jumpToTextStyle.value} onClick={titleJump}>
                {props.comp.config.styleType === 'styleA'
                  ? '查看全部'
                  : props.comp.config.styleType === 'styleB'
                  ? '全部'
                  : '查看更多'}
                {props.comp.config.styleType !== 'styleA' && <div class="iconfont icon-right"></div>}
              </div>
            </div>
            {props.comp.config.styleType === 'styleA' && (
              <div class="multi-line-goods-container-styleA">
                <div class="m-l-top-goods">
                  {topGoods.value?.map((it: cacheArrayType) => {
                    return <GoodsItem item={it} total={splitArray.value[0]} config={props.comp.config} />
                  })}
                </div>
                <div class="m-l-bottom-goods">
                  {bottomGoods.value?.map((it: cacheArrayType) => {
                    return <GoodsItem item={it} total={splitArray.value[1]} config={props.comp.config} />
                  })}
                </div>
              </div>
            )}
            {props.comp.config.styleType === 'styleB' && (
              <div class="styleB">
                <div class="one-line-goods">
                  {cacheArray.value?.map((it: cacheArrayType) => {
                    return <GoodsItem item={it} config={props.comp.config} />
                  })}
                </div>
              </div>
            )}
            {props.comp.config.styleType === 'styleC' && (
              <div class="styleC">
                <div class="m-l-top-goods">
                  {topGoods.value?.map((it: cacheArrayType) => {
                    return <GoodsItem item={it} total={splitArray.value[0]} config={props.comp.config} />
                  })}
                </div>
                <div class="m-l-bottom-goods">
                  {bottomGoods.value?.map((it: cacheArrayType) => {
                    return <GoodsItem item={it} total={splitArray.value[1]} config={props.comp.config} />
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }
  }
})
