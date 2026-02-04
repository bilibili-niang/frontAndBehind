import { computed } from 'vue'
import { useComputedValue, type ComputedValue } from '../useComputedValue'
import './style.scss'
import { difference } from 'lodash'
import test from '../../utils/test'
import { Button, Icon } from '@pkg/ui'
import useModal from '../useModal'
import { downloadFile, useContextMenu, useImagePreview } from '../../../lib'
import useVideoPreview from '../useVideoPreview'
import useAudioPreview from '../useAudioPreview'
import { copyText } from '@pkg/utils'

export const useFileRender = (
  files: ComputedValue<string[]>,
  options?: {
    /** 显示放大弹窗按钮 */
    showModal?: boolean
    /** 弹窗标题，默认 “文件列表” */
    modalTitle?: string
    /** 限制显示高度，超出后可以滚动 */
    maxHeight?: number
    /** item尺寸，默认 60 */
    itemSize?: number
    // /** 若不设置未将只显示链接（弹窗中按类型显示控件） */
    // renderTypes?: ('image' | 'video' | 'audio')[]
  }
) => {
  const filesRef = useComputedValue(files)
  const images = computed(() => {
    return filesRef.value.filter((item) => {
      return test.image(item)
    })
  })

  const videos = computed(() => {
    return filesRef.value.filter((item) => {
      return test.video(item)
    })
  })

  const audios = computed(() => {
    return filesRef.value.filter((item) => {
      return test.audio(item)
    })
  })

  const otherFiles = computed(() => {
    return difference(filesRef.value, images.value, videos.value, audios.value)
  })

  const showModal = () => {
    useModal({
      title: options?.modalTitle || '文件列表',
      content: () => {
        return (
          <div class="use-file-render-modal ui-scrollbar">
            <Content />
          </div>
        )
      }
    })
  }

  const ImageRender = (urls: string[]) => {
    return urls.map((url) => {
      return (
        <img
          class="clickable"
          src={url}
          onClick={(e) => {
            onLinkClick(e, url, 'image')
          }}
        />
      )
    })
  }

  const VideoRenders = (urls: string[]) => {
    return urls.map((url) => {
      return (
        <div class="video">
          <video
            class="clickable"
            src={url}
            controls={false}
            onClick={(e) => {
              onLinkClick(e, url, 'video')
            }}
          />
        </div>
      )
    })
  }

  const AudioRenders = (urls: string[]) => {
    return urls.map((url) => {
      return (
        <div
          class="audio clickable"
          onClick={(e) => {
            onLinkClick(e, url, 'audio')
          }}
        >
          <Icon name="music" />
        </div>
      )
    })
  }

  const OtherFileRenders = (urls: string[]) => {
    return urls.map((url) => {
      const extension = url.match(/\.([^.]+)$/)?.[0]
      const _url = extension ? url.replace(new RegExp(`${extension}$`), '') : url
      return (
        <div
          class="file clickable"
          onClick={(e) => {
            onLinkClick(e, url, 'file')
          }}
        >
          <div class="name">文件</div>
          <div class="extension">{extension?.replace('.', '').toUpperCase()}</div>
        </div>
      )
    })
  }

  const onLinkClick = (e: MouseEvent, url: string, type: 'image' | 'audio' | 'video' | 'file' = 'file') => {
    useContextMenu(e, {
      list: [
        type === 'file'
          ? {
              key: 'open',
              title: '打开链接',
              iconfont: 'link',
              handler: () => {
                window.open(url, '__blank')
              }
            }
          : {
              key: 'preview',
              title: '预览',
              iconfont: 'preview',
              handler: () => {
                type === 'image'
                  ? useImagePreview({ url })
                  : type === 'audio'
                  ? useAudioPreview({ url })
                  : type === 'video'
                  ? useVideoPreview({ url })
                  : undefined
              }
            },
        {
          key: 'copy',
          title: '复制链接',
          icon: 'copy',
          handler: () => {
            copyText(url)
          }
        },
        {
          key: 'download',
          title: '下载文件',
          icon: 'download-four-8ih3okff',
          handler: () => {
            downloadFile(url)
          }
        }
      ]
    })
  }

  const Content = () => {
    return (
      <div
        class="use-file-render-content ui-scrollbar"
        style={{
          maxHeight: options?.maxHeight + 'px'
        }}
      >
        <div class="use-file-render__medias">
          {ImageRender(images.value)}
          {VideoRenders(videos.value)}
          {AudioRenders(audios.value)}
          {OtherFileRenders(otherFiles.value)}
        </div>
        {/* <div class="use-file-render__files">
          {otherFiles.value.map((url) => {
            const extension = url.match(/\.([^.]+)$/)?.[0]
            const _url = extension ? url.replace(new RegExp(`${extension}$`), '') : url
            return (
              <div class="use-file-render__file-item clickable" onClick={(e) => onLinkClick(e, url)}>
                <a href="javascript:void(0)" class="name">
                  {_url}
                </a>
                {extension && <div class="extension">{extension.replace('.', '').toUpperCase()}</div>}
              </div>
            )
          })}
        </div> */}
      </div>
    )
  }

  return () => {
    return (
      <div
        class="use-file-render"
        style={{
          '--item-size': options?.itemSize
        }}
      >
        <div class="call-modal clickable" onClick={showModal}>
          <Icon name="zoom-in" />
        </div>
        <Content />
      </div>
    )
  }
}
