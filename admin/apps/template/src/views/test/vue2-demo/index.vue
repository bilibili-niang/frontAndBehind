<template>
  <div class="vue2-demo-page">
    <div class="card">
      <h2>Vue2 风格测试页面（Options API）</h2>
      <div class="form-row">
        <label>输入文本：</label>
        <input v-model="text" placeholder="随便输入点什么" />
      </div>
      <div class="form-row">
        <label>计数器：</label>
        <span class="count">{{ count }}</span>
        <Button @click="inc">+1</Button>
        <Button @click="reset">重置</Button>
      </div>
      <div class="summary">当前摘要：{{ summary }}</div>
    </div>

    <div class="code-block">
      <!-- 展示本页面源码 -->
      <SourceView :filename="'src/views/test/vue2-demo/index.vue'" :code="sourceCode" lang="html" />
    </div>
  </div>
</template>

<script>
import { SourceView, Button } from '@anteng/ui'
import sourceCode from './index.vue?raw'

// 路由元信息（用于菜单标题与排序）
export const routeMeta = {
  title: 'Vue2测试页面',
  order: 3
}

export default {
  name: 'Vue2DemoPage',
  components: { SourceView, Button },
  data() {
    return {
      text: '',
      count: 0,
      // 将上方模块内的源码字符串注入到实例，供模板使用
      sourceCode,
    }
  },
  computed: {
    summary() {
      return `${this.text || '空'}（计数：${this.count}）`
    }
  },
  methods: {
    inc() {
      this.count++
    },
    reset() {
      this.text = ''
      this.count = 0
    }
  }
}
</script>

<style scoped>
.vue2-demo-page {
  padding: 16px;
}
.card {
  background: var(--v-color-bg-50);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}
.form-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
}
.form-row input {
  flex: 1;
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #2a2a2a;
  background: var(--v-color-bg-50);
}
.count {
  min-width: 40px;
  display: inline-block;
  text-align: center;
}
button {
  padding: 6px 10px;
}
.summary {
  margin-top: 8px;
  color: #aaa;
}
.code-block {
  margin-top: 12px;
}
</style>