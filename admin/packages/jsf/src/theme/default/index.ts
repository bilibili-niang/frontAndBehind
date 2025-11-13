// 装修组件默认widget
import type { Theme } from '../../types/theme'
import array from './widgets/array'
import boolean from './widgets/boolean'
import number from './widgets/number'
import object from './widgets/object'
import string from './widgets/string'
import borderRadius from './widgets/border-radius'
import group from './widgets/group'
import suite from './widgets/suite'
import select from './widgets/select'
import radioButton from './widgets/radio-button'
import fill from './widgets/fill'
import color from './widgets/color'
import image from './widgets/image'
import textarea from './widgets/textarea'
import menu from './widgets/menu'
import { BUILT_IN_THEME_COMPACT } from '../../constants'
import padding from './widgets/padding'
import slider from './widgets/slider'
import audio from './widgets/audio'
import video from './widgets/video'
import richText from '../standard/widgets/rich-text'
import FileWidget from '../default/widgets/file'
import ActionWidget from '../standard/widgets/action'
import ActionImageWidget from './widgets/action-image'

const defaultTheme: Theme = {
  name: BUILT_IN_THEME_COMPACT,
  widgets: {
    string,
    input: string,
    select: select,
    'radio-button': radioButton,
    fill,
    color,
    textarea,
    'rich-text': richText,

    number,
    slider: slider,

    boolean,
    switch: boolean,

    // Object
    object,
    group,
    suite,
    image,
    menu,
    audio,

    // 数组
    array,
    'border-radius': borderRadius,
    padding,
    video,
    file: FileWidget,
    action: ActionWidget,
    'action-image': ActionImageWidget
  },
  presetSchema: {},
  pureWidgets: ['object', 'array', 'group', 'menu']
}

export default defaultTheme
