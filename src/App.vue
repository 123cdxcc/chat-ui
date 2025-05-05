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
import { provide, onMounted, nextTick } from 'vue'
import { useWebSocket } from '@vueuse/core'


const auth = useAuth()

const { open, data, status, send, close } = useWebSocket("/ws/chat/channel", {
  immediate: false,
  autoReconnect: true,
})

provide('chat-channel', {
  data: data,
  send: send,
})

auth.$subscribe((_, state) => {
  if (state.logged) {
    if (status.value === 'CLOSED') {
      open()
      console.debug('连接消息通道')
    }
  } else {
    if (status.value === 'OPEN' || status.value === 'CONNECTING') {
      close()
      console.debug('关闭消息通道')
    }
  }
})

onMounted(() => {
  if (auth.logged && status.value === 'CLOSED') {
    nextTick(() => {
      open()
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