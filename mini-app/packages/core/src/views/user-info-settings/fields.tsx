import { Checkbox, JsonView } from '@anteng/ui'
import { emitter, useAppStore, useImagePreview, useTableAddress } from '../../../lib'
import { withImageResize } from '../../utils/image-process/index'
import type { Schema } from '@anteng/jsf'
import { commonDelete } from '@anteng/utils'
import { pickBy } from 'lodash'
import { $deleteUserProfileFaceImage } from '../../api/user-profile'
import './style.scss'

const genderOptions = [
  { label: '男', value: 1 },
  { label: '女', value: 0 },
  { label: '保密', value: undefined }
]

const refresh = () => {
  // 刷新表格
  emitter.emit('user-profile-refresh')
}
const SCENE_VENUE = 'venue'

export const useProfileFieldsMap = pickBy(
  {
    name: {
      title: '姓名／称呼',
      desc: '',
      tableRender: {
        customRender: ({ record }: any) => {
          return record.infoContent.name || <span class="color-disabled">-</span>
        }
      },
      schema: {
        title: '姓名／称呼',
        type: 'string',
        required: true,
        config: {
          placeholder: '请输入用户姓名／称呼'
        }
      }
    },
    gender: {
      title: '性别',
      desc: '1 男性，0 女性，null 保密（未设置）',
      tableRender: {
        customRender: ({ record }: any) => {
          if ([undefined, null].includes(record.infoContent.gender)) {
            return <span class="color-disabled">-</span>
          }
          return genderOptions.find((i) => i.value === record.infoContent.gender)?.label
        }
      },
      schema: {
        title: '性别',
        type: 'number',
        widget: 'radio-button',
        config: {
          options: genderOptions
        }
      }
    },
    address: {
      title: '地区',
      desc: () => {
        return (
          <div>
            <div>示例数据：</div>
            <JsonView
              name="address"
              data={{
                latitude: 24.865671,
                longitude: 118.607339,
                address: '福建省泉州市晋江市陈埭镇鸿源路1184号',
                province: '福建省',
                city: '泉州市',
                district: '晋江市',
                title: '福建省泉州市晋江市陈埭镇鸿源路1184号',
                code: ''
              }}
            />
          </div>
        )
      },
      tableRender: {
        width: 300,
        customRender: ({ record }: any) => {
          return useTableAddress(record.infoContent.address) || <span class="color-disabled">-</span>
        }
      },
      schema: {
        title: '地区',
        type: 'object',
        widget: 'address-selector'
      }
    },
    birthday: {
      title: '生日',
      desc: () => (
        <div>
          <div>格式：YYYY-MM-DD</div>
          <div>示例数据：2000-01-01</div>
        </div>
      ),
      tableRender: {
        width: 120,
        customRender: ({ record }: any) => {
          return record.infoContent.birthday || <span class="color-disabled">-</span>
        }
      },
      schema: {
        title: '生日',
        type: 'string',
        widget: 'date-picker',
        config: {
          format: 'YYYY-MM-DD'
        }
      }
    },
    height: {
      title: '身高',
      desc: '用户身高（单位：cm）',
      scene: [SCENE_VENUE],
      tableRender: {
        customRender: ({ record }: any) => {
          return record.infoContent.height ? `${record.infoContent.height}cm` : <span class="color-disabled">-</span>
        }
      },
      schema: {
        title: '身高',
        type: 'number',
        config: {
          min: 0,
          max: 250,
          suffix: 'cm',
          style: 'width:140px'
        }
      }
    },
    faceImage: {
      title: '人脸',
      desc: '用户上传的人脸图片链接',
      scene: [SCENE_VENUE],
      tableRender: {
        width: 100,
        customRender: ({ record }: any) => {
          const imageUrl = record.infoContent.faceImage
          if (!imageUrl) {
            return <div class="color-disabled">暂无</div>
          }
          return (
            <div style="margin: -12px">
              <img
                class="user-profile-face clickable"
                src={withImageResize(imageUrl, { w: 50, h: 50 })}
                alt="刷脸图片"
                onClick={() => {
                  useImagePreview({
                    url: imageUrl
                  })
                }}
              />
              <a
                onClick={() => {
                  commonDelete(
                    {
                      ...record,
                      name: `${record.infoContent.name}(${record.userPhone})的人脸信息`
                    },
                    $deleteUserProfileFaceImage,
                    refresh
                  )
                }}
              >
                重置
              </a>
            </div>
          )
        }
      },
      configSchema: {
        type: 'object',
        properties: {
          enableAlbumUpload: {
            title: '上传方式',
            type: 'boolean',
            widget: (props) => {
              return (
                <div>
                  <Checkbox style="opacity:0.4" class="cursor-disabled" value="camera" checked={true}>
                    拍照上传
                  </Checkbox>
                  &emsp;
                  <Checkbox value="upload" checked={props.value} onChange={(e) => props.onChange(e.target.checked)}>
                    相册上传
                  </Checkbox>
                </div>
              )
            }
          }
        }
      } as Schema,
      schema: {
        title: '人脸',
        type: 'string',
        widget: 'image',
        config: {
          compact: true,
          width: 150,
          ratio: '3:4'
        }
      }
    }
  },
  (item) => {
    return !item.scene || item.scene?.includes(useAppStore().scene)
  }
)

export const initialUserProfileConfig = Object.keys(useProfileFieldsMap).map((key) => {
  const item = useProfileFieldsMap[key]
  return {
    key: key,
    name: item.title,
    sort: 0,
    config: {},
    status: 0,
    required: 0,
    modifiable: 1
  }
})
