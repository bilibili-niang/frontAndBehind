import { defineComponent, computed } from 'vue'
import { type ImageDefine, uuid } from '@pkg/core'
import './style.scss'
import { CommonWidgetPropsDefine } from '../../../../types/widget'
import { getWidgetConfig } from '../../../../utils/widget'
import { ImageWidget } from '../../../default/widgets/image'

const ImagesWidget = defineComponent({
  name: 'JSFWidgetImage',
  props: CommonWidgetPropsDefine,
  setup(props) {
    const uiRatio = getWidgetConfig(props.schema, 'ratio')
    const ratio = computed(() => {
      if (/^[1-9]\d*:[1-9]\d*$/.test(uiRatio)) {
        const w = uiRatio.split(':')[0]
        const h = uiRatio.split(':')[1]
        return w / h
      } else {
        return 4 / 3
      }
    })
    const rowCount = 3
    const itemStyle = computed(() => {
      return {
        width: `calc((100% - 8px * ${rowCount - 1}) / ${rowCount})`
      }
    })
    const isSample = getWidgetConfig(props.schema, 'simple')
    const compact = getWidgetConfig(props.schema, 'compact')
    const maxCount = getWidgetConfig(props.schema, 'max')

    const onItemChange = (index: number, value: ImageDefine) => {
      const currentValue = Array.isArray(props.value) ? props.value : []

      if (Array.isArray(value)) {
        currentValue.splice(index, 0, ...value.map((item) => (compact ? item.url : item)))
        props.onChange(currentValue)
        return void 0
      }

      const isDelete = !value.url
      if (isDelete) {
        currentValue.splice(index, 1)
      } else {
        currentValue.push(compact ? value.url : value)
      }
      props.onChange(currentValue)
    }

    return () => {
      const list = (Array.isArray(props.value) ? [...props.value] : []).map((item) => {
        return typeof item === 'string' ? { url: item } : item
      })
      if (!(list.length >= maxCount)) {
        list.push(null)
      }

      return (
        <div class="sw_images">
          {list.map((item, index) => {
            return (
              <ImageWidget
                config={props.schema.config}
                {...props.schema.config}
                key={uuid()}
                class="sw_images-item"
                style={itemStyle.value}
                ratio={ratio.value}
                simple={isSample}
                image={item as ImageDefine}
                multiple
                onChange={(value) => {
                  onItemChange(index, value)
                }}
              />
            )
          })}
        </div>
      )
    }
  }
})

export default ImagesWidget
