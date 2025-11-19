<template>
  <div>姓名：\{{ props.name ?? name }}，年龄：\{{ props.age }}</div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
const props = withDefaults(
  defineProps<{
    name: string
    age?: number
    gender: number
  }>(),
  {
    age: 18
  }
)
const name = ref('匿名用户')
</script>

<style scoped lang="scss"></style>
