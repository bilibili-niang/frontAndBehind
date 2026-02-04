<template>
  <div>项目名：\{{ name }}</div>
  <div>描述：\{{ desc }}</div>
  <div>随机数：\{{ id }}</div>
</template>

<script lang="ts">
import { uuid } from '@pkg/utils'
import { ref } from 'vue'
import { defineComponent } from 'vue'
export default defineComponent({
  setup() {
    const id = ref(uuid())
    return {
      name: process.env.TARO_APP_NAME,
      desc: process.env.TARO_APP_DESC,
      id
    }
  }
})
</script>

<style scoped lang="scss"></style>
