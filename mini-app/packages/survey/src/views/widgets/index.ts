import {
  WIDGET_RADIO,
  WIDGET_CHECKBOX,
  WIDGET_NPS,
  WIDGET_SELECT,
  WIDGET_INPUT,
  WIDGET_FILE_UPLOADER
} from '../../constants'
import { manifest as radio } from './radio'
import { manifest as checkbox } from './checkbox'
import { manifest as select } from './select'
import { manifest as input } from './input'
import { manifest as nps } from './nps'
import { manifest as fileUploader } from './file-uploader'

export const manifestMap: Record<string, any> = {
  [WIDGET_RADIO]: radio,
  [WIDGET_CHECKBOX]: checkbox,
  [WIDGET_SELECT]: select,
  [WIDGET_INPUT]: input,
  [WIDGET_NPS]: nps,
  [WIDGET_FILE_UPLOADER]: fileUploader
}
