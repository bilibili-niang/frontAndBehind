// 注册默认widget
import type { Theme } from '../../types/theme'
import './style.scss'

import string from '../default/widgets/string'
import array from '../default/widgets/array'
import boolean from '../default/widgets/boolean'
import number from '../default/widgets/number'
import object from '../default/widgets/object'
import borderRadius from '../default/widgets/border-radius'
import group from '../default/widgets/group'
import suite from '../default/widgets/suite'
import select from '../default/widgets/select'
import radioButton from '../default/widgets/radio-button'
import radio from '../default/widgets/radio'
import fill from '../default/widgets/fill'
import color from '../default/widgets/color'
import image from '../default/widgets/image'
import textarea from '../default/widgets/textarea'
import cities from '../default/widgets/cities'
import audio from '../default/widgets/audio'
import video from '../default/widgets/video'
import padding from '../default/widgets/padding'
import fileUploader from './widgets/file-uploader'

// 标准风格
import images from './widgets/images'
import timeRange from './widgets/time-range'
import time from './widgets/time'
import addressSelector from './widgets/address-selector'
import treeSelet from './widgets/tree-select'
import list from './widgets/list'
import DateRange from './widgets/date-range'
import { BUILT_IN_THEME_STANDARD } from '../../constants'
import richText from './widgets/rich-text'
import Tag from './widgets/tag'
import timePicker from './widgets/time-picker'
import datePicker from './widgets/date-picker'
import dayPicker from './widgets/day-picker'
import rangePicker from './widgets/range-picker'
import FileWidget from '../default/widgets/file'
import contracts from './widgets/contracts'
import ActionWidget from './widgets/action'

const standardTheme: Theme = {
  name: BUILT_IN_THEME_STANDARD,
  widgets: {
    string,
    input: string,
    select: select,
    radio,
    'radio-button': radioButton,
    fill,
    color,
    textarea,
    cities,
    'tree-select': treeSelet,
    'rich-text': richText,
    tag: Tag,

    number,

    boolean,
    switch: boolean,

    // Object
    object,
    group,
    suite,
    image,
    audio,
    video,
    'address-selector': addressSelector,

    // 数组
    array,
    list,
    'border-radius': borderRadius,
    padding: padding,
    images,
    'time-range': timeRange,
    time,
    'date-range': DateRange,
    'time-picker': timePicker,
    'date-picker': datePicker,
    'day-picker': dayPicker,
    'range-picker': rangePicker,
    'file-uploader': fileUploader,
    file: FileWidget,
    contracts,
    action: ActionWidget
  },
  presetSchema: {},
  pureWidgets: ['object', 'array', 'group', 'list']
}

export default standardTheme
