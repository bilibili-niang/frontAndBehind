import { PropType, computed, defineComponent, shallowRef, watch } from 'vue'
import './style.scss'
import './slide.scss'
import { DeckComponentConfig } from '../types'
import useAction from '../../../hooks/useAction'
import { navigateToInformationDetail } from '../../../router'
import { getInformationDetail } from '../../../api'

interface IInfomationCardConfig {
  list: {
    id: string | number | null
    name: string
  }[]
  theme: 'default' | 'slide'
  ratio: {
    width: number
    height: number
    objectFit: 'fill' | 'contain' | 'cover'
  }
  showDate: boolean
}

export default defineComponent({
  name: 'C_InformationCard',
  props: {
    config: {
      type: Object as PropType<DeckComponentConfig<IInfomationCardConfig>>,
      required: true
    }
  },
  setup(props) {
    const list = computed(() => {
      const list = Array.isArray(props?.config?.list) ? props.config.list : []
      return list
    })

    const dataRef = shallowRef<Record<string, any>>([])

    const fetchData = async () => {
      const id = props.config?.list.map(item => item?.id).filter(id => !!id && !dataRef.value.hasOwnProperty(id))
      if (id.length > 0) {
        try {
          Promise.all(id.map(it => getInformationDetail(it))).then(res => {
            dataRef.value = []
            res.map(it => {
              dataRef.value.push(it.data)
            })
          })
        } catch (err) {}
      }
      // dataRef.value = { ...dataRef.value }
    }

    watch(
      () => props.config?.list,
      () => {
        fetchData()
      },
      { immediate: true, deep: true }
    )

    const thumbnailStyle = computed(() => {
      const { ratio } = props.config
      const r = ratio.height / ratio.width || 5 / 8
      return {
        paddingBottom: `${r * 100}%`,
        backgroundSize: ratio.objectFit === 'fill' ? '100% 100%' : ratio.objectFit
      }
    })

    const useClick = (item: any) => {
      if (item.contentType === 0) {
        useAction(item.action)
      } else {
        navigateToInformationDetail(item.id)
      }
    }
    return () => {
      if (props.config.theme === 'slide') {
        return (
          <div class="c_information-card-list--slide">
            {list.value.map(item => {
              if (!item) return null
              const hasData = !!(item?.id && dataRef.value?.find(it => it?.id === item.id))
              const data = hasData ? dataRef.value?.find(it => it.id === item.id) : undefined
              if (!data) {
                return null
              }
              return (
                <div class={['c_information-card--slide', !hasData && '--shadow']} onClick={() => useClick(data)}>
                  <div
                    class="c_information-card--slide__thumbnail"
                    style={[thumbnailStyle.value, `background-image:url(${data.coverImageUri})`]}
                  ></div>
                  <div class="c_information-card--slide__title">{data.title}</div>
                  {props.config.showDate && (
                    <div class="c_information-card--slide__date">{data.createTime?.slice(0, 10)}</div>
                  )}
                </div>
              )
            })}
          </div>
        )
      }
      return (
        <div class="c_information-card-list">
          {list.value.map(item => {
            if (!item) return null
            const hasData = !!(item?.id && dataRef.value?.find(it => it?.id === item.id))
            const data = dataRef.value?.find(it => it?.id === item.id)
            if (!hasData) return null
            return (
              <div
                class={['c_information-card', !hasData && 'c_information-card--shadow']}
                onClick={() => useClick(data)}
              >
                <div class="c_information-card__content">
                  <div class="c_information-card__text">
                    <div class="c_information-card__title">{data.title}</div>
                    <div class="c_information-card__desc">{data.subtitle}</div>
                  </div>
                  {data.coverImageUri && <img class="c_information-card__thumbnail" src={data.coverImageUri} />}
                </div>
                <div class="c_information-card__footer">
                  <span class="c_information-card__type"></span>
                  {props.config.showDate && <span class="c_information-card__date">{data.createTime}</span>}
                </div>
              </div>
            )
          })}
        </div>
      )
    }
  }
})
