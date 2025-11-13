<template>
  <div class="c_empty">
    <p>{{ description }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
export default defineComponent({
  props: {
    description: {
      default: '请在右侧编辑区域编辑组件配置'
    }
  },
  setup() {}
})
</script>

<style lang="scss">
.c_empty {
  height: 120px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 13px;
  letter-spacing: 1px;
}
</style>
