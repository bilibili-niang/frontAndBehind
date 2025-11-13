import { Modal } from '@anteng/ui'

const useVideoPreview = (config: { url: string }) => {
  Modal.open({
    title: '视频预览',
    zIndex: 9999,
    centered: true,
    content: (
      <div style="padding: 0 24px 20px 24px">
        <video
          style="width: 800px;height:auto;max-height:80vh; object-fit:contain;"
          src={config.url}
          autoplay={false}
          controls
        />
      </div>
    )
  })
}

export default useVideoPreview
