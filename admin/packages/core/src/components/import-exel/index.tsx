// 导入表单文件
import DownloadFileRender from '../downloadFileRender/index'
import FileUploader from '../file-uploader/index'
import { useModal } from '@pkg/core'
import { ref } from 'vue'

/*
 * 导入表单文件
 * @param title 标题
 * @param templateUrl 模板文件地址
 * @param requestUrl 上传文件请求地址
 * @param refresh 刷新列表
 * @param formData 通过 multipart/form-data 一并上传的额外字段
 * @param params 追加到请求 query 的参数
 * @param maxSize 上传的文件最大值,默认6M
 * */
const importExel = ({
  title,
  templateUrl,
  requestUrl,
  refresh,
  formData = {},
  params = {},
  maxSize = 6 * 1024 * 1024
}: {
  title: string
  templateUrl?: string
  requestUrl: string
  refresh: Function
  formData?: Record<string, any>
  params?: Record<string, any>
  maxSize?: number
}) => {
  const uploadModal = ref('')

  uploadModal.value = useModal({
    title: title,
    width: 1000,
    content: () => (
      <div
        class="column p-20"
        style={{
          padding: '20px'
        }}
      >
        {templateUrl ? (
          <DownloadFileRender
            style={{
              marginBottom: '10px'
            }}
            item={templateUrl}
            placeholderText="下载模板"
          />
        ) : (
          ''
        )}
        <FileUploader
          uploadUrl={requestUrl}
          allowedTypes={['xlsx']}
          message="上传成功，请等待后台执行任务"
          formData={formData}
          params={params}
          onSuccess={() => {
            uploadModal.value?.destroy()
            refresh()
          }}
          maxSize={maxSize}
        />
      </div>
    )
  })
}

export { importExel }
