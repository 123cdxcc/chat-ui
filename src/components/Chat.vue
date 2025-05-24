<template>
    <div class="h-full flex flex-col gap-2">
        <div class="h-full overflow-auto" ref="layoutContentRef">
            <ul v-if="messages.length !== 0" ref="messagesRef" class="flex flex-col gap-2">
                <li v-for="item in messages" :key="item.id" class="flex items-start gap-2" :class="{
                    'flex-row-reverse': item.sender.id === auth.user?.id,
                }">
                    <NAvatar round :src="'https://random-cat-assets-r2.hats-land.com/api/v1/images?id' + item.sender.id">
                    </NAvatar>
                    <div class="flex-1 flex flex-col" :class="[item.sender.id === auth.user?.id ? 'items-end' : 'items-start']">
                        <NText depth="3">{{ item.sender.name }}</NText>
                        <div class="p-2 rounded-sm" style="word-break: break-all;width: fit-content;"
                            :class="[item.sender.id === auth.user?.id ? 'bg-[#020617] text-white' : 'bg-[#f1f5f9]']">
                            <NText style="white-space: pre-wrap;"
                                :style="item.sender.id === auth.user?.id ? 'color: white' : ''">{{ item.content
                                }}
                            </NText>
                        </div>
                    </div>
                </li>
            </ul>
            <NEmpty v-else description="暂无消息" class="h-full justify-center"></NEmpty>
        </div>
        <NForm @submit.prevent="sendMessageHandler" inline>
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
import { computed, onMounted, onUnmounted, nextTick, ref } from 'vue';
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
import { subscribeRoom, unsubscribeRoom, sendMessage, ChatObjectType } from '../apis/chat-channel'
import { type ChatDataOutput } from '../apis/chat-channel'
import { newUUID } from '../utils/uuid'

const messagesRef = ref<HTMLElement | null>()
const layoutContentRef = ref<HTMLElement | null>()

const props = defineProps<{
    roomID: number | undefined
}>()

const currentChatObject = computed(() => {
    return {
        id: props.roomID ?? 0,
        type: ChatObjectType.Room,
    }
})

const auth = useAuth()

const messages = ref<ChatDataOutput[]>([])

const message = ref('')

onMounted(() => {
    if (!props.roomID) {
        return
    }
    subscribeRoom(props.roomID, (data: ChatDataOutput) => {
        if (!data) {
            return
        }
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
    if (!props.roomID) {
        return
    }
    unsubscribeRoom(props.roomID)
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
        clientSeqId: newUUID(),
        senderId: auth.user?.id ?? 0,
        receiver: {
            id: currentChatObject.value.id,
            type: currentChatObject.value.type,
        },
        content: message.value
    })
    message.value = ''
}
</script>