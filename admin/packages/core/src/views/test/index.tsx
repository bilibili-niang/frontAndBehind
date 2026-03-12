import { defineComponent, ref } from 'vue'
import { Card, Button, Space, Typography, Alert, Divider, Tag } from 'ant-design-vue'
import type { RouteMeta } from '@/router/routeMeta'

const { Title, Paragraph, Text } = Typography

/**
 * 路由元数据
 * purePage: 页面独占模式，不显示侧边栏与顶部栏
 * hideInMenu: 不在菜单中显示
 * hideInProd: 生产环境隐藏
 */
export const routeMeta: RouteMeta = {
  title: '测试页面',
  purePage: true,
  hideInMenu: true,
  hideInProd: true
}

/**
 * 测试页面
 * 用于开发调试和功能测试，不需要登录即可访问
 */
export default defineComponent({
  name: 'TestPage',
  setup() {
    const count = ref(0)
    const testData = ref([
      { id: 1, name: '测试项 1', status: 'success' },
      { id: 2, name: '测试项 2', status: 'pending' },
      { id: 3, name: '测试项 3', status: 'error' }
    ])

    const handleIncrement = () => {
      count.value++
    }

    const handleReset = () => {
      count.value = 0
    }

    const getStatusColor = (status: string) => {
      const colorMap: Record<string, string> = {
        success: 'green',
        pending: 'orange',
        error: 'red'
      }
      return colorMap[status] || 'default'
    }

    return () => (
      <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Title level={2}>🧪 测试页面</Title>
        <Paragraph type="secondary">
          这是一个测试页面，用于开发调试和功能验证。无需登录即可访问。
        </Paragraph>

        <Divider />

        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* 计数器测试 */}
          <Card title="计数器测试" bordered={false}>
            <Space size="large" align="center">
              <Text strong style={{ fontSize: '24px' }}>{count.value}</Text>
              <Button type="primary" onClick={handleIncrement}>
                +1
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Card>

          {/* 状态测试 */}
          <Card title="状态标签测试" bordered={false}>
            <Space size="middle">
              {testData.value.map(item => (
                <Tag key={item.id} color={getStatusColor(item.status)}>
                  {item.name}
                </Tag>
              ))}
            </Space>
          </Card>

          {/* 提示信息 */}
          <Alert
            message="测试页面说明"
            description="
              1. 本页面无需登录即可访问
              2. 用于开发调试和功能验证
              3. 可以在这里测试组件、API 接口等
              4. 生产环境建议禁用或移除此页面
            "
            type="info"
            showIcon
          />

          {/* 环境信息 */}
          <Card title="环境信息" bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Text type="secondary">当前时间: </Text>
                <Text>{new Date().toLocaleString()}</Text>
              </div>
              <div>
                <Text type="secondary">用户代理: </Text>
                <Text code>{navigator.userAgent}</Text>
              </div>
              <div>
                <Text type="secondary">页面路径: </Text>
                <Text code>{window.location.pathname}</Text>
              </div>
            </Space>
          </Card>

          {/* API 测试区域 */}
          <Card title="API 测试" bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Paragraph>
                可以在这里添加 API 测试按钮，调用后端接口验证功能。
              </Paragraph>
              <Space>
                <Button type="primary">测试 GET 请求</Button>
                <Button>测试 POST 请求</Button>
              </Space>
            </Space>
          </Card>
        </Space>
      </div>
    )
  }
})
