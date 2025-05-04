<template>
    <div class="h-full flex flex-col gap-2">
        <div class="h-full overflow-auto" ref="layoutContentRef">
            <ul v-if="messages.length !== 0" ref="messagesRef" class="flex flex-col gap-2">
                <li v-for="item in messages" :key="item.id" class="flex items-start gap-2" :class="{
                    'flex-row-reverse': item.from.id === auth.user?.id,
                }">
                    <NAvatar round :src="'https://random-cat-assets-r2.hats-land.com/api/v1/images?id' + item.from.id">
                    </NAvatar>
                    <div>
                        <NText depth="3">{{ item.from.name }}</NText>
                        <div class="p-2 rounded-sm"
                            :class="[item.from.id === auth.user?.id ? 'bg-[#020617] text-white' : 'bg-[#f1f5f9]']">
                            <NText :style="item.from.id === auth.user?.id ? 'color: white' : ''">{{ item.content
                                }}
                            </NText>
                        </div>
                    </div>
                </li>
            </ul>
            <NEmpty v-else description="暂无消息" class="h-full justify-center"></NEmpty>
        </div>
        <NForm @submit="sendMessage" inline>
            <NInputGroup>
                <NInput placeholder="请输入" v-model:value="message"></NInput>
                <NButton attr-type="submit" :disabled="!message">发送</NButton>
            </NInputGroup>
        </NForm>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, nextTick, ref, watch, type Ref } from 'vue';
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

const { data, send }: {data: Ref<string>, send: (str: string) => void} = inject('chat-channel', {
    data: ref(''),
    send: () => {}
})

const messagesRef = ref<HTMLElement | null>()
const layoutContentRef = ref<HTMLElement | null>()

const props = defineProps<{
    roomID: string
}>()

const roomID = computed(() => {
    return Number(props.roomID)
})

const auth = useAuth()

const messages = ref<any[]>([])

const message = ref('')

watch(data, (val) => {
    if (!val) {
        return
    }
    const msg = JSON.parse(val)
    if (msg.to.id !== roomID.value) {
        return
    }
    messages.value.push(JSON.parse(val))
    if (layoutContentRef.value && messagesRef.value) {
        nextTick(() => {
            layoutContentRef.value?.scrollTo({
                top: messagesRef.value!.clientHeight
            })
        })
    }
})


function sendMessage(e?: Event) {
    e?.preventDefault()
    if (!message) {
        return
    }
    send(JSON.stringify({
        'to': {
            'id': roomID.value
        },
        'content': message.value
    }))
    message.value = ''
}
</script>