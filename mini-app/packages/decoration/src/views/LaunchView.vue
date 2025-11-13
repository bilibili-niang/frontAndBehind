<template>
  <div class="lego-launch" :class="failed && '--failed'">
    <div class="lego-launch__header">
      <div class="deck-editor-header__back clickable" :class="failed && '--hover'" @click="back">
        <iconpark-icon name="left"></iconpark-icon>
        <strong>返回控制台</strong>
      </div>
      <strong v-if="loading" style="margin-left: 12px">加载中，请稍候...</strong>
      <div style="margin-right: auto"></div>
      <i></i>
      <i></i>
      <i></i>
    </div>
    <div class="lego-launch__content">
      <div class="lego-launch__left">
        <div class="lego-launch__tab"></div>
        <div class="lego-launch__menu"></div>
      </div>
      <div class="lego-launch__center">
        <div class="lego-launch__loading-icon"></div>
        <div class="lego-launch__progress">
          <i></i>
        </div>
        <template v-if="failed">
          <strong class="lego-launch__failed">抱歉，加载失败了，请稍后再试。</strong>
          <div class="lego-launch__failed-actions">
            <Button @click="back">返回</Button>
            <Button type="primary" @click="create">创建新页面</Button>
          </div>
        </template>
      </div>
      <div class="lego-launch__right"></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { router } from '@anteng/core'
import useEditorStore from '../stores/editor'
import { storeToRefs } from 'pinia'
import { Button } from '@anteng/ui'

const back = () => {
  router.back()
}
const editorStore = useEditorStore()
const { loading, failed } = storeToRefs(editorStore)

const create = () => {
  router.back()
  setTimeout(() => {
    router.push('/deck/editor')
  }, 100)
}
</script>

<style scoped lang="scss">
.lego-launch {
  width: 100vw;
  height: 100vh;
  position: fixed;
  z-index: 100000;
  top: 0;
  left: 0;
  background-color: $color-bg-700;
  display: flex;
  flex-direction: column;
  &.\--failed {
    .lego-launch__progress i {
      background-color: $color-error;
    }
  }
}
.lego-launch__header {
  flex-shrink: 0;
  height: 48px;
  background-color: $color-bg-300;
  border-bottom: 1px solid $color-border-base;
  position: relative;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 0 8px;
  i {
    width: 68px;
    height: 28px;
    background-color: $color-bg-400;
    border-radius: 4px;
    margin: 4px;
  }
}
.lego-launch__content {
  flex: 1;
  display: flex;
}
.lego-launch__left {
  height: 100%;
  // width: 344px;
  background-color: $color-bg-300;
  border-right: 1px solid $color-border-base;
  // animation: launch_left 1s both;
  display: flex;
}
.lego-launch__menu {
  width: 280px;
}
.lego-launch__center {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.lego-launch__right {
  height: 100%;
  width: 333px;
  background-color: $color-bg-300;
  // animation: launch_right 1s both;
  border-left: 1px solid $color-border-base;
}
.lego-launch__tab {
  width: 64px;
  height: 100%;
  border-right: 1px solid $color-border-base;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 4px;
  i {
    width: 44px;
    height: 55px;
    background-color: $color-bg-400;
    margin: 8px 0;
    border-radius: 4px;
    opacity: 0.5;
  }
}
.lego-launch__loading-icon {
  width: 128px;
  height: 128px;
  background-size: 100% 100%;
  margin-right: 8px;
  mix-blend-mode: multiply;
  filter: contrast(2);
}
[theme='dark'] {
  .lego-launch__loading-icon {
    mix-blend-mode: difference;
    filter: invert(100%) contrast(2);
  }
}

.lego-launch__progress {
  width: 240px;
  height: 12px;
  background-color: $color-bg-300;
  border-radius: 16px;
  margin-top: 36px;
  overflow: hidden;
  i {
    display: block;
    width: 100%;
    height: 100%;
    background-color: $color-primary;
    border-radius: inherit;
    animation: launch_bar 1s both;
    transition: all 0.3s 1s;
  }
}

@keyframes launch_header {
  from {
    transform: translate3d(0, -100%, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes launch_left {
  from {
    transform: translate3d(-100%, 0, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes launch_right {
  from {
    transform: translate3d(100%, 0, 0);
  }
  to {
    transform: translate3d(0, 0, 0);
  }
}

@keyframes launch_bar {
  from {
    transform: translate3d(-100%, 0, 0);
  }
  to {
    transform: translate3d(-10%, 0, 0);
  }
}

.lego-launch__failed {
  height: 0;
  position: relative;
  top: 24px;
  white-space: nowrap;
}
.lego-launch__failed-actions {
  height: 0;
  position: relative;
  top: 88px;
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
