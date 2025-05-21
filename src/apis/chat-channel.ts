import { useWebSocket } from '@vueuse/core'
import { watch } from 'vue'

enum MessageType {
    ChatData = 0,
    Heartbeat = 1,
}

interface Message {
    type: MessageType,
    data: any,
}

const { open, data, status, send, close } = useWebSocket("/ws/chat/channel", {
    immediate: false,
    autoReconnect: true,
})

const subscribeMap = new Map<string, (data: any) => void>()

watch(data, (data) => {
    const message = JSON.parse(data) as Message
    if (message.type === MessageType.ChatData) {
        const roomID = String(message.data.to.id)
        const callback = subscribeMap.get(roomID)
        if (callback) {
            callback(message.data)
        }
    }
})

function subscribe(roomID: string, callback: (data: any) => void) {
    subscribeMap.set(roomID, callback)
}

function unsubscribe(roomID: string) {
    subscribeMap.delete(roomID)
}

function sendMessage(data: any) {
    send(JSON.stringify({
        type: MessageType.ChatData,
        data: data
    }))
}

function sendHeartbeat() {
    send(JSON.stringify({
        type: MessageType.Heartbeat,
        data: {}
    }))
}

let heartbeatInterval = 0

function start() {
    open()
    // 每30秒发送一次心跳包
    heartbeatInterval = setInterval(() => {
        if (status.value === 'OPEN') {
            sendHeartbeat()
        }
    }, 30000)
}

function stop() {
    close()
    clearInterval(heartbeatInterval)
}

export {
    subscribe,
    unsubscribe,
    sendMessage,
    start,
    stop,
    status,
}