import { computed, defineComponent, ref } from 'vue'
import { useSearchTable, $resumeList } from '@anteng/core'
import { Button, Image } from '@anteng/ui'
import { useRouter } from 'vue-router'

export default defineComponent({
  setup() {
    const router = useRouter()
    const unionKeys = ref<string[]>([])

    const baseColumns = [
      { dataIndex: 'id', title: 'ID', width: 100 },
      { dataIndex: 'title', title: '标题', width: 200 },
      {
        dataIndex: 'img',
        title: '封面',
        width: 120,
        customRender: ({ text }: any) => (text ? <Image src={text} width={60} /> : '-')
      },
      { dataIndex: 'createdAt', title: '创建时间', width: 180 }
    ]

    const columns = computed(() => [
      ...baseColumns,
      ...unionKeys.value.map((k) => ({
        dataIndex: `data.${k}`,
        title: k,
        width: 180,
        customRender: ({ record }: any) => {
          const v = record?.data?.[k]
          return typeof v === 'object' ? JSON.stringify(v) : (v ?? '-')
        }
      }))
    ])

    const { Table } = useSearchTable({
      title: '简历列表',
      toolbar: (
        <div>
          <Button type="primary" onClick={() => router.push('/resume/create')}>新建</Button>
        </div>
      ),
      customRequest: async (params) => {
        const res: any = await $resumeList(params as any)
        const rows = Array.isArray(res?.data?.rows) ? res.data.rows : []
        const records = rows.map((r: any) => {
          let dataObj: any = {}
          try {
            dataObj = r?.data ? JSON.parse(r.data) : {}
          } catch {
            dataObj = {}
          }
          return { ...r, data: dataObj }
        })
        const keys = new Set<string>()
        records.forEach((r: any) => Object.keys(r.data || {}).forEach((k) => keys.add(k)))
        unionKeys.value = Array.from(keys)
        return {
          code: 200,
          success: true,
          msg: 'ok',
          data: {
            records,
            total: res?.data?.count ?? records.length,
            size: (params as any).size,
            current: (params as any).current,
            orders: [],
            optimizeCountSql: true,
            searchCount: true,
            maxLimit: null as any,
            countId: null as any,
            pages: Math.ceil((res?.data?.count ?? records.length) / ((params as any).size || 20))
          }
        }
      },
      table: computed(() => ({ columns: columns.value }))
    })

    return () => Table
  }
})