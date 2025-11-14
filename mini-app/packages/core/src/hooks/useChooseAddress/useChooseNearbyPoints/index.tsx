import { EmptyStatus, useLoading, useLoadingEnd, useModal, useToast } from '@anteng/core'
import { Icon, Search } from '@anteng/ui'
import './style.scss'
import { formatDistance, uuid } from '@anteng/utils'
import { ref } from 'vue'
import { $searchNearbyPoints } from '../api'

/** 附近点位 */
export interface INearbyPoint {
  /** poi 标志 */
  id: string
  /** 地名，标题 */
  title: string
  /** 地址 */
  address: string
  /** 坐标 */
  location: { lng: number; lat: number }
  /** 分类 */
  category: string
  /** 距离 */
  _distance: number
  /** 方位描述 */
  _dir_desc: string
  ad_info: {
    /** 行政区县编码 */
    adcode: number
    /** 省份 */
    province: string
    /** 城市 */
    city: string
    /** 区县 */
    district: string
  }
}

export const useChooseNearbyPoints = (options: {
  lng: number
  lat: number
  currentPoint?: INearbyPoint
  points?: INearbyPoint[]
  onSuccess?: (point: INearbyPoint) => void
  onCancel?: () => void
}) => {
  const list = ref<INearbyPoint[]>(options.points || [])
  const keywords = ref('')
  const listKey = ref(uuid())

  const onSearch = (k: string) => {
    searchFocus.value = false
    keywords.value = k
    if (keywords.value) {
      useLoading()
      $searchNearbyPoints({
        keywords: keywords.value,
        lng: options.currentPoint?.location.lng || options.lng,
        lat: options.currentPoint?.location.lat || options.lat
      })
        .then((res: any) => {
          list.value = res.data
          listKey.value = uuid()
        })
        .catch(err => {
          useToast('搜索出错了')
          console.log(err)
        })
        .finally(() => {
          useLoadingEnd()
        })
    }
  }

  const onSelect = (index: number) => {
    options.onSuccess?.(list.value[index])
    modal.close()
  }

  const searchFocus = ref(false)

  const modal = useModal({
    title: '选择周边地点',
    height: 'max',
    padding: 0,
    backgroundColor: '#f3f6fa',
    content: () => {
      return (
        <div class="use-poi-choose">
          <div class="use-poi-choose__sticky-top">
            <div class="use-poi-choose__search">
              <Search
                class="search"
                placeholder="输入周边地点进行搜索"
                focus={searchFocus.value}
                keywords={keywords.value}
                onFocus={() => (searchFocus.value = true)}
                onBlur={() => (searchFocus.value = false)}
                onSearch={onSearch}
              />
              {/* <Icon name="search" />
              <input class="input" placeholder="输入周边地点进行搜索" /> */}
            </div>
          </div>
          {options.currentPoint && (
            <div class="use-poi-choose__current">
              <div class="use-poi-choose__item">
                <div class="icon"></div>
                <div class="content">
                  <div class="name">{options.currentPoint.title}</div>
                  <div class="address">
                    <div class="text">{options.currentPoint.address}</div>
                    <div class="distance">当前选点</div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div class="use-poi-choose__list" key={listKey.value}>
            {list.value.map((item, index) => {
              return (
                <div
                  class="use-poi-choose__item"
                  onClick={() => {
                    onSelect(index)
                  }}
                >
                  <div class="icon">
                    <Icon name="location" />
                  </div>
                  <div class="content">
                    <div class="name">{item.title}</div>
                    <div class="address">
                      <div class="text">{item.address}</div>
                      {item._distance > 2 ? (
                        <div class="distance">{formatDistance(item._distance)}</div>
                      ) : (
                        <div class="distance">≤ 2m</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            {list.value.length === 0 && <EmptyStatus title="未查询到相关地点" description="换个关键词试试？" />}
          </div>
        </div>
      )
    }
  })
}
