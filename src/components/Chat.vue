<template>
    <div class="h-full flex flex-col gap-2">
        <div class="h-full overflow-auto" ref="layoutContentRef">
            <ul v-if="messages.length !== 0" ref="messagesRef" class="flex flex-col gap-2">
                <li v-for="item in messages" :key="item.id" class="flex items-start gap-2" :class="{
                    'flex-row-reverse': item.from.id === auth.user?.id,
                }">
                    <NAvatar round :src="'https://random-cat-assets-r2.hats-land.com/api/v1/images?id' + item.from.id">
                    </NAvatar>
                    <div class="flex-1 flex items-start" :class="{
                        'flex-row-reverse': item.from.id === auth.user?.id,
                    }">
                        <NText depth="3">{{ item.from.name }}</NText>
                        <div class="p-2 rounded-sm" style="word-break: break-all;width: fit-content;"
                            :class="[item.from.id === auth.user?.id ? 'bg-[#020617] text-white' : 'bg-[#f1f5f9]']">
                            <NText style="white-space: pre-wrap;"
                                :style="item.from.id === auth.user?.id ? 'color: white' : ''">{{ item.content
                                }}
                            </NText>
                        </div>
                    </div>
                </li>
            </ul>
            <NEmpty v-else description="暂无消息" class="h-full justify-center"></NEmpty>
        </div>
        <NForm @submit.prevent="sendMessage" inline>
            <NInputGroup>
                <NInput placeholder="请输入" v-model:value="message" type="textarea" :autosize="{
                    minRows: 1,
                    maxRows: 5,
                }" @keydown="handleInputKeydown"></NInput>
                <NButton attr-type="submit" :disabled="!message">发送</NButton>
            </NInputGroup>
        </NForm>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, onActivated, nextTick, ref } from 'vue';
import { useAuth } from './../store'
import {
    NAvatar,
    NText,
    NButton,
    NForm,
    NInputGroup,
    NInput,
    NEmpty,
} from 'naive-ui'
import { subscribe, unsubscribe, sendMessage } from '../apis/chat-channel'

const messagesRef = ref<HTMLElement | null>()
const layoutContentRef = ref<HTMLElement | null>()

const props = defineProps<{
    roomID: number | undefined
}>()

const roomID = computed(() => {
    return Number(props.roomID)
})

const auth = useAuth()

const messages = ref<any[]>([])

const message = ref('')

onMounted(() => {
    if (!props.roomID) {
        return
    }
    subscribe(String(props.roomID), (data) => {
        if (!data) {
            return
        }
        console.log(data)
        messages.value.push(data)
        if (layoutContentRef.value && messagesRef.value) {
            nextTick(() => {
                layoutContentRef.value?.scrollTo({
                    top: messagesRef.value!.clientHeight,
                    behavior: 'smooth'
                })
            })
        }
    })
})

onUnmounted(() => {
    unsubscribe(String(props.roomID))
})

function handleInputKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        if (event.shiftKey) {
            // Shift + Enter → 插入换行（无需处理，NInput 会自动换行）
            return
        } else {
            // 只按 Enter → 阻止默认行为并发送
            event.preventDefault()
            sendMessageHandler()
        }
    }
}


function sendMessageHandler(e?: Event) {
    e?.preventDefault()
    if (!message) {
        return
    }
    sendMessage({
        'to': {
            'id': roomID.value
        },
        'content': message.value
    })
    message.value = ''
}
</script>