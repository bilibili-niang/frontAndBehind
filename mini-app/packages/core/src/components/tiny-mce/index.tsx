import { computed, defineComponent, ref, watch } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import './style.scss'
import useImageSelector from '../../hooks/useImageSelector'
import { requestUploadFile } from '../../api/uploadImage'
import { message, Modal } from '@anteng/ui'
import Editor135 from './editor-135'
import use135 from './use135'
import Spin from '../spin'

export default defineComponent({
  name: '',
  props: {
    value: {
      type: String,
      default: ''
    },
    mobile: {
      type: Boolean,
      default: () => true
    }
  },
  emits: {
    change: (value: string) => true
  },
  setup(props, { emit }) {
    // const appStore = useAppStore()
    // const { theme } = storeToRefs(appStore)
    // const useDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches
    // const useDarkMode = computed(() => theme.value.mode === 'dark')
    // const isSmallScreen = window.matchMedia('(max-width: 1023.5px)').matches
    const contentRef = ref(props.value || '')
    const editorRef = ref<any>(null)
    const editorInitialized = ref(false)

    watch(
      () => props.value,
      () => {
        if (props.value !== contentRef.value) {
          contentRef.value = props.value
          editorRef.value?.setContent(contentRef.value)
        }
      }
    )

    const onContentChange = (content: string) => {
      handleChange(content)
      editorRef.value?.setContent(contentRef.value)
    }

    const handleChange = (v: string) => {
      contentRef.value = v
      emit('change', v)
    }

    const onStart135 = () => {
      use135(contentRef.value, onContentChange)
    }

    const pageWidth = ref('375px')

    const config = computed(() => {
      return {
        selector: 'textarea#open-source-plugins',
        language: 'zh_CN',
        plugins:
          'preview importcss searchreplace autolink save directionality code visualblocks visualchars fullscreen link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap quickbars emoticons accordion',
        editimage_cors_hosts: ['picsum.photos'],
        menu: {
          customHelp: { title: '帮助', items: 'help 135guide' }
        },
        menubar: 'file edit view insert format tools table customHelp',
        toolbar: [
          'undo redo blocks fontfamily fontsize | code | 135 | web/mobile',
          'bold italic underline strikethrough align lineheight indent outdent forecolor backcolor removeformat accordion numlist bullist | customImageUploader link | table media | charmap emoticons fullscreen '
        ],
        plugin_preview_height: 670,
        plugin_preview_width: 370,

        // 自定义字体
        font_family_formats: `
          微软雅黑=Microsoft YaHei,Helvetica Neue,PingFang SC,sans-serif;
          苹果苹方=PingFang SC,Microsoft YaHei,sans-serif;
          宋体=simsun,serif;
          仿宋体=FangSong,serif;
          黑体=SimHei,sans-serif;
          Arial=arial,helvetica,sans-serif;
          Arial Black=arial black,avant garde;
          Book Antiqua=book antiqua,palatino
        `,

        // 字体大小
        font_size_formats: '10px 11px 12px 13px 14px 15px 16px 18px 20px 22px 24px 26px 28px 30px 32px 34px 36px',
        font_size_input_default_unit: 'px',
        font_size_input_default: '14px',
        autosave_ask_before_unload: true,
        autosave_interval: '30s',
        autosave_prefix: '{path}{query}-{id}-',
        autosave_restore_when_empty: false,
        autosave_retention: '2m',
        image_advtab: false,
        importcss_append: true,
        file_picker_callback: (callback: any, value: any, meta: any) => {
          // console.log(callback, value, meta)
          // /* Provide file and text for the link dialog */
          // if (meta.filetype === 'file') {
          //   callback('https://www.google.com/logos/google.jpg', { text: 'My text' })
          // }
          // /* Provide image and alt text for the image dialog */
          // if (meta.filetype === 'image') {
          //   callback('https://www.google.com/logos/google.jpg', { alt: 'My alt text' })
          //   // callback()
          // }
          // /* Provide alternative source and posted for the media dialog */
          // if (meta.filetype === 'media') {
          //   callback('movie.mp4', { source2: 'alt.ogg', poster: 'https://www.google.com/logos/google.jpg' })
          // }
        },
        images_upload_handler: (blobInfo: any, success: any, failure: any) => {
          // console.log('自定义图片上传')
          // console.log(blobInfo)
          // console.log(failure)
          // console.log(success)
          const blob = blobInfo.blob()
          const file = new File([blob], blobInfo.filename(), { type: blob.type })
          return new Promise((resolve, reject) => {
            requestUploadFile(file)
              .then((res) => {
                resolve(res.data.uri || res.data.url)
              })
              .catch((err) => {
                message.error('图片上传失败！')
              })
          })
        },
        resize: false,
        branding: false,
        image_caption: true,
        quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
        noneditable_class: 'mceNonEditable',
        toolbar_mode: 'sliding',
        contextmenu: 'link image table',
        skin: 'oxide',
        content_css: 'default',
        content_style: props.mobile
          ? `html { width: ${pageWidth.value}; margin: auto; background-color: #f3f3f3; overflow-x: auto; } body.mce-content-body { font-family:sans-serif; font-size:14px; overflow-x: hidden; width: 100%; margin: 12px auto; background-color: #ffff; min-height: 480px;} p { margin: 0 } img { max-width: 100%!important; height: auto; }`
          : undefined,
        setup: (editor: any) => {
          editorRef.value = editor
          editor.ui.registry.addButton('customImageUploader', {
            icon: 'image',
            tooltip: '选择/上传图片',
            onAction: function () {
              useImageSelector({
                multiple: true,
                onSuccess(image) {
                  const images = Array.isArray(image) ? image : [image]
                  images.forEach((i) => {
                    editor.insertContent(
                      // `<img alt="Smiley face" height="${image.height}" width="${image.width}" src="${image.url}"/>`
                      `<img style="max-width:100%" src="${i.url}"/>`
                    )
                  })
                }
              })
            }
          })

          editor.ui.registry.addIcon(
            '135',
            '<svg t="1699868998577" class="icon" width="20" height="20" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10628" xmlns:xlink="http://www.w3.org/1999/xlink" width="256" height="256"><path d="M1016.323 512.422c0 278.14-225.495 503.637-503.636 503.637-278.157 0-503.652-225.497-503.652-503.637C9.036 234.25 234.531 8.771 512.688 8.771c278.14 0 503.635 225.479 503.635 503.651z" fill="#F5CB2B" p-id="10629"></path><path d="M245.057 492.895c-11.11 0-21.898-5.809-27.771-16.166-8.676-15.319-3.298-34.767 12.021-43.443l71.06-40.27-72.016-40.87c-15.319-8.691-20.681-28.141-11.989-43.46 8.676-15.303 28.125-20.682 43.444-11.989l120.9 68.61a31.854 31.854 0 0 1 16.151 27.725 31.866 31.866 0 0 1-16.166 27.726l-119.946 67.978a31.685 31.685 0 0 1-15.688 4.159z m536.201-0.368a31.298 31.298 0 0 1-15.797-4.27l-118.125-68.594a31.51 31.51 0 0 1 0.015-54.511l117.202-67.978c15.04-8.738 34.319-3.606 43.057 11.435 8.739 15.057 3.607 34.337-11.435 43.074l-70.259 40.747 71.184 41.333c15.058 8.737 20.158 28.018 11.436 43.074-5.857 10.064-16.429 15.69-27.278 15.69zM332.191 737.039c-2.357 0-4.747-0.339-7.12-1.018-13.546-3.928-21.375-18.014-17.507-31.577 15.027-52.629 77.411-152.123 205.924-152.123 128.653 0 189.942 98.971 204.367 151.292 3.76 13.639-4.252 27.739-17.876 31.499-13.624 3.776-27.74-4.237-31.501-17.876-1.294-4.547-33.766-113.703-154.99-113.703-121.439 0-155.313 110.374-156.7 115.074-3.283 11.16-13.516 18.432-24.597 18.432z" fill="#3E3417" p-id="10630"></path></svg>'
          )

          editor.ui.registry.addButton('135', {
            icon: '135',
            text: `没有模板素材？试试135编辑器`,
            tooltip: '135编辑器',
            class: 'xxxxx',
            onAction: function () {
              if (localStorage.getItem('skip-tiny-mce-135-guide') === 'true') {
                onStart135()
                return void 0
              }
              const modal = Modal.open({
                title: '使用说明',
                width: 'auto',
                centered: true,
                content: <Editor135 onClose={() => modal.destroy()} onStart={onStart135}/>
              })
            }
          })

          editor.ui.registry.addIcon(
            'pc',
            '<?xml version="1.0" encoding="UTF-8"?><svg width="19" height="19" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="19" y="32" width="10" height="9" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><rect x="5" y="8" width="38" height="24" rx="2" fill="none" stroke="#000000" stroke-width="4"/><path d="M22 27H26" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 41L34 41" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          )

          editor.ui.registry.addIcon(
            'mobile',
            '<?xml version="1.0" encoding="UTF-8"?><svg width="19" height="19" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="11" y="4" width="26" height="40" rx="3" fill="none" stroke="#000000" stroke-width="4"/><path d="M22 10L26 10" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 38H28" stroke="#000000" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
          )

          let isMobileView = pageWidth.value === '375px'

          editor.ui.registry.addButton('web/mobile', {
            icon: isMobileView ? 'mobile' : 'pc',
            text: isMobileView ? '移动端视图' : 'web端视图',
            tooltip: '切换视图模式',
            onAction: function (api) {
              if (isMobileView) {
                // 切换到PC视图
                pageWidth.value = 'calc(100% - 24px)'
                isMobileView = false
                api.setText('web端视图')
              } else {
                // 切换到移动视图
                pageWidth.value = '375px'
                isMobileView = true
                api.setText('移动端视图')
              }
              // 强制刷新编辑器
              editor.setContent(editor.getContent())
            }
          })

          editor.ui.registry.addMenuItem('135guide', {
            text: '135编辑器使用说明',
            icon: 'help',
            onAction: () => {
              const modal = Modal.open({
                title: '使用说明',
                width: 'auto',
                centered: true,
                content: <Editor135 onClose={() => modal.destroy()} onStart={onStart135}/>
              })
            }
          })

          editor.on('init', () => {
            editorInitialized.value = true
            if (contentRef.value) {
              editor.setContent(contentRef.value)
            }
          })
          editor.on('input', () => {
            handleChange(editor.getContent())
          })
          editor.on('change', () => {
            handleChange(editor.getContent())
          })
        }
      }
    })
    return () => {
      return (
        <div class="w_tiny-mce">
          <div class="mce-editor">
            {!editorInitialized.value && (
              <div class="mce-editor-loading">
                <Spin/>
                编辑器加载中，请稍候...
              </div>
            )}
            <Editor
              key={pageWidth.value}
              api-key={import.meta.env.VITE_TINYMCE_API_KEY}
              init={config.value}
              initial-value={props.value}
            />
          </div>
          {/* <div class="mce-preview" v-html={contentRef.value}>
            ...
          </div> */}
          {/* <Editor135 visible={true} /> */}
        </div>
      )
    }
  }
})
