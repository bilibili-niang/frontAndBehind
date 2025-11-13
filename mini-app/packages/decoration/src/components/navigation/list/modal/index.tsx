import Config from '../components/config'
import { message, Modal } from '@anteng/ui'
import { $getNavigationDetail } from '../../../../api'

export const createNavigation = (refresh: () => 0) => {
  const modal = Modal.open({
    title: '新建导航',
    width: 800,
    content: <Config
      onClose={() => modal.destroy()}
      onRefresh={refresh}
      class="p-3"
    />,
    centered: true
  })
}

export const updateNavigation = (id: string, refresh: () => 0) => {

  const loading = message.loading({
    content: '获取数据...'
  })
  // 获取详情
  $getNavigationDetail(id as string)
    .then(res => {
      if (res.success) {
        const modal = Modal.open({
          title: '编辑 ' + res.data.name,
          width: 800,
          content: <Config
            data={res.data}
            onClose={() => modal.destroy()}
            onRefresh={refresh}
            class="p-3"
          />,
          centered: true
        })
      }
    })
    .finally(loading)
}