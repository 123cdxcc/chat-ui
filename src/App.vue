<template>
  <NNotificationProvider>
    <NMessageProvider>
      <RouterView></RouterView>
    </NMessageProvider>
  </NNotificationProvider>
</template>

<script setup lang="ts">
import { NNotificationProvider, NMessageProvider } from 'naive-ui'
import { useAuth } from './store'
import { onMounted, nextTick } from 'vue'
import { start, stop, status } from './apis/chat-channel'

const auth = useAuth()

auth.$subscribe((_, state) => {
  if (state.logged) {
    if (status.value === 'CLOSED') {
      start()
      console.debug('连接消息通道')
    }
  } else {
    if (status.value === 'OPEN' || status.value === 'CONNECTING') {
      stop()
      console.debug('关闭消息通道')
    }
  }
})

onMounted(() => {
  if (auth.logged && status.value === 'CLOSED') {
    nextTick(() => {
      start()
      console.log('连接消息通道')
    })
  }
})
</script>

<style>
#app {
  width: 100vw;
  height: 100vh;
}
</style>