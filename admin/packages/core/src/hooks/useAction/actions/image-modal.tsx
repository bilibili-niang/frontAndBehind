import ImageModalManifest from '@pkg/decoration/src/render-components/common-components/image-modal/manifest'
import { defineAction } from '../utils'
import ImageModal from '@pkg/decoration/src/render-components/common-components/image-modal/render'
import './image-modal.scss'
import { cloneDeep } from 'lodash'

const schema: any = cloneDeep(ImageModalManifest.schema)

delete schema.properties._tip
const { mode, maxCountEnable, maxCount, alwaysLimit, interval, ...resetRule } = schema.properties.rule.properties

schema.properties.rule.properties = resetRule

export default defineAction({
  key: 'image-modal',
  title: '图片弹窗',
  icon: 'xxx',
  schema: schema,
  default: {
    ...ImageModalManifest.default
  },
  preview: (props) => {
    return (
      <div class="d_image-modal-preview" style="font-size:12px">
        {/* @ts-ignore */}
        <ImageModal asPreview comp={{}} config={props.config} />
      </div>
    )
  }
})
